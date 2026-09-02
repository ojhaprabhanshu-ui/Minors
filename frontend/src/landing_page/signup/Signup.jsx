import React, { useState } from "react";
import background from "../../resources/images/registration2.png";
import axios from "axios";

const Signup = () => {
  const [formdata, setFormdata] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmpass: "",
    agreeterms: false,
  });

  const [errors, setErrors] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmpass: "",
    agreeterms: "",
  });

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormdata((prev) => ({
      ...prev,
      [name]: val,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const onsubmit = async (elem) => {
    elem.preventDefault();
    setApiError("");

    let newErrors = {
      fullname: "",
      email: "",
      phone: "",
      password: "",
      confirmpass: "",
      agreeterms: "",
    };

    let valid = true;

    // Full Name
    if (!formdata.fullname.trim()) {
      newErrors.fullname = "Full Name is required";
      valid = false;
    }

    // Email
    if (!formdata.email.trim()) {
      newErrors.email = "Email address is required";
      valid = false;
    }

    // Phone
    if (!formdata.phone.trim()) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else if (formdata.phone.trim().length !== 10) {
      newErrors.phone = "Contact must be exactly 10 digits";
      valid = false;
    }

    // Password
    if (!formdata.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formdata.password.length < 8 || formdata.password.length > 15) {
      newErrors.password = "Password must be 8 to 15 characters long";
      valid = false;
    }

    // Confirm Password
    if (!formdata.confirmpass) {
      newErrors.confirmpass = "Please confirm your password";
      valid = false;
    } else if (formdata.password !== formdata.confirmpass) {
      newErrors.confirmpass = "Passwords do not match";
      valid = false;
    }

    // Terms
    if (!formdata.agreeterms) {
      newErrors.agreeterms = "You must accept the terms";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          fullname: formdata.fullname,
          email: formdata.email,
          password: formdata.password,
          phone: formdata.phone,
        },
        {
          withCredentials: true,
          timeout: 10000, // 10 second timeout
        },
      );

      // backend has a typo in key: "succces" — handle both
      if (response.data.success || response.data.succces) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("API error:", error.response?.data || error.message);
      setApiError(
        error.response?.data?.message ||
          "Failed to register. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex items-stretch">
      <div className="bg-slate-50/90 backdrop-blur-md shadow-2xl px-10 py-10 h-full flex flex-col items-center justify-between border-r border-slate-200/80 z-10 shrink-0 w-[460px] overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-sm pt-4">
          <h1 className="text-3xl font-serif text-slate-900 mt-4 leading-snug">
            Let's Create an <br />
            <span className="text-slate-800 font-medium">Account for You.</span>
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-amber-800 font-semibold hover:text-amber-900 underline underline-offset-4 transition-colors"
            >
              Log In
            </a>
          </p>
        </div>

        <form onSubmit={onsubmit} className="w-full max-w-sm my-auto py-4">
          {apiError && (
            <p className="text-rose-600 text-xs font-semibold mb-3 bg-rose-50 p-2 rounded border border-rose-200 text-center">
              {apiError}
            </p>
          )}

          <div className="flex flex-col gap-3.5">
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                id="fullname"
                value={formdata.fullname}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm"
              />
              {errors.fullname && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {errors.fullname}
                </p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formdata.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm"
              />
              {errors.email && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formdata.phone}
                onChange={handleChange}
                placeholder="10-digit phone number"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm"
              />
              {errors.phone && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formdata.password}
                onChange={handleChange}
                placeholder="8 - 15 characters"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm"
              />
              {errors.password && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmpass"
                id="confirmpass"
                value={formdata.confirmpass}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm"
              />
              {errors.confirmpass && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {errors.confirmpass}
                </p>
              )}
            </div>

            <div className="w-full mt-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="agreeterms"
                  id="agreeterms"
                  checked={formdata.agreeterms}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-amber-800 focus:ring-amber-700 cursor-pointer accent-amber-900"
                />
                <label
                  htmlFor="agreeterms"
                  className="ml-2 text-xs text-slate-600 cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <a
                    href="#terms"
                    className="text-amber-800 font-semibold hover:underline"
                  >
                    Terms & Conditions
                  </a>
                </label>
              </div>
              {errors.agreeterms && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {errors.agreeterms}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-medium rounded-lg mt-3 text-sm py-2 shadow-md shadow-slate-900/10 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <div className="w-full max-w-sm text-center pb-2">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Your Brand. All rights reserved.
          </p>
        </div>
      </div>

      <div className="grow h-full bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={background}
          alt="Registration Background"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
};

export default Signup;
