import React, { useState, useEffect } from 'react';
import { FaArrowRight } from "react-icons/fa6";
import MonthlyEnergyChart from "./chart/MonthlyEnergyChart";
import { AiOutlineClose } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { MdTextsms } from "react-icons/md";
import { MdCall } from "react-icons/md";

const EnergyUsage = ({ updateData, selectedBill }) => {
  const [bill, setBill] = useState(selectedBill || "");
  const [showModal, setShowModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  

  // Helper function to compute the slider/chart max value based on the bill input
  const computeSliderMax = (billValue) => {
    const numericBill = billValue ? Number(billValue.replace(/,/g, "")) : 10000;
    if (numericBill <= 10000) return 50;
    if (numericBill <= 20000) return 100;
    if (numericBill <= 30000) return 150;
    if (numericBill <= 50000) return 250;
    if (numericBill <= 100000) return 400;
    if (numericBill <= 200000) return 700;
    return 1000;
  };

  // Compute the slider maximum using the current bill input
  const computedSliderMax = computeSliderMax(bill);

  // Generate random daily consumption values for 31 days between 0 and computedSliderMax
  const generateRandomConsumption = () =>
    Array.from({ length: 31 }, () =>
      Math.floor(Math.random() * computedSliderMax)
    );

  // Initialize dailyConsumption using generated random values
  const [dailyConsumption, setDailyConsumption] = useState(generateRandomConsumption);

  const handleChange = (e) => {
    let value = e.target.value;
    const raw = value.replace(/,/g, "");
    if (raw.length > 2 && raw.startsWith("0")) return;
    if (!/^\d*$/.test(raw)) return;
    const formatted = Number(raw).toLocaleString();
    setBill(formatted);
    updateData("bill", formatted);
  };

  const handleSliderChange = (index, value) => {
    const newConsumption = [...dailyConsumption];
    newConsumption[index] = value;
    setDailyConsumption(newConsumption);
  };


  const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const getWeeklyGroupedConsumption = () => {
    const weeks = [];
    for (let i = 0; i < 31; i += 7) {
      weeks.push(dailyConsumption.slice(i, i + 7));
    }
    return weeks;
  };



  const computeWeekdayAverages = () => {
    const sums = Array(7).fill(0);
    const counts = Array(7).fill(0);
  
    dailyConsumption.forEach((value, index) => {
      const dayOfWeek = index % 7; // 0=Monday, 1=Tuesday, ..., 6=Sunday
      sums[dayOfWeek] += value;
      counts[dayOfWeek]++;
    });
  
    return sums.map((total, i) => Math.round(total / counts[i]));
  };
  const [weekdayAverages, setWeekdayAverages] = useState(computeWeekdayAverages());
  useEffect(() => {
    if (showModal) {
      setWeekdayAverages(computeWeekdayAverages());
    }
  }, [showModal]);
  const handleWeekdaySliderChange = (dayIndex, newValue) => {
    const updated = [...dailyConsumption];
  
    for (let i = dayIndex; i < updated.length; i += 7) {
      updated[i] = newValue;
    }
  
    setDailyConsumption(updated);
  
    const newAverages = [...weekdayAverages];
    newAverages[dayIndex] = newValue;
    setWeekdayAverages(newAverages);
  };
  
  return (
    <div className="w-full max-w-10/12 relative">
      <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left">
        Solar Design Studio
      </h2>
      <h2 className="text-4xl font-medium mb-8">Tell us more about your energy usage.</h2>

      {/* Pass dailyConsumption and computedSliderMax to the chart */}
      <MonthlyEnergyChart dailyConsumption={dailyConsumption} sliderMax={computedSliderMax} />

      <button
        onClick={() => setShowModal(true)}
        className="text-[0.85rem] text-end text-blue-800 tracking-tight mt-2 mb-8 w-full flex items-center justify-end"
      >
        Adjust Monthly Consumption <FaArrowRight className="inline-block ml-1" />
      </button>

      <p className="mt-4 text-2xl font-medium">What is your average monthly electricity bill?</p>

      <button
       onClick={() => setShowHelpModal(true)}
        className="text-[0.85rem] text-end text-blue-800 tracking-tight mb-5 w-full flex items-center underline"
      >
        Don’t know yet?
      </button>
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

      {/* Modal for adjusting daily consumption */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto shadow-lg transition-transform transform translate-y-0">
            <div className="mb-6 flex justify-between">
              <h3 className="text-lg font-bold">Adjust Monthly Consumption</h3>
              <button onClick={() => setShowModal(false)}>
                <AiOutlineClose className='text-black text-2xl' />
              </button>
            </div>

            <div className="w-full space-y-6">
              {weekdayAverages.map((value, dayIndex) => (
                <div key={dayIndex} className="flex flex-col gap-2 mb-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{dayLabels[dayIndex]}</span>
                    <span>{value} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={computedSliderMax}
                    value={value}
                    onChange={(e) => handleWeekdaySliderChange(dayIndex, Number(e.target.value))}
                    className="w-full bg-white"
                    style={{ accentColor: "#8884d8" }}
                  />
                </div>
              ))}
            </div>


          </div>
        </div>
      )}


{showHelpModal && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
    <div className="bg-white w-11/12 max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-lg transition-transform transform translate-y-0">
      <div className="mb-6 flex justify-between">
        <h3 className="text-lg font-bold">Need Help Estimating?</h3>
        <button onClick={() => setShowHelpModal(false)}>
          <AiOutlineClose className="text-black text-2xl" />
        </button>
      </div>

      <p className="text-gray-700 mb-6">
        Not sure how much your electricity bill is? Would you like us to assist you via:
      </p>

      <div className="flex space-x-2 justify-center w-full">
        {/* Email Assistance */}
        <a
          href="mailto:support@example.com?subject=Assistance Needed"
          className="flex-1 block"
        >
          <button className="w-full bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200 transition flex items-center justify-center space-x-2">
            <MdEmail className="inline-block" />
            <span>Email</span>
          </button>
        </a>
        
        {/* Text Me */}
        <a href="sms:1234567890" className="flex-1 block">
          <button className="w-full bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200 transition flex items-center justify-center space-x-2">
            <MdTextsms className="inline-block" />
            <span>Text</span>
          </button>
        </a>
        
        {/* Call Me */}
        <a href="tel:1234567890" className="flex-1 block">
          <button className="w-full bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200 transition flex items-center justify-center space-x-2">
            <MdCall className="inline-block" />
            <span>Call</span>
          </button>
        </a>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default EnergyUsage;
