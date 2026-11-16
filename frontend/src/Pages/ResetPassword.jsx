import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import AuthShell from "../Components/AuthShell";
import Button from "../Components/Button";
import Field from "../Components/Field";
import InlineNotice from "../Components/InlineNotice";
import {
  GENERIC_PASSWORD_RESET_CONFIRMATION,
  MIN_PASSWORD_LENGTH,
  passwordTooShortMessage,
} from "@forever/shared";
import { BACKEND_URL } from "../config";
import { useAuth } from "../auth/AuthContext";

// Both auth pages end with the same way back, so a customer who took the wrong
// door is never stranded on a form.
const BackToLogin = () => (
  <Link
    to="/login"
    className="mt-6 inline-flex items-center gap-2 border-b border-current pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
  >
    <span aria-hidden="true">←</span>
    Back to sign in
  </Link>
);

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
      // so setting it here signs the User in. The redirect is the confirmation.
      setToken(response.data.data.token);
      navigate("/");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      label="Forever / Account"
      title="Set a new password."
      description={`Choose a new password of at least ${MIN_PASSWORD_LENGTH} characters.`}
    >
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
        <Field
          id="new-password"
          label="New password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
        <Field
          id="confirm-password"
          label="Confirm new password"
          type="password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />

        {error ? (
          <InlineNotice
            action={
              <Link to="/reset-password" className="underline">
                Request a new link
              </Link>
            }
          >
            {error}
          </InlineNotice>
        ) : null}

        <Button type="submit" disabled={submitting} className="mt-1 w-full">
          {submitting ? "Saving…" : "Save password"}
        </Button>

        <BackToLogin />
      </form>
    </AuthShell>
  );
};

const RequestResetForm = () => {
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

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
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <AuthShell
        label="Forever / Account"
        title="Check your email."
        description={confirmation}
      >
        <BackToLogin />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      label="Forever / Account"
      title="Reset password."
      description="Enter the email for your account and we will send you a reset link."
    >
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
        <Field
          id="reset-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        {error ? <InlineNotice>{error}</InlineNotice> : null}

        <Button type="submit" disabled={submitting} className="mt-1 w-full">
          {submitting ? "Sending…" : "Send reset link"}
        </Button>

        <BackToLogin />
      </form>
    </AuthShell>
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
