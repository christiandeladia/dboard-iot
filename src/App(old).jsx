import React, { useEffect, useState } from "react";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { AiOutlineEye } from "react-icons/ai";
// import { handleGoogleLogin } from "./Config";
import { handleSubmit } from "./Config";

const App = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    setTimeout(()=> {
      setFormVisible(true);
    } ,100)
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900 px-4 ">
      <div
        className={
          "relative bg-gray-800 text-white shadow-lg rounded-lg p-10 max-w-md w-full border border-gray-700 hover:shadow-[0_0_25px_5px_rgba(56,140,248,1)] transition duration-300 ${formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'} transform transition-all duration-500 ease-out "
        }>
          <h2 className="text-3xl font-bold text-center mb-4">Welcome Back</h2>
          <p className="text-gray-400 text-center mb-6">Login to your Account</p>
           
          {error && <p className="text-red-500 text-center mb-4">{error}</p> }

          <form onSubmit={(e) => handleSubmit(e, setError)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-300 font-medium mb-1">Email Address</label>
              <input type="email" name="email" id="email" placeholder="Enter your Email" className="w-full border-b border-b-gray-600 bg-transparent text-white px-2 py-1 focus:outline-none" required/>
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-gray-300 font-medium mb-1">Password</label>
              <input type={passwordVisible ? 'text': 'password'} name="password" id="password" placeholder="Enter your password" className="w-full border-b border-b-gray-600 bg-transparent text-white px-2 py-1 focus:outline-none" required/>
              <button type="button"  onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-2 top-8 text-gray-400 hover:text-cyan-400 focus:outline-none">
                {passwordVisible? (
                  <AiOutlineEyeInvisible className="h-5 w-5 "/>
                ) : (<AiOutlineEye className="h-5 w-5" />)}
              </button>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 focus:ring focus:ring-cyan-300 focus:outline-none shadow-md hover:shadow-lg">
                Login
            </button>

          </form>
      </div>
    </div>
  );
};

export default App;
