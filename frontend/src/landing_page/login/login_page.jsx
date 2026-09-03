import React, { useState } from "react";
import background from "../../resources/images/registration2.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  
  const [formdata, setformdata] = useState({
    email: "",
    password: "",
  });

  const [error, seterror] = useState({
    email: "",
    password: "",
  });
  
  const [apiError, setApiError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Added modal state

  const onchange = (elem) => {
    const { name, value } = elem.target;

    setformdata((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    seterror((prevError) => ({
      ...prevError,
      [name]: "",
    }));
  };

  const onsubmit = async (elem) => {
    elem.preventDefault();
    let isvalid = true;
    let newErrors = {
      email: "",
      password: "",
    };

    if (!formdata.email.trim()) {
      newErrors.email = "Email address is required";
      isvalid = false;
    }
    if (!formdata.password.trim()) {
      newErrors.password = "Password is required";
      isvalid = false;
    }

    seterror(newErrors);
    if (!isvalid) return;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email: formdata.email,
          password: formdata.password,
        },
        {
          withCredentials: true,
        },
      );
      if (response.data.success) {
        setformdata({
          email: "",
          password: "",
        });

        seterror({
          email: "",
          password: "",
        });

        // Show the success modal instead of immediately navigating
        setShowSuccessModal(true);
      }
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Failed to login. Please try again.",
      );
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex items-stretch relative">
      
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[320px] overflow-hidden text-center flex flex-col">
            <div className="px-6 pt-10 pb-6 flex flex-col items-center">
              
              {/* Green Checkmark Icon (Matching the provided design) */}
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 relative z-10">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
                {/* Decorative elements representing the confetti in the image */}
                <div className="absolute -top-2 -left-4 w-4 h-4 border-2 border-blue-400 rounded-full border-t-transparent border-r-transparent transform -rotate-45"></div>
                <div className="absolute -bottom-1 -left-3 w-6 h-3 border-2 border-purple-400 rounded-full border-t-transparent border-r-transparent transform rotate-12"></div>
                <div className="absolute -top-1 -right-3 w-6 h-6 border-2 border-red-400 rounded-full border-b-transparent border-l-transparent"></div>
                <div className="absolute bottom-2 -right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>

              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Logged in successfully</h2>
              <p className="text-sm text-gray-500 mt-1">
                You have successfully signed into your account. You can close this window and continue using Vireza
              </p>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/");
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xl py-4 transition-colors"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-50/90 backdrop-blur-md shadow-2xl px-10 py-10 h-full flex flex-col items-center justify-between border-r border-slate-200/80 z-10 shrink-0 w-[460px] overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-sm pt-4">
          <h1 className="text-3xl font-serif text-slate-900 mt-4 leading-snug">
            Welcome Back <br />
            <span className="text-slate-800 font-medium">
              Log in to continue.
            </span>
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-amber-800 font-semibold hover:text-amber-900 underline underline-offset-4 transition-colors"
            >
              Register Now
            </Link>
          </p>
        </div>

        <form onSubmit={onsubmit} className="w-full max-w-sm my-auto py-4">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formdata.email}
                onChange={onchange}
                placeholder="name@company.com"
                className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm px-3"
              />
              {error.email && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {error.email}
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
                onChange={onchange}
                placeholder="Enter your password"
                className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm px-3"
              />
              {error.password && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {error.password}
                </p>
              )}
            </div>

            <div className="text-end text-xs w-full">
              <a
                href="#forgotpassword"
                className="text-amber-800 font-semibold hover:text-amber-900 hover:underline transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {apiError && (
              <p className="text-rose-500 text-xs font-medium bg-rose-50 p-2 rounded">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg mt-2 text-sm py-1 shadow-md shadow-slate-900/10 transition-all duration-200 active:scale-[0.98]"
            >
              Sign In
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
          alt="Login Background"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
};

export default Login;