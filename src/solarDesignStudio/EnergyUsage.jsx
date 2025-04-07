import React, { useState } from 'react';
import { FaArrowRight } from "react-icons/fa6";
import MonthlyEnergyChart from "./chart/MonthlyEnergyChart";

const EnergyUsage = ({ updateData  }) => {  // Accepting the prop here
    const handleChange = (e) => updateData("bill", e.target.value);
    return (
        <div className="w-full max-w-10/12">
            <h2 className="text-4xl font-medium mb-8">Tell us more about your energy usage.</h2>
            
            <MonthlyEnergyChart />
            <p className="text-[0.85rem] text-end text-blue-800 tracking-tight mt-2 mb-8 w-full">
            Adjust Monthly Consumption <FaArrowRight  className="inline-block" />
            </p>

            
            <p className="mt-4 text-2xl font-medium mb-5">What is your average monthly electricity bill?</p>

            <input
            type="number"
            onChange={handleChange}
            placeholder="P18,000"
            className="p-2 border rounded w-full"
            />

            <p className="text-[0.75rem] text-gray-400 tracking-tight mb-8 mt-2 text-left w-full max-w-10/12">
            We will use this info to determine the optimal system size for you.
            </p>

        </div>
    );
};

export default EnergyUsage;
