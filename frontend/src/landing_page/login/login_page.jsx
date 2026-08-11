import React from "react";
import { useState } from "react";

const login = () => {
  const [formdata, setformdata] = useState({
    email: "",
    password: "",
  });

  const [error, seterror] = useState({
    email: "",
    password: "",
  });

  const onchange = (elem) => {
    const { name, value, type } = elem.target;
    let val = value;

    setformdata((formdata) => ({
      ...formdata,
      [name]: val,
    }));

    seterror((error) => ({
      ...error,
      [name]: "",
    }));
    console.log(elem.target.value);

  };

  const onsubmit = (elem) => {
    elem.preventDefault();
    let isvalid = true;
    let newErrors = {
      email: "",
      password: "",
    };
    if (!formdata.email.trim()) {
      newErrors.email = "Fill this field";
      isvalid = false;
    }
    if (!formdata.password.trim()) {
      newErrors.password = "Fill this field";
      isvalid = false;
    }

    seterror(newErrors);
    if(!isvalid) return ;

    setformdata({
       email: "",
      password: "",
    });

    seterror({
       email: "",
      password: "",
    });
    console.log("this is the new value in formdata" , formdata);
  };

  return (
    <div className="bg-gray-500 h-screen w-screen bg-center bg-cover   flex items-center justify-start">
      <div className="bg-white shadow-xl px-10 py-20 h-full flex flex-col items-center justify-start gap-6 border border-gray-200">
        <div className=" h-max w-max p-10 flex flex-col items-start justify-center gap-5">
         
            <h1 className="text-3xl font-serif text-gray-800">
              {" "}
              Welcome Back <br /> Log in to continue.
            </h1>
            <div className="  text-start  text-sm  text-gray-600">
              Don't have an account?{" "}
              <a
                href="#Signup"
                className="text-blue-600 font-medium hover:underline"
              >
                Register Now
              </a>
            </div>

          <form onSubmit={onsubmit}>
            <div className="flex flex-col items-center justify-center gap-3">
              <div>
                <input
                  type="text"
                  name="email"
                  id="email"
                  value={formdata.email}
                  onChange={onchange}
                  placeholder="Enter your Email"
                  className="border-gray-300 border-2 rounded-md px-8 py-1 text-md outline-none text-gray-800 focus:border-blue-500"
                />
                {error.email && (
                  <p className="text-red-500 text-sm">{error.email}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="password"
                  id="password"
                  value={formdata.password}
                  onChange={onchange}
                  placeholder="Enter your Password"
                  className="border-gray-300 border-2 rounded-md px-8 py-1 text-md outline-none text-gray-800 focus:border-blue-500"
                />
                 {error.password && (
                  <p className="text-red-500 text-sm">{error.password}</p>
                )}
              </div>
               <div className="  text-end  text-sm w-full text-gray-600">
              
              <a
                href="#forgotpassword"
                className="text-blue-600 font-medium hover:underline"
              >
                Forgot Password?
              </a>
            </div>
              <button
                type="submit"
                className="bg-black text-white rounded-md mt-2 text-md px-25 py-1 font-medium transition-transform duration-150 active:scale-95 hover:bg-gray-800"
              >
                Submit
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default login;
