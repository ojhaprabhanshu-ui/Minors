import { useState } from "react";
import React from "react";

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
      newErrors.fullname = "Fill this field";
      isvalid = false;
    }

    if (!formdata.email.trim()) {
      newErrors.email = "Fill this field";
      isvalid = false;
    }

    if (!formdata.phone.trim()) {
      newErrors.phone = "Fill this field";
      isvalid = false;
    } else if (formdata.phone.trim().length !== 10) {
      newErrors.phone = "Contact must be 10 digits";
      isvalid = false;
    }

    if (!formdata.password.trim()) {
      newErrors.password = "Fill this field";
      isvalid = false;
    } else if (
      !(
        formdata.password.trim().length >= 8 &&
        formdata.password.trim().length <= 15
      )
    ) {
      newErrors.password = "Password must be 8 to 15 digits long";
      isvalid = false;
    }

    if (!formdata.confirmpass.trim()) {
      newErrors.confirmpass = "Fill this field";
      isvalid = false;
    } else if (formdata.password !== formdata.confirmpass) {
      newErrors.confirmpass = "Passwords do not match";
      isvalid = false;
    }

    if (!formdata.agreeterms) {
      newErrors.agreeterms = "You must agree to the terms";
      isvalid = false;
    }

    setErrors(newErrors);
    if (!isvalid) return;

    console.log("Form submitted successfully:", formdata);

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
    <div className="h-screen w-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white shadow-xl px-10 py-10 rounded-3xl flex flex-col items-center justify-center gap-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
        <form onSubmit={onsubmit}>
          <div className="flex flex-col items-center justify-center gap-3">
            {/* Full Name */}
            <div>
              <input
                type="text"
                name="fullname"
                id="fullname"
                value={formdata.fullname}
                onChange={handleChange}
                placeholder="Enter your Name"
                className="border-gray-300 border-2 rounded-md px-5 py-1 text-xl outline-none text-gray-800 focus:border-blue-500"
              />
              {errors.fullname && (
                <p className="text-red-500 text-sm">{errors.fullname}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                id="email"
                value={formdata.email}
                onChange={handleChange}
                placeholder="Enter your Email"
                className="border-gray-300 border-2 rounded-md px-5 py-1 text-xl outline-none text-gray-800 focus:border-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formdata.phone}
                onChange={handleChange}
                placeholder="Enter your Contact"
                className="border-gray-300 border-2 rounded-md px-5 py-1 text-xl outline-none text-gray-800 focus:border-blue-500"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                id="password"
                value={formdata.password}
                onChange={handleChange}
                placeholder="Set your Password"
                className="border-gray-300 border-2 rounded-md px-5 py-1 text-xl outline-none text-gray-800 focus:border-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                name="confirmpass"
                id="confirmpass"
                value={formdata.confirmpass}
                onChange={handleChange}
                placeholder="Confirm your Password"
                className="border-gray-300 border-2 rounded-md px-5 py-1 text-xl outline-none text-gray-800 focus:border-blue-500"
              />
              {errors.confirmpass && (
                <p className="text-red-500 text-sm">{errors.confirmpass}</p>
              )}
            </div>

            {/* Checkbox */}
            <div className="w-full flex flex-col items-start px-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="agreeterms"
                  id="agreeterms"
                  checked={formdata.agreeterms}
                  onChange={handleChange}
                />
                <label htmlFor="agreeterms" className="ml-2 text-gray-700">
                  I agree to the{" "}
                  <span className="text-blue-600 underline cursor-pointer">
                    Terms & Conditions
                  </span>
                </label>
              </div>
              {errors.agreeterms && (
                <p className="text-red-500 text-sm mt-1">{errors.agreeterms}</p>
              )}
            </div>

            <button
              type="submit"
              className="bg-black text-white rounded-md px-10 py-2 w-full mt-2 font-medium transition-transform duration-150 active:scale-95 hover:bg-gray-800"
            >
              Submit
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="#login"
            className="text-blue-600 font-medium hover:underline"
          >
            Log In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
