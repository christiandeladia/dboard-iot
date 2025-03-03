import React, { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main styles
import "react-date-range/dist/theme/default.css"; // Theme styles

const DateRangePicker = ({ onDateSelect }) => {
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // Temporary state to store new selections before applying
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  const handleSelect = (ranges) => {
    setTempDateRange([ranges.selection]); // ✅ Store changes temporarily
  };

  const handleApply = () => {
    setShowModal(false);
    setDateRange(tempDateRange); // ✅ Apply the changes only when clicking "Apply"

    if (onDateSelect) {
      onDateSelect([
        Math.floor(tempDateRange[0].startDate.getTime() / 1000),
        Math.floor(tempDateRange[0].endDate.getTime() / 1000),
      ]);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Button to Open Modal */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-gray-50 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition border-gray-300 border shadow-md"
      >
        📆 {dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString()
          ? dateRange[0].startDate.toDateString()
          : `${dateRange[0].startDate.toDateString()} - ${dateRange[0].endDate.toDateString()}`}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
            {/* Date Range Picker */}
            <DateRange
              onChange={handleSelect}
              moveRangeOnFirstSelection={false}
              ranges={tempDateRange} // ✅ Use temp state
              months={2}
              direction="horizontal"
              preventSnapRefocus={true}
              calendarFocus="backwards"
              showSelectionPreview={true}
            />

            {/* Buttons */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg mr-2 hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
