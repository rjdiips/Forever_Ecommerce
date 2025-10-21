import { useState } from "react";
import axios from "axios";

const NewsLetterBox = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Correctly get the backend URL from your .env file
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Small check to ensure the URL is loaded correctly
    if (!backendUrl) {
      alert("Configuration error: Backend URL is not defined.");
      return;
    }

    setLoading(true);

    try {
      // The API endpoint we created on the backend
      const response = await axios.post(`${backendUrl}/api/subscribe`, {
        email,
      });
      alert(response.data.message); // Or use a nicer notification library like react-toastify
      setEmail(""); // Clear the input field on success
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Subscription failed. Please try again.";
      alert(errorMessage);
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
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
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
          className="bg-black text-white text-xs px-10 py-4 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
};

export default NewsLetterBox;
