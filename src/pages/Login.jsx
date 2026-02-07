import React, { useContext, useState } from "react";
import { FiUser, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    // Main container: Centered flex layout with light gray background
    <div className="flex min-h-screen items-center justify-center bg-gray-200 p-4 font-sans">
      {/* Form Card */}
      <div className="relative w-full max-w-sm rounded-xl bg-white pb-8 pt-16 shadow-lg">
        {/* Red Circle with User Icon */}
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-red-600 p-6 shadow-md">
          <FiUser className="h-12 w-12 text-white" />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6 px-8">
          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-100 p-3 text-center text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <div className="relative rounded-md border border-gray-300 bg-gray-100 py-3 pl-4 pr-10">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent text-gray-700 placeholder-gray-500 outline-none"
                placeholder="Email"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FiUser className="h-5 w-5 text-gray-400" />
              </span>
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="relative rounded-md border border-gray-300 bg-gray-100 py-3 pl-4 pr-10">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-gray-700 placeholder-gray-500 outline-none"
                placeholder="Password"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                <FiLock className="h-5 w-5 text-gray-400" />
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            {" "}
            {/* Added some padding above the button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-md bg-red-600 py-3 text-center text-lg font-semibold uppercase text-white shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                isLoading
                  ? "cursor-not-allowed opacity-70"
                  : "hover:bg-red-700"
              }`}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>

        </form>

        {/* Forgot Password Link */}
        <p className="mt-8 text-center text-sm text-red-600 hover:underline">
          <a href="#">Forgot Password ?</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
