import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BACKEND_URL } from "../config";

// The same wording the API returns, so a missing message still shows a generic
// confirmation rather than revealing whether the account exists.
const GENERIC_CONFIRMATION =
  "If an account with that email exists, a password reset link has been sent.";

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
      setConfirmation(response.data.message || GENERIC_CONFIRMATION);
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
    // Ticket 08 replaces this placeholder with the set-password form, using
    // `token` for the change. Request mode below is the only mode for now.
    return (
      <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text 3x1">Reset Password</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800 " />
        </div>
        <p className="text-center">
          This reset link is ready. Choosing a new password here is not
          available yet.
        </p>
        <Link to="/reset-password" className="cursor-pointer underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return <RequestResetForm />;
};

export default ResetPassword;
