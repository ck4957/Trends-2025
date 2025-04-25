import React, { useState } from "react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Thanks for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Please try again later.");
    }
  };

  return (
    <div className="mt-12 bg-blue-700 dark:bg-blue-900 rounded-lg shadow-xl overflow-hidden">
      <div className="px-6 py-8 md:p-10 md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white sm:text-2xl">
            Get daily trending topics in your inbox
          </h2>
          <p className="mt-1 max-w-xl text-sm text-blue-200 dark:text-blue-300">
            Subscribe to our newsletter and never miss the daily pulse of what's
            trending around the world.
          </p>
        </div>
        <div className="mt-6 md:mt-0 md:ml-8 flex flex-col md:flex-row">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row w-full"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="px-4 py-2 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-white dark:bg-gray-800 dark:text-gray-100"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-2 md:mt-0 md:ml-3 px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-blue-700 dark:bg-gray-200 dark:text-blue-900 dark:hover:bg-gray-300"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {(status === "success" || status === "error") && (
        <div
          className={`px-6 pb-4 md:px-10 ${
            status === "success" ? "text-green-200" : "text-red-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default NewsletterSignup;
