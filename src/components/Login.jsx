import React, { useEffect, useState } from "react";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import logo from '../assets/img/logo/logo.png';
import { useNavigate } from "react-router-dom";
import { handleSubmit, auth } from "../Config"; // Import the updated function
import { onAuthStateChanged } from "firebase/auth";


const Login = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate(); // Initialize navigation

  // Redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard"); // Redirect if already logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setTimeout(() => {
      setFormVisible(true);
    }, 100);
  }, []);

 return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div
        className={
          "relative bg-white text-black shadow-lg rounded-lg p-10 max-w-md w-full border-0 border-gray-700 shadow-gray-400  " +
          (formVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 transform transition-all duration-500 ease-out")
        }
      >
        <div className="flex justify-center">
          <img
            className="mb-2"
            src={logo}
            alt="Blueshift"
            width="50"
            height="50"
          />
        </div>
        <h2 className="text-3xl font-medium text-center mb-2">Blueshift</h2>
        <p className="text-gray-500 text-center mb-10">One account for everything with us.</p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={(e) => handleSubmit(e, setError, navigate)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your Email"
              className="w-full border-b border-b-gray-600 bg-transparent text-black px-2 py-1 focus:outline-none"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Enter your password"
              className="w-full border-b border-b-gray-600 bg-transparent text-black px-2 py-1 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-2 top-8 text-gray-400 hover:text-cyan-400 focus:outline-none"
            >
              {passwordVisible ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 focus:ring focus:ring-cyan-300 focus:outline-none shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;