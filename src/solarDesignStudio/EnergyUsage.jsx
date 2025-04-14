import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaArrowRight } from "react-icons/fa6";
import MonthlyEnergyChart from "./chart/MonthlyEnergyChart";
import HelpModal from "./modals/HelpModal";
import AdjustDailyConsumptionModal from "./modals/AdjustDailyConsumptionModal";

const EnergyUsage = ({ updateData, selectedBill, customerType  }) => {
  const [bill, setBill] = useState(selectedBill || "");
  const [showModal, setShowModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Calculate the slider max (kWh) based on bill and customer type
  const computeSliderMax = useCallback((billValue) => {
    const numericBill = billValue ? Number(billValue.replace(/,/g, "")) : 10000;
    const rate = customerType === "Commercial" ? 10 : 12.65; // default to Residential
    return Math.round(numericBill / rate);
  }, [customerType]);
  
  const computedSliderMax = computeSliderMax(bill);

  const generateRandomConsumption = () => {
    const randomValues = Array.from({ length: 31 }, () => Math.random());
    const total = randomValues.reduce((acc, value) => acc + value, 0);
    return randomValues.map(value => Math.round((value / total) * computedSliderMax));
  };

  const [dailyConsumption, setDailyConsumption] = useState(generateRandomConsumption);

  const handleDataChange = (newData) => {
    setDailyConsumption(newData);
  };

  const handleChange = (e) => {
    let value = e.target.value;
    const raw = value.replace(/,/g, "");
  
    // Allow empty input
    if (raw === "") {
      setBill("");
      updateData("bill", "");
      return;
    }
  
    // Prevent non-numeric input
    if (!/^\d+$/.test(raw)) return;
  
    // Prevent leading zero if input has more than 1 digit
    if (raw.length > 1 && raw.startsWith("0")) return;
  
    const formatted = Number(raw).toLocaleString();
    setBill(formatted);
    updateData("bill", formatted);
  };
  
  // Weekday counts based on dailyConsumption array
  const weekdayCounts = useMemo(() => {
    const counts = Array(7).fill(0);
    dailyConsumption.forEach((_, idx) => {
      counts[idx % 7]++;
    });
    return counts;
  }, [dailyConsumption]);

  // Compute the weekly averages (for display)
  const computeWeekdayAverages = () => {
    const sums = Array(7).fill(0);
    const counts = Array(7).fill(0);
    dailyConsumption.forEach((value, index) => {
      const day = index % 7;
      sums[day] += value;
      counts[day]++;
    });
    return sums.map((total, i) => counts[i] ? Math.round(total / counts[i]) : 0);
  };

  const [weekdayAverages, setWeekdayAverages] = useState(computeWeekdayAverages());

  useEffect(() => {
    if (showModal) {
      setWeekdayAverages(computeWeekdayAverages());
    }
  }, [showModal]);

  const initialPercentages = Array(7).fill(100 / 7);
  const [weekdayPercentages, setWeekdayPercentages] = useState(initialPercentages);

  // New state: keep track of which weekdays are locked.
  const [lockedDays, setLockedDays] = useState(Array(7).fill(false));

  // Function to toggle lock state for a day (0 to 6)
  const toggleLockDay = (dayIndex) => {
    const updatedLocks = [...lockedDays];
    updatedLocks[dayIndex] = !updatedLocks[dayIndex];
    setLockedDays(updatedLocks);
  };

  const handleWeekdaySliderChange = (dayIndex, newPercentage) => {
    // If the day is locked, ignore changes.
    if (lockedDays[dayIndex]) return;
  
    const numDays = weekdayPercentages.length;
    const oldPercentages = [...weekdayPercentages];
  
    // Determine which indices are locked and which are unlocked.
    const lockedIndices = [];
    const unlockedIndices = [];
    for (let i = 0; i < numDays; i++) {
      if (lockedDays[i]) {
        lockedIndices.push(i);
      } else {
        unlockedIndices.push(i);
      }
    }
  
    // Total percentage already fixed by locked days.
    const lockedTotal = lockedIndices.reduce((sum, i) => sum + oldPercentages[i], 0);
    // The unlocked sliders can only collectively use the remaining percentage.
    const available = 100 - lockedTotal;
  
    // Clamp the newPercentage so that it cannot exceed what’s available.
    const clampedNew = Math.min(newPercentage, available);
  
    // Prepare an object to hold new values for unlocked sliders.
    const updatedUnlockeds = {};
    updatedUnlockeds[dayIndex] = clampedNew;
  
    // Get other unlocked indices (excluding the one being changed).
    const otherUnlocked = unlockedIndices.filter((i) => i !== dayIndex);
    // Sum the old values for these unlocked sliders.
    const unlockedTotalOld = otherUnlocked.reduce((sum, i) => sum + oldPercentages[i], 0);
  
    // Distribute the remaining available percentage among the other unlocked sliders.
    otherUnlocked.forEach((i) => {
      if (unlockedTotalOld > 0) {
        updatedUnlockeds[i] = (oldPercentages[i] / unlockedTotalOld) * (available - clampedNew);
      } else {
        // If all other unlocked sliders were 0, split the remainder equally.
        updatedUnlockeds[i] = (available - clampedNew) / otherUnlocked.length;
      }
    });
  
    // Build the new percentages array, preserving locked days.
    const newPercentages = [];
    for (let i = 0; i < numDays; i++) {
      if (lockedDays[i]) {
        newPercentages[i] = oldPercentages[i]; // Locked days remain unchanged.
      } else {
        newPercentages[i] =
          updatedUnlockeds[i] !== undefined ? updatedUnlockeds[i] : oldPercentages[i];
      }
    }
  
    // Adjust for any rounding errors so the total sums exactly to 100.
    const total = newPercentages.reduce((sum, val) => sum + val, 0);
    const diff = 100 - total;
    if (otherUnlocked.length > 0) {
      newPercentages[otherUnlocked[0]] += diff;
    } else {
      newPercentages[dayIndex] += diff;
    }
  
    // (Optional) Ensure no percentage is negative.
    for (let i = 0; i < numDays; i++) {
      if (newPercentages[i] < 0) newPercentages[i] = 0;
    }
  
    // Update state for percentages.
    setWeekdayPercentages(newPercentages);
  
    // Now update daily consumption and weekday averages based on the new percentages.
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
    setWeekdayAverages(
      newPercentages.map(
        (percent, j) =>
          Math.round((percent / 100) * (computedSliderMax / (weekdayCounts[j] || 1)))
      )
    );
  };
  

  const generateDailyConsumptionFromBill = (sliderMax) => {
    const daily = Math.round(sliderMax / 31);
    return Array(31).fill(daily);
  };
  useEffect(() => {
    setDailyConsumption(generateDailyConsumptionFromBill(computedSliderMax));
  }, [computedSliderMax]);
    
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
