import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMobileMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="py-5 relative z-20 bg-white shadow">
      <div className="mx-auto max-w-screen-xl px-4 flex items-center justify-between">
        {/* Logo */}
        <a className="flex items-center" href="https://blueshift.ph">
          <img
            src="https://res.cloudinary.com/deywhsg5s/image/upload/q_auto/f_auto/dpr_auto/v1737095049/main-logo_hulnzn.webp"
            alt="Logo"
            className="w-6 h-6"
          />
          <h5 className="ml-2 text-xl font-medium leading-[24px]">Blueshift</h5>
        </a>
        {/* Hamburger for mobile */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden focus:outline-none"
          aria-label="Toggle navigation"
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <ul className="flex items-center space-x-4">
            <li>
              <Link
                id="navLoginBtn"
                to="/login"
                className="border border-blue-500 text-blue-500 px-6 py-2 text-xs rounded-sm hover:bg-blue-500 hover:text-white transition"
              >
                Login
              </Link>
            </li>
            <li>
              <a
                id="navGetStartedBtn"
                href="https://blueshift.ph/public/contact"
                className="bg-blue-500 text-white px-6 py-2 text-xs rounded-sm hover:bg-blue-600 transition"
              >
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="px-4 pt-6 pb-0">
            <ul className="flex flex-col space-y-2 text-center w-full">
              <li>
                <Link
                  id="navLoginBtn"
                  to="/login"
                  className="block border border-blue-500 text-blue-500 px-3 py-2 text-sm rounded-md hover:bg-blue-500 hover:text-white transition"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  id="navGetStartedBtn"
                  to="/dashboard"
                  className="block bg-blue-500 text-white px-3 py-2 text-sm rounded-md hover:bg-blue-600 transition"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
