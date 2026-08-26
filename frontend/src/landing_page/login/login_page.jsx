import React, { useState } from "react";
import background from "../../resources/images/registration2.png";
import { Link } from "react-router-dom";  

const Login = () => {
  const [formdata, setformdata] = useState({
    email: "",
    password: "",
  });

  const [error, seterror] = useState({
    email: "",
    password: "",
  });

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

  const onsubmit = (elem) => {
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

    setformdata({
      email: "",
      password: "",
    });

    seterror({
      email: "",
      password: "",
    });
  };

  return (
    <div className="h-screen w-full overflow-hidden flex items-stretch">
      <div className="bg-slate-50/90 backdrop-blur-md shadow-2xl px-10 py-10 h-full flex flex-col items-center justify-between border-r border-slate-200/80 z-10 shrink-0 w-[460px] overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-sm pt-4">
          <h1 className="text-3xl font-serif text-slate-900 mt-4 leading-snug">
            Welcome Back <br />
            <span className="text-slate-800 font-medium">Log in to continue.</span>
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
                <p className="text-rose-500 text-xs mt-1 font-medium">{error.email}</p>
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
                <p className="text-rose-500 text-xs mt-1 font-medium">{error.password}</p>
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