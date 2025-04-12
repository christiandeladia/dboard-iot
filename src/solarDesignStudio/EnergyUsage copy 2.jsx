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

  // New helper function to compute the slider/chart max value:
  // It divides the bill input (after stripping commas) by 12.65 and rounds it off.
  const computeSliderMax = (billValue) => {
    const numericBill = billValue ? Number(billValue.replace(/,/g, "")) : 10000;
    return Math.round(numericBill / 12.65);
  };

  // Compute the slider maximum using the current bill input.
  const computedSliderMax = computeSliderMax(bill);

  // Generate random daily consumption values for 31 days between 0 and computedSliderMax.
  const generateRandomConsumption = () => {
    // Generate 31 random numbers.
    const randomValues = Array.from({ length: 31 }, () => Math.random());
    const total = randomValues.reduce((acc, value) => acc + value, 0);
    // Scale each random value so that the total equals computedSliderMax.
    return randomValues.map(value => Math.round((value / total) * computedSliderMax));
  };
  

  // Initialize dailyConsumption using generated random values.
  const [dailyConsumption, setDailyConsumption] = useState(generateRandomConsumption);

  const handleDataChange = (newData) => {
    setDailyConsumption(newData);
  };

  const handleChange = (e) => {
    let value = e.target.value;
    const raw = value.replace(/,/g, "");
    if (raw.length > 2 && raw.startsWith("0")) return;
    if (!/^\d*$/.test(raw)) return;
    const formatted = Number(raw).toLocaleString();
    setBill(formatted);
    updateData("bill", formatted);
  };

    // When computedSliderMax changes (i.e. when the bill input changes),
  // regenerate dailyConsumption so that their total matches the new max.
  useEffect(() => {
    setDailyConsumption(generateRandomConsumption());
  }, [computedSliderMax]);

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
  
  // Compute how many times each weekday occurs (0=Monday, …,6=Sunday)
  const weekdayCounts = Array(7).fill(0);
  dailyConsumption.forEach((_, idx) => {
    weekdayCounts[idx % 7]++;
  });

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

// Assume computedSliderMax, dailyConsumption, setDailyConsumption, weekdayAverages, setWeekdayAverages,
// dayLabels, and showModal are defined as in your component.

// New state: an array of 7 percentages, one for each weekday, initialized to equal distribution.
const initialPercentages = Array(7).fill(100 / 7);
const [weekdayPercentages, setWeekdayPercentages] = useState(initialPercentages);

/**
 * When a slider for a given day (dayIndex) is changed, update its percentage value,
 * and automatically adjust the remaining days so that the total remains 100.
 */
const handleWeekdaySliderChange = (dayIndex, newPercentage) => {
  // Get the old percentages.
  const oldPercentages = [...weekdayPercentages];
  const oldValue = oldPercentages[dayIndex];
  // Calculate the difference.
  const delta = newPercentage - oldValue;
  
  // Sum of the other days.
  const totalOthersOld = oldPercentages.reduce(
    (sum, val, idx) => idx === dayIndex ? sum : sum + val,
    0
  );
  
  // Copy and update the chosen day's percentage.
  const updatedPercentages = [...oldPercentages];
  updatedPercentages[dayIndex] = newPercentage;
  const remaining = 100 - newPercentage;
  
  // Redistribute for other days proportionally.
  if (totalOthersOld > 0) {
    for (let j = 0; j < updatedPercentages.length; j++) {
      if (j !== dayIndex) {
        updatedPercentages[j] = (oldPercentages[j] / totalOthersOld) * remaining;
      }
    }
  } else {
    for (let j = 0; j < updatedPercentages.length; j++) {
      if (j !== dayIndex) {
        updatedPercentages[j] = 0;
      }
    }
  }
  setWeekdayPercentages(updatedPercentages);
  
  // Update dailyConsumption using each weekday's allowed maximum.
  const updatedConsumption = [...dailyConsumption];
  updatedPercentages.forEach((percent, j) => {
    const dayMax = weekdayCounts[j] ? computedSliderMax / weekdayCounts[j] : 0;
    const newValueKwh = Math.round((percent / 100) * dayMax);
    // Update every occurrence of weekday j.
    for (let i = j; i < updatedConsumption.length; i += 7) {
      updatedConsumption[i] = newValueKwh;
    }
  });
  setDailyConsumption(updatedConsumption);
  
  // Update weekdayAverages to reflect new values.
  setWeekdayAverages(updatedPercentages.map((percent, j) => {
    const dayMax = weekdayCounts[j] ? computedSliderMax / weekdayCounts[j] : 0;
    return Math.round((percent / 100) * dayMax);
  }));
};


  

  return (
    <div className="w-full max-w-10/12 relative">
      <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left">
        Solar Design Studio
      </h2>
      <h2 className="text-4xl font-medium mb-8">Tell us more about your energy usage.</h2>

      {/* Pass dailyConsumption and computedSliderMax to the chart */}
      <MonthlyEnergyChart 
        dailyConsumption={dailyConsumption} 
        sliderMax={computedSliderMax} 
        onDataChange={handleDataChange} 
      />

      <button
        onClick={() => setShowModal(true)}
        className="text-[0.85rem] text-end text-blue-800 tracking-tight mt-2 w-full flex items-center justify-end"
      >
        Adjust Monthly Consumption <FaArrowRight className="inline-block ml-1" />
      </button>

      <p className="mt-4 text-2xl font-medium">What is your average monthly electricity bill?</p>

      <button
        onClick={() => setShowHelpModal(true)}
        className="text-[0.85rem] text-end text-blue-800 tracking-tight mb-5 flex items-center underline"
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
          <AiOutlineClose className="text-black text-2xl" />
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mb-3">
        Monthly consumption: {computedSliderMax} kWh total.
      </p>
      
      <div className="w-full space-y-6">
        {dayLabels.map((label, dayIndex) => {
          // Determine how many times this weekday appears.
          const count = weekdayCounts[dayIndex] || 1;
          // Compute the maximum allowed kWh for this day.
          const dayMax = Math.round(computedSliderMax / count);
          // Get the current average consumption for this weekday.
          const currentAvg = weekdayAverages[dayIndex] || 0;
          // Calculate the percentage, capped at 100.
          const currentPercentage = dayMax
            ? Math.min(Math.round((currentAvg / dayMax) * 100), 100)
            : 0;
          return (
            <div key={dayIndex} className="flex flex-col gap-2 mb-3">
              <div className="flex justify-between text-sm font-medium">
                <span>{label}</span>
                <span>
                  {currentPercentage}% ({currentAvg} kWh)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentPercentage}
                onChange={(e) =>
                  handleWeekdaySliderChange(dayIndex, Number(e.target.value))
                }
                className="w-full bg-white"
                style={{ accentColor: "#8884d8" }}
              />
            </div>
          );
        })}
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
              <a href="mailto:support@example.com?subject=Assistance Needed" className="flex-1 block">
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
