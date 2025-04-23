import React from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaLock, FaLockOpen } from "react-icons/fa"; // Import lock icons

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AdjustMonthlyConsumptionModal = ({
  visible,
  onClose,
  computedSliderMax,
  weekdayAverages,
  weekdayCounts,
  onSliderChange,
  lockedDays,
  toggleLockDay,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center md:items-center md:justify-center">
      <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto shadow-lg transition-transform transform translate-y-0 md:rounded-2xl md:max-w-lg animate-slide-up">
        <div className="mb-6 flex justify-between">
          <h3 className="text-lg font-bold">Adjust Monthly Consumption</h3>
          <button onClick={onClose}>
            <AiOutlineClose className="text-black text-2xl cursor-pointer" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-3">
          Monthly consumption: {computedSliderMax} kWh
        </p>

        <div className="w-full space-y-6">
          {dayLabels.map((label, dayIndex) => {
            const dayMax = weekdayCounts[dayIndex]
              ? Math.round(computedSliderMax / weekdayCounts[dayIndex])
              : 0;
            const currentAvg = weekdayAverages[dayIndex] || 0;
            const currentPercentage = dayMax
              ? Math.round((currentAvg / dayMax) * 100)
              : 0;

            return (
              <div key={dayIndex} className="flex flex-col gap-2 mb-3">
                {/* Display day label and percentage info */}
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>{label}</span>
                  <span>{currentPercentage}% ({currentAvg} kWh)</span>
                </div>
                {/* Inline block: slider and lock icon side-by-side */}
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentPercentage}
                    onChange={(e) => onSliderChange(dayIndex, Number(e.target.value))}
                    className="flex-grow bg-white cursor-pointer"
                    style={{ accentColor: "#007AFF" }}
                    disabled={lockedDays[dayIndex]}
                  />
                  {/* Lock toggle button as an inline block */}
                  <button
                    onClick={() => toggleLockDay(dayIndex)}
                    className="inline-block focus:outline-none cursor-pointer"
                  >
                    {lockedDays[dayIndex] ? (
                      <FaLock className="text-gray-600" />
                    ) : (
                      <FaLockOpen className="text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdjustMonthlyConsumptionModal;
