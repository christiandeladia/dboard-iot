import React, { useState } from 'react';
import { FaArrowRight } from "react-icons/fa6";
import MonthlyEnergyChart from "./chart/MonthlyEnergyChart";
import { AiOutlineClose } from "react-icons/ai";


const EnergyUsage = ({ updateData, selectedBill }) => {
  const [bill, setBill] = useState(selectedBill || "");
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    let value = e.target.value;
    const raw = value.replace(/,/g, "");
    if (raw.length > 2 && raw.startsWith("0")) return;
    if (!/^\d*$/.test(raw)) return;
    const formatted = Number(raw).toLocaleString();
    setBill(formatted);
    updateData("bill", formatted);
  };

  return (
    <div className="w-full max-w-10/12 relative">
      <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left">
        Solar Design Studio
      </h2>
      <h2 className="text-4xl font-medium mb-8">Tell us more about your energy usage.</h2>

      <MonthlyEnergyChart />

      <button
        onClick={() => setShowModal(true)}
        className="text-[0.85rem] text-end text-blue-800 tracking-tight mt-2 mb-8 w-full flex items-center justify-end"
      >
        Adjust Monthly Consumption <FaArrowRight className="inline-block ml-1" />
      </button>

      <p className="mt-4 text-2xl font-medium mb-5">What is your average monthly electricity bill?</p>

      <div className="relative w-full">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₱</span>
        <input
          type="text"
          value={bill}
          onChange={handleChange}
          placeholder="18,000"
          className="pl-8 p-2 border rounded w-full"
        />
      </div>

      <p className="text-[0.75rem] text-gray-400 tracking-tight mb-8 mt-2 text-left w-full max-w-10/12">
        We will use this info to determine the optimal system size for you.
      </p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto shadow-lg transition-transform transform translate-y-0">
          <div className="mb-6 flex justify-between">
            <h3 className="text-lg font-bold">Adjust Monthly Consumption</h3>
            <button
                className="text-blue-600 underline"
                onClick={() => setShowModal(false)}
              >
                <AiOutlineClose className='text-black' />
              </button>
            </div>
            {/* You can put a chart, sliders, or interactive options here */}
            {/* <MonthlyEnergyChart /> */}
            <div className="w-full h-40 bg-gray-300 mb-8 rounded-lg border-2 flex justify-center items-center">
              {/* <span className="text-gray-500">Image Placeholder</span> */}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyUsage;
