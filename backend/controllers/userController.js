import UserModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { waitUntil } from "@vercel/functions";
import {
  MIN_PASSWORD_LENGTH,
  passwordTooShortMessage,
} from "@forever/shared";
import { HttpError } from "../lib/http.js";
import { log } from "../lib/log.js";
import { getFrontendUrl } from "../config/frontendUrl.js";
import { emailService } from "../lib/email.js";
import {
  TOKEN_PURPOSE,
  isCurrentToken,
  isTokenExpiredError,
  signAdminSessionToken,
  signPasswordResetToken,
  signSessionToken,
  verifyPasswordResetToken,
} from "../lib/authTokens.js";

const createSessionToken = (user) =>
  signSessionToken(user._id, user.tokenVersion ?? 0);

/**
 * A real bcrypt hash, cost 10, of a password nobody is given.
 *
 * The login handler compares against this when the email is unknown. Without
 * it the unknown-email path returns almost instantly while a wrong password
 * waits for bcrypt, and that timing difference reveals which emails are
 * registered. Comparing against an existing hash costs the same as a real
 * check; hashing the submitted password here would cost far more.
 */
const DUMMY_PASSWORD_HASH =
  "$2b$10$Av7p3BsrWeGXigzWoXK54.gvIXqHZRpX12jycu3ByoCboAmpFFEoW";

/** The one failure message for a bad email, a bad password, or both. */
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

/** A reset link that is malformed, forged, or already used. */
const INVALID_RESET_LINK_MESSAGE =
  "This password reset link is invalid or has already been used. Please request a new one.";

/** A reset link that is well formed but past its 30-minute lifetime. */
const EXPIRED_RESET_LINK_MESSAGE =
  "This password reset link has expired. Please request a new one.";

// Route for user login
export const loginUser = async (req) => {
  const { email, password } = req.body;

  // Check if the user exists
  const user = await UserModel.findOne({ email });

  // Always compare, whether or not the User was found, so an unknown email
  // takes about as long as a wrong password. Only a real User's hash can match.
  const submittedPassword = typeof password === "string" ? password : "";
  const isPasswordValid = await bcrypt.compare(
    submittedPassword,
    user?.password ?? DUMMY_PASSWORD_HASH
  );

  if (!user || !isPasswordValid) {
    throw new HttpError(400, INVALID_CREDENTIALS_MESSAGE);
  }

  const token = createSessionToken(user);

  return { token, user };
};

// Route for user registration/sign-up
export const registerUser = async (req) => {
  const { name, email, password } = req.body;

  // Check if the user already exists
  const userExists = await UserModel.findOne({ email });

  if (userExists) {
    throw new HttpError(400, "User already exists");
  }

  // validating email format & strong password
  if (!validator.isEmail(email)) {
    throw new HttpError(400, "Please enter a valid email");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, passwordTooShortMessage());
  }

  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new UserModel({
    name,
    email,
    password: hashedPassword,
  });

  const savedUser = await newUser.save();

  const token = createSessionToken(savedUser);

  return { user: savedUser, token };
};

// Route for a User requesting a Password reset link
export const requestPasswordReset = async (req) => {
  const { email } = req.body;

  if (typeof email !== "string" || !validator.isEmail(email)) {
    throw new HttpError(400, "Please enter a valid email");
  }

  const user = await UserModel.findOne({ email });

  // Whether or not the account exists, the route answers with the same generic
  // confirmation. Only a real User gets an email, and a delivery failure must
  // not turn into a different response.
  if (!user) {
    return;
  }

  try {
    const token = signPasswordResetToken(user._id, user.tokenVersion ?? 0);
    const resetUrl = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;

    // Dispatch without making the response wait for the provider. An unknown
    // email already returns immediately, so awaiting delivery here would be a
    // timing oracle for whether the account exists. `waitUntil` keeps the work
    // alive in the deployed function; failures are logged and never surface.
    const delivery = emailService
      .sendPasswordResetEmail({ to: user.email, resetUrl })
      .catch((error) => {
        log.error("Password reset email failed", { error: error?.message });
      });

    waitUntil(delivery);
  } catch (error) {
    log.error("Password reset email failed", { error: error?.message });
  }
};

// Route for a User setting a new password from a Password reset link
export const resetPassword = async (req) => {
  const { token, password } = req.body ?? {};

  if (typeof token !== "string" || token === "") {
    throw new HttpError(400, INVALID_RESET_LINK_MESSAGE);
  }

  let payload;

  try {
    payload = verifyPasswordResetToken(token);
  } catch (error) {
    if (isTokenExpiredError(error)) {
      throw new HttpError(400, EXPIRED_RESET_LINK_MESSAGE);
    }

    throw new HttpError(400, INVALID_RESET_LINK_MESSAGE);
  }

  const user =
    payload.userId === undefined || payload.userId === null
      ? null
      : await UserModel.findById(payload.userId);

  // The purpose and the User's current tokenVersion must both match. A used
  // link fails here because the successful reset bumped the version.
  if (!isCurrentToken(payload, user, TOKEN_PURPOSE.PASSWORD_RESET)) {
    throw new HttpError(400, INVALID_RESET_LINK_MESSAGE);
  }

  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH
  ) {
    throw new HttpError(400, passwordTooShortMessage());
  }

  // Re-hash the new password; the plaintext is never stored.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Redeem atomically: the update only matches while the link's version is
  // still the User's current version. Two requests holding the same link both
  // pass the pre-check above, but only one can win this conditional write; the
  // other gets null and the same clear "already used" answer. The increment
  // also invalidates every existing Session token in the same write.
  const currentVersion = user.tokenVersion ?? 0;
  const versionFilter =
    currentVersion === 0
      ? { $or: [{ tokenVersion: 0 }, { tokenVersion: { $exists: false } }] }
      : { tokenVersion: currentVersion };

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: user._id, ...versionFilter },
    {
      $set: { password: hashedPassword },
      $inc: { tokenVersion: 1 },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new HttpError(400, INVALID_RESET_LINK_MESSAGE);
  }

  // Sign the User in with a Session token minted against the new version.
  return {
    token: signSessionToken(updatedUser._id, updatedUser.tokenVersion),
  };
};

// Route for admin login
export const adminLogin = async (req) => {
  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    throw new HttpError(400, "Invalid email or password");
  }

  // A 12-hour admin Session token. It carries no credentials: a token is
  // readable by its bearer, and the email and password must not travel in it.
  const token = signAdminSessionToken();

  return { token };
};
