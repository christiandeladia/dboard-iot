import React, { useState, useEffect } from 'react';
import { FaArrowRight } from "react-icons/fa6";
import MonthlyEnergyChart from "./chart/MonthlyEnergyChart";
import HelpModal from "./modals/HelpModal";
import AdjustDailyConsumptionModal from "./modals/AdjustDailyConsumptionModal";

const EnergyUsage = ({ updateData, selectedBill, customerType, initialConsumption, hasUserAdjusted }) => {
  const [bill, setBill] = useState(selectedBill || "");
  const [showModal, setShowModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Compute the slider's max value based on the bill and customer type.
  const computeSliderMax = (billValue) => {
    const numericBill = billValue ? Number(billValue.replace(/,/g, "")) : 10000;
    const rate = customerType === "Commercial" ? 10 : 12.65;
    return Math.round(numericBill / rate);
  };

  const computedSliderMax = computeSliderMax(bill);

  useEffect(() => {
    // Pass computedSliderMax up to the parent using updateData.
    updateData("sliderMax", computedSliderMax);
  }, [computedSliderMax]);
  

  // Generate a uniform daily consumption based on computedSliderMax.
  const generateDailyConsumptionFromBill = (sliderMax) => {
    const daily = Math.round(sliderMax / 31);
    return Array(31).fill(daily);
  };

// On mount, use parent's adjusted consumption if available,
  // otherwise use the default based on computedSliderMax.
  const [dailyConsumption, setDailyConsumption] = useState(() => {
    return (initialConsumption && Array.isArray(initialConsumption) && initialConsumption.length)
      ? initialConsumption
      : generateDailyConsumptionFromBill(computedSliderMax);
  });

  // When the user adjusts via the chart, update parent's state and flag.
  const handleDataChange = (newData) => {
    setDailyConsumption(newData);
    // updateData("monthly", newData);
    // updateData("hasUserAdjusted", true);
  };

  useEffect(() => {
    // console.log("useEffect triggered with computedSliderMax:", computedSliderMax);
    // console.log("hasUserAdjusted:", hasUserAdjusted);
    // console.log("initialConsumption:", initialConsumption);
    // Only recalc if the user has not adjusted
    if (!hasUserAdjusted) {
      const defaultConsumption = generateDailyConsumptionFromBill(computedSliderMax);
      setDailyConsumption(defaultConsumption);
      updateData("monthly", defaultConsumption);
    }
  }, [computedSliderMax, hasUserAdjusted]);
  



 // When the bill input changes, we want to reset manual adjustments.
 const handleChange = (e) => {
  let value = e.target.value;
  const raw = value.replace(/,/g, "");
  if (raw === "") {
    setBill("");
    updateData("bill", "");
    return;
  }
  if (!/^\d+$/.test(raw)) return;
  if (raw.length > 1 && raw.startsWith("0")) return;
  const formatted = Number(raw).toLocaleString();
  setBill(formatted);
  updateData("bill", formatted);

  // Reset adjustment state when bill changes
  const newSliderMax = computeSliderMax(formatted);
  const defaultConsumption = generateDailyConsumptionFromBill(newSliderMax);
  setDailyConsumption(defaultConsumption);
  updateData("monthly", defaultConsumption);
  updateData("hasUserAdjusted", false);
};


  // Calculate weekday counts.
  const weekdayCounts = dailyConsumption.reduce((acc, _, idx) => {
    acc[idx % 7] = (acc[idx % 7] || 0) + 1;
    return acc;
  }, Array(7).fill(0));

  // Calculate weekday averages.
  const computeWeekdayAverages = () => {
    const sums = Array(7).fill(0);
    const counts = Array(7).fill(0);
    dailyConsumption.forEach((value, index) => {
      const day = index % 7;
      sums[day] += value;
      counts[day]++;
    });
    return sums.map((total, i) => (counts[i] ? Math.round(total / counts[i]) : 0));
  };

  const [weekdayAverages, setWeekdayAverages] = useState(computeWeekdayAverages());
  useEffect(() => {
    if (showModal) {
      setWeekdayAverages(computeWeekdayAverages());
    }
  }, [showModal]);

  const initialPercentages = Array(7).fill(100 / 7);
  const [weekdayPercentages, setWeekdayPercentages] = useState(initialPercentages);
  const [lockedDays, setLockedDays] = useState(Array(7).fill(false));

  const toggleLockDay = (dayIndex) => {
    const updatedLocks = [...lockedDays];
    updatedLocks[dayIndex] = !updatedLocks[dayIndex];
    setLockedDays(updatedLocks);
  };

  const handleWeekdaySliderChange = (dayIndex, newPercentage) => {
    if (lockedDays[dayIndex]) return; // Do nothing if the target day is locked.
    
    const numDays = weekdayPercentages.length;
    const oldPercentages = [...weekdayPercentages];
    
    // Separate indices for locked and unlocked sliders.
    const lockedIndices = [];
    const unlockedIndices = [];
    for (let i = 0; i < numDays; i++) {
      if (lockedDays[i]) {
        lockedIndices.push(i);
      } else {
        unlockedIndices.push(i);
      }
    }
    
    // Calculate total percentage occupied by locked sliders.
    const lockedTotal = lockedIndices.reduce((sum, i) => sum + oldPercentages[i], 0);
    const available = 100 - lockedTotal;
    
    // Clamp newPercentage so that it does not exceed available percentage.
    const clampedNew = Math.min(newPercentage, available);
    
    // Prepare an object to store updated values for unlocked sliders.
    const updatedUnlockeds = {};
    // Set the new value for the slider being adjusted.
    updatedUnlockeds[dayIndex] = clampedNew;
    
    // For the other unlocked sliders, calculate proportionally
    const otherUnlocked = unlockedIndices.filter((i) => i !== dayIndex);
    const unlockedTotalOld = otherUnlocked.reduce((sum, i) => sum + oldPercentages[i], 0);
    otherUnlocked.forEach((i) => {
      if (unlockedTotalOld > 0) {
        updatedUnlockeds[i] = (oldPercentages[i] / unlockedTotalOld) * (available - clampedNew);
      } else {
        updatedUnlockeds[i] = (available - clampedNew) / otherUnlocked.length;
      }
    });
    
    // Build new percentages using locked values as is and updated unlocked values.
    const newPercentages = [];
    for (let i = 0; i < numDays; i++) {
      newPercentages[i] = lockedDays[i] ? oldPercentages[i] : (updatedUnlockeds[i] !== undefined ? updatedUnlockeds[i] : oldPercentages[i]);
    }
    
    // Calculate rounding difference
    const total = newPercentages.reduce((sum, val) => sum + val, 0);
    const diff = 100 - total;
    
    // IMPORTANT: Create a fresh array of unlocked indices for diff distribution
    const unlockedForDiff = [];
    for (let i = 0; i < numDays; i++) {
      if (!lockedDays[i]) {
        unlockedForDiff.push(i);
      }
    }
    
    // Evenly distribute the diff among unlocked sliders
    if (unlockedForDiff.length > 0) {
      const adjustmentPerSlider = diff / unlockedForDiff.length;
      unlockedForDiff.forEach((i) => {
        newPercentages[i] += adjustmentPerSlider;
      });
    } else {
      newPercentages[dayIndex] += diff;
    }
    
    // Ensure no percentage falls below 0.
    for (let i = 0; i < numDays; i++) {
      if (newPercentages[i] < 0) newPercentages[i] = 0;
    }
    
    // Update state
    setWeekdayPercentages(newPercentages);
    
    const updatedConsumption = [...dailyConsumption];
    newPercentages.forEach((percent, j) => {
      const dayCount = weekdayCounts[j] || 1;
      const dayMax = Math.round(computedSliderMax / dayCount);
      const newAvg = Math.round((percent / 100) * dayMax);
      for (let i = j; i < updatedConsumption.length; i += 7) {
        updatedConsumption[i] = newAvg;
      }
    });
    setDailyConsumption(updatedConsumption);
    setWeekdayAverages(newPercentages.map((percent, j) =>
      Math.round((percent / 100) * (computedSliderMax / (weekdayCounts[j] || 1)))
    ));
    
    // Update parent's state.
    updateData("monthly", updatedConsumption);
    updateData("hasUserAdjusted", true);
  };
  

  return (
    <div className="w-full max-w-10/12 relative">
      <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left">
        Solar Design Studio
      </h2>
      <h2 className="text-4xl font-medium mb-8">Tell us more about your energy usage.</h2>
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
      <AdjustDailyConsumptionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        computedSliderMax={computedSliderMax}
        weekdayAverages={weekdayAverages}
        weekdayCounts={weekdayCounts}
        onSliderChange={handleWeekdaySliderChange}
        lockedDays={lockedDays}
        toggleLockDay={toggleLockDay}
      />
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  );
};

export default EnergyUsage;
