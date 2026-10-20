import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "../toast/toast";
import { BACKEND_URL } from "../config";
import { fireConfetti } from "../lib/confetti";

const NewsLetterBox = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      // The API endpoint we created on the backend
      const response = await axios.post(`${BACKEND_URL}/api/subscribe`, {
        email,
      });
      fireConfetti(formRef.current);
      toast.success(response.data.message, {
        title: "You're on the list.",
      });
      setEmail(""); // Clear the input field on success
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Subscription failed. Please try again.";
      toast.error(errorMessage);
      console.error("Subscription error:", error);
    } finally {
      setLoading(false); // Ensure loading is turned off
    }
  };

  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>
      <p className="text-gray-500 mt-3">
        Be the first to know about new arrivals, sales & promos!
      </p>

      <form
        ref={formRef}
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 !border border-gray-400 pl-3"
      >
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full sm:flex-1 outline-none "
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-black text-white text-xs px-10 py-4 transition-colors disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "SUBSCRIBING..." : "SUBSCRIBE"}
        </button>
      </form>
    </div>
  );
};

export default NewsLetterBox;
