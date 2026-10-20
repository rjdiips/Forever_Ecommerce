import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  GENERIC_PASSWORD_RESET_CONFIRMATION,
  MIN_PASSWORD_LENGTH,
  passwordTooShortMessage,
} from "@forever/shared";
import { BACKEND_URL } from "../config";
import { useAuth } from "../auth/AuthContext";

const SetPasswordForm = ({ token }) => {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");

    // Check before the request so a typo costs nothing and the User sees which
    // rule they broke.
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(passwordTooShortMessage());
      return;
    }

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        BACKEND_URL + "/api/user/reset-password",
        { token, password }
      );

      // The API returns a fresh Session token minted after the version bump,
      // so setting it here signs the User in.
      setToken(response.data.data.token);
      toast.success("Password reset successful. You are now signed in.");
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text 3x1">Set a New Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800 " />
      </div>

      <p className="text-center text-sm text-gray-600">
        Choose a new password of at least {MIN_PASSWORD_LENGTH} characters.
      </p>

      <div className="w-full px-3 py-2 flex flex-col gap-4">
        <input
          onChange={(event) => setPassword(event.target.value)}
          value={password}
          type="password"
          className="w-full px-3 py-2 !border border-gray-880"
          placeholder="New password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        <input
          onChange={(event) => setConfirmation(event.target.value)}
          value={confirmation}
          type="password"
          className="w-full px-3 py-2 !border border-gray-880"
          placeholder="Confirm new password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />

        {error ? (
          <div className="text-sm text-red-700" role="alert">
            <p>{error}</p>
            <Link to="/reset-password" className="underline">
              Request a new link
            </Link>
          </div>
        ) : null}

        <button
          disabled={submitting}
          className="w-1/2 m-auto bg-black text-white px-8 py-2 mt-4 cursor-pointer disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Set New Password"}
        </button>
      </div>
    </form>
  );
};

const RequestResetForm = () => {
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(
        BACKEND_URL + "/api/user/forgot-password",
        { email }
      );
      // The shared fallback matches the API, so a missing message still shows a
      // generic confirmation rather than revealing whether the account exists.
      setConfirmation(
        response.data.message || GENERIC_PASSWORD_RESET_CONFIRMATION
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text 3x1">Check Your Email</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800 " />
        </div>
        <p className="text-center">{confirmation}</p>
        <Link to="/login" className="cursor-pointer underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text 3x1">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800 " />
      </div>

      <p className="text-center text-sm text-gray-600">
        Enter the email for your account and we will send you a reset link.
      </p>

      <div className="w-full px-3 py-2 flex flex-col gap-4">
        <input
          onChange={(event) => setEmail(event.target.value)}
          value={email}
          type="email"
          className="w-full px-3 py-2 !border border-gray-880"
          placeholder="Email"
          required
        />
        <button
          disabled={submitting}
          className="w-1/2 m-auto bg-black text-white px-8 py-2 mt-4 cursor-pointer disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send Reset Link"}
        </button>
      </div>
    </form>
  );
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (token) {
    return <SetPasswordForm token={token} />;
  }

  return <RequestResetForm />;
};

export default ResetPassword;
