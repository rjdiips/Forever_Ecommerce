import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import InlineNotice from "../Components/InlineNotice";
import { MIN_PASSWORD_LENGTH } from "@forever/shared";
import { useAuth, SESSION_EXPIRED_NOTIFIED_KEY } from "../auth/AuthContext";
import { BACKEND_URL } from "../config";

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
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text 3x1"> {currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800 " />
      </div>

      <div className="w-full px-3 py-2 flex flex-col gap-4">
        {currentState === "Login" ? null : (
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            className="w-full px-3 py-2 !border border-gray-880"
            placeholder="Name"
            required
          />
        )}

        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          className="w-Full px-3 py-2 !border border-gray-880"
          placeholder="Email"
          required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          className="w-Full px-3 py-2 !border border-gray-880"
          placeholder="Password"
          minLength={
            currentState === "Sign Up" ? MIN_PASSWORD_LENGTH : undefined
          }
          required
        />

        <div className="w-full flex justify-between text-sm mt-[-8px]">
          <Link to="/reset-password" className="cursor-pointer">
            Forgot your password?
          </Link>
          {currentState === "Login" ? (
            <p
              onClick={() => setCurrentState("Sign Up")}
              className="cursor-pointer"
            >
              Create Account
            </p>
          ) : (
            <p
              onClick={() => setCurrentState("Login")}
              className="cursor-pointer"
            >
              Login Here
            </p>
          )}
        </div>
        <button className="w-1/2 m-auto bg-black text-white px-8 py-2 mt-4 cursor-pointer ">
          {currentState === "Login" ? "Sign In" : "Sign Up"}
        </button>

        {error ? <InlineNotice>{error}</InlineNotice> : null}
      </div>
    </form>
  );
};

export default Login;
