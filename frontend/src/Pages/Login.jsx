import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import AuthShell from "../Components/AuthShell";
import Button from "../Components/Button";
import Field from "../Components/Field";
import InlineNotice from "../Components/InlineNotice";
import { MIN_PASSWORD_LENGTH } from "@forever/shared";
import { useAuth, SESSION_EXPIRED_NOTIFIED_KEY } from "../auth/AuthContext";
import { BACKEND_URL } from "../config";

const COPY = {
  Login: {
    label: "Forever / Members",
    title: "Sign in.",
    description:
      "Your bag, your orders and your details are waiting. Sign in to pick up where you left off.",
    action: "Sign in",
    switchAction: "Create account",
  },
  "Sign Up": {
    label: "Forever / Join",
    title: "Create account.",
    description:
      "Keep your details for next time and every order in one place.",
    action: "Create account",
    switchAction: "Sign in",
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { token, setToken } = useAuth();
  const [currentState, setCurrentState] = useState("Login");
  // Rejections belong to the form the customer is looking at (ADR-0008). The
  // redirect and the account icon are the confirmation of a success.
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const copy = COPY[currentState];

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(BACKEND_URL + "/api/user/register", {
          name,
          email,
          password,
        });

        if (response.data.success) {
          setToken(response.data.data.token);
          localStorage.removeItem(SESSION_EXPIRED_NOTIFIED_KEY);
        } else {
          setError(
            response.data.message ||
              "We couldn't create your account. Please try again."
          );
        }
      } else {
        const response = await axios.post(BACKEND_URL + "/api/user/login", {
          email,
          password,
        });

        if (response.data.success) {
          setToken(response.data.data.token);
          localStorage.removeItem(SESSION_EXPIRED_NOTIFIED_KEY);
        } else {
          setError(response.data.message || "Those details did not match.");
        }
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We couldn't reach Forever. Check your connection and try again."
      );
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <AuthShell {...copy}>
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-5">
        {currentState === "Login" ? null : (
          <Field
            id="account-name"
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
          />
        )}

        <Field
          id="account-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <Field
          id="account-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={
            currentState === "Login" ? "current-password" : "new-password"
          }
          minLength={
            currentState === "Sign Up" ? MIN_PASSWORD_LENGTH : undefined
          }
          hint={
            currentState === "Sign Up"
              ? `At least ${MIN_PASSWORD_LENGTH} characters.`
              : null
          }
          required
        />

        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
          <Link
            to="/reset-password"
            className="border-b border-current pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
          >
            Forgot your password?
          </Link>

          <button
            type="button"
            onClick={() =>
              setCurrentState(currentState === "Login" ? "Sign Up" : "Login")
            }
            className="group flex items-center gap-2 border-b border-current pb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
          >
            {copy.switchAction}
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </button>
        </div>

        {error ? <InlineNotice>{error}</InlineNotice> : null}

        <Button type="submit" className="mt-1 w-full">
          {copy.action}
        </Button>
      </form>
    </AuthShell>
  );
};

export default Login;
