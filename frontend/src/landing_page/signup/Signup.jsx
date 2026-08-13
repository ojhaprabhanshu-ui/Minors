import React, { useState } from "react";
import background from "../../resources/images/registration2.png";

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

  const onsubmit = (elem) => {
    elem.preventDefault();
    let isvalid = true;
    let newErrors = {
      fullname: "",
      email: "",
      phone: "",
      password: "",
      confirmpass: "",
      agreeterms: "",
    };

    if (!formdata.fullname.trim()) {
      newErrors.fullname = "Full Name is required";
      isvalid = false;
    }

    if (!formdata.email.trim()) {
      newErrors.email = "Email address is required";
      isvalid = false;
    }

    if (!formdata.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isvalid = false;
    } else if (formdata.phone.trim().length !== 10) {
      newErrors.phone = "Contact must be exactly 10 digits";
      isvalid = false;
    }

    if (!formdata.password.trim()) {
      newErrors.password = "Password is required";
      isvalid = false;
    } else if (
      !(
        formdata.password.trim().length >= 8 &&
        formdata.password.trim().length <= 15
      )
    ) {
      newErrors.password = "Password must be 8 to 15 characters long";
      isvalid = false;
    }

    if (!formdata.confirmpass.trim()) {
      newErrors.confirmpass = "Please confirm your password";
      isvalid = false;
    } else if (formdata.password !== formdata.confirmpass) {
      newErrors.confirmpass = "Passwords do not match";
      isvalid = false;
    }

    if (!formdata.agreeterms) {
      newErrors.agreeterms = "You must accept the terms";
      isvalid = false;
    }

    setErrors(newErrors);
    if (!isvalid) return;

    setFormdata({
      fullname: "",
      email: "",
      phone: "",
      password: "",
      confirmpass: "",
      agreeterms: false,
    });

    setErrors({
      fullname: "",
      email: "",
      phone: "",
      password: "",
      confirmpass: "",
      agreeterms: "",
    });
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
              href="#login"
              className="text-amber-800 font-semibold hover:text-amber-900 underline underline-offset-4 transition-colors"
            >
              Log In
            </a>
          </p>
        </div>

        
        <form onSubmit={onsubmit} className="w-full max-w-sm my-auto py-4">
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
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.fullname}</p>
              )}
            </div>

            {/* Email */}
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
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email}</p>
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
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.phone}</p>
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
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.password}</p>
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
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.confirmpass}</p>
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
                  <a href="#terms" className="text-amber-800 font-semibold hover:underline">
                    Terms & Conditions
                  </a>
                </label>
              </div>
              {errors.agreeterms && (
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.agreeterms}</p>
              )}
            </div>

            
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg mt-3 text-sm py-2.5 shadow-md shadow-slate-900/10 transition-all duration-200 active:scale-[0.98]"
            >
              Create Account
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