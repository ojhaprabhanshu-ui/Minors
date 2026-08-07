import { useState } from "react";
import React from "react";
import bgImage from "../../resources/images/registration_bg.jpg";

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
    {
      if (!formdata.phone.trim()) {
        newErrors.phone = "Fill this field";
        isvalid = false;
      } else if (!(formdata.phone.trim().length == 10)) {
        newErrors.phone = "contact must be 10 digits";
        isvalid = false;
      }
    }
    {
      if (!formdata.password.trim()) {
        newErrors.password = "Fill this field";
        isvalid = false;
      } else if (
        !(
          formdata.password.trim().length > 8 &&
          formdata.password.trim().length < 15
        )
      ) {
        newErrors.password = "password must be  8 to 15 digits long ";
        isvalid = false;
      }
    }

    {
      if (!formdata.confirmpass.trim()) {
        newErrors.confirmpass = "Fill this field";
        isvalid = false;
      } else if (!(formdata.password === formdata.confirmpass)) {
        newErrors.confirmpass = "invalid password";
        isvalid = false;
      }
    }
    if (!formdata.agreeterms) {
      newErrors.agreeterms = "Fill this field";
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
    console.log("form submitted");
    console.log(formdata);
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center "
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="text-white h-max w-max backdrop-blur-md px-10 py-10 rounded-3xl flex flex-col items-center jusify-center gap-10 ">
        <h1 className="text-2xl font-bold ">Create an Account</h1>
        <form
          onSubmit={(elem) => {
            onsubmit(elem);
          }}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            {/* 
            full name input */}
            <div>
              <input
                type="text"
                name="fullname"
                id="fullname"
                value={formdata.fullname}
                onChange={(elem) => {
                  const val = elem.target.value;
                  setFormdata((formdata) => ({
                    ...formdata,
                    fullname: val,
                  }));
                  setErrors((errors) => ({
                    ...errors,
                    fullname: "",
                  }));
                }}
                placeholder="Enter your Name"
                className="border-white border-2 rounded-md px-5 py-1 text-xl outline-none"
              />
              {errors.fullname && (
                <p className="text-red-500 text-sm">{errors.fullname}</p>
              )}
            </div>

            {/* email input */}
            <div>
              <input
                type="text"
                value={formdata.email}
                onChange={(elem) => {
                  const val = elem.target.value;

                  setFormdata((formdata) => ({
                    ...formdata,
                    email: val,
                  }));
                  setErrors((errors) => ({
                    ...errors,
                    email: "",
                  }));
                }}
                placeholder="Enter your Email"
                className="border-white border-2 rounded-md px-5 py-1 text-xl outline-none"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            {/* phone input */}
            <div>
              <input
                type="tel"
                value={formdata.phone}
                onChange={(elem) => {
                  const val = elem.target.value;

                  setFormdata((formdata) => ({
                    ...formdata,
                    phone: val,
                  }));
                  setErrors((errors) => ({
                    ...errors,
                    phone: "",
                  }));
                }}
                placeholder="Enter your Contact"
                className="border-white border-2 rounded-md px-5 py-1 text-xl outline-none"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>

            {/* password input */}
            <div>
              <input
                type="password"
                value={formdata.password}
                onChange={(elem) => {
                  const val = elem.target.value;

                  setFormdata((formdata) => ({
                    ...formdata,
                    password: val,
                  }));
                  setErrors((errors) => ({
                    ...errors,
                    password: "",
                  }));
                }}
                placeholder="Set your Password"
                className="border-white border-2 rounded-md px-5 py-1 text-xl outline-none"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* confirmpass input */}
            <div>
              <input
                type="password"
                value={formdata.confirmpass}
                onChange={(elem) => {
                  const val = elem.target.value;

                  setFormdata((formdata) => ({
                    ...formdata,
                    confirmpass: val,
                  }));
                  setErrors((errors) => ({
                    ...errors,
                    confirmpass: "",
                  }));
                }}
                placeholder="Confirm your Password"
                className="border-white border-2 rounded-md px-5 py-1 text-xl outline-none "
              />
              {errors.confirmpass && (
                <p className="text-red-500 text-sm">{errors.confirmpass}</p>
              )}
            </div>

            {/* checkbox */}
            <div>
              <input
                type="checkbox"
                name="agreeterms"
                id="agreeterms"
                checked={formdata.agreeterms}
                onChange={(elem) => {
                  const val = elem.target.value;

                  setFormdata((formdata) => ({
                    ...formdata,
                    agreeterms: val,
                  }));
                  setErrors((errors) => ({
                    ...errors,
                    agreeterms: "",
                  }));
                }}
              />
              <label htmlFor="agreeTerms" className="ml-2 text-black">
                I agree to the{" "}
                <span className="text-blue-600 underline cursor-pointer ">
                  Terms & Conditions
                </span>
              </label>
              {errors.agreeterms && (
                <p className="text-red-500 text-sm">{errors.agreeterms}</p>
              )}
            </div>
            <button className="bg-white border-2 text-black border-black rounded-md px-27 py-1 transition-transform duration-20 active:scale-95 active:bg-gray-100">
              Submit
            </button>
          </div>
        </form>
        <div className="text-center -mt-7 text-sm text-black ">
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
