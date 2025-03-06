import React, { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main styles
import "react-date-range/dist/theme/default.css"; // Theme styles
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

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
    setTempDateRange([ranges.selection]);
  };

  const handleApply = () => {
    setShowModal(false);
    setDateRange(tempDateRange);

    if (onDateSelect) {
      onDateSelect([
        Math.floor(tempDateRange[0].startDate.getTime() / 1000),
        Math.floor(tempDateRange[0].endDate.getTime() / 1000),
      ]);
    }
  };

  // Function to change date when left/right button is clicked
  const shiftDate = (direction) => {
    const newDate = new Date(dateRange[0].startDate);
    newDate.setDate(newDate.getDate() + (direction === "left" ? -1 : 1));

    const updatedRange = [
      {
        startDate: newDate,
        endDate: newDate, // Ensure both start and end dates are the same for single-day selection
        key: "selection",
      },
    ];

    setDateRange(updatedRange);
    if (onDateSelect) {
      onDateSelect([
        Math.floor(newDate.getTime() / 1000),
        Math.floor(newDate.getTime() / 1000),
      ]);
    }
  };

  return (
    <div className="flex items-center space-x-2">


      {/* Date Picker Button */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-gray-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition border-gray-300 border shadow-md"
      >
        📆 {dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString()
          ? dateRange[0].startDate.toDateString()
          : `${dateRange[0].startDate.toDateString()} - ${dateRange[0].endDate.toDateString()}`}
      </button>

      {/* Left Button (⬅) - Shown only if single date is selected */}
      {dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString() && (
        <button
          onClick={() => shiftDate("left")}
          className="px-3 py-3 bg-white border-gray-300 border shadow-md rounded-lg hover:bg-gray-200 transition"
        >
          <FaAngleLeft />
        </button>
      )}
            {/* Right Button (➡) - Shown only if single date is selected */}
            {dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString() && (
        <button
          onClick={() => shiftDate("right")}
          className="px-3 py-3 bg-white border-gray-300 border shadow-md rounded-lg hover:bg-gray-200 transition"
        >
          <FaAngleRight />
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
            {/* Date Range Picker */}
            <DateRange
              onChange={handleSelect}
              moveRangeOnFirstSelection={false}
              ranges={tempDateRange}
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
