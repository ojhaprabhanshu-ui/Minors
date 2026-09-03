import React, { useState } from "react";

const Personaldetails = ({ formData, setFormData, nextStep }) => {
  const [errors, setErrors] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error on user input
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();

    let newErrors = {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
    };

    let valid = true;

    // First Name
    if (!formData.firstname?.trim()) {
      newErrors.firstname = "First Name is required";
      valid = false;
    }

    // Last Name
    if (!formData.lastname?.trim()) {
      newErrors.lastname = "Last Name is required";
      valid = false;
    }

    // Email
    if (!formData.email?.trim()) {
      newErrors.email = "Email Address is required";
      valid = false;
    }

    // Phone Validation
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone Number is required";
      valid = false;
    } else if (formData.phone.trim().length !== 10) {
      newErrors.phone = "Contact must be exactly 10 digits";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) return;
    nextStep();
  };

  return (
    <form onSubmit={handleNext} className="w-full max-w-sm mx-auto py-4">
      <h2 className="text-2xl font-serif text-slate-900 mb-4">
        Step 1: <span className="font-medium">Personal Details</span>
      </h2>

      <div className="flex flex-col gap-3.5">
        {/* First Name */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            First Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            value={formData.firstname || ""}
            onChange={handleChange}
            placeholder="John"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm"
          />
          {errors.firstname && (
            <p className="text-rose-500 text-xs mt-1 font-medium">
              {errors.firstname}
            </p>
          )}
        </div>

        {/* Middle Name (Optional) */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Middle Name
          </label>
          <input
            type="text"
            name="middlename"
            id="middlename"
            value={formData.middlename || ""}
            onChange={handleChange}
            placeholder="William"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm"
          />
        </div>

        {/* Last Name */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Last Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            value={formData.lastname || ""}
            onChange={handleChange}
            placeholder="Doe"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm"
          />
          {errors.lastname && (
            <p className="text-rose-500 text-xs mt-1 font-medium">
              {errors.lastname}
            </p>
          )}
        </div>

        {/* Date of Birth (Optional) */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateofbirth"
            id="dateofbirth"
            value={formData.dateofbirth || ""}
            onChange={handleChange}
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm"
          />
        </div>

        {/* Email Address */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email || ""}
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

        {/* Address (Optional) */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address || ""}
            onChange={handleChange}
            placeholder="123 Street Name, City"
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm"
          />
        </div>

        {/* Contact Number */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Contact Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone || ""}
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

        {/* Professional Summary (Optional) */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Professional Summary / Objective
            <span className="ml-1.5 font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            name="summary"
            id="summary"
            rows="4"
            value={formData.summary || ""}
            onChange={handleChange}
            placeholder="Two or three lines about who you are and what you are looking for next..."
            className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10 shadow-sm resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg mt-3 text-sm py-2 shadow-md shadow-slate-900/10 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Next Step
        </button>
      </div>
    </form>
  );
};

export default Personaldetails;