import React, { useState } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main styles
import "react-date-range/dist/theme/default.css"; // Theme styles

const DateRangePicker = ({ onDateSelect }) => {
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(), // End date is also today
      key: "selection",
    },
  ]);
  

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const handleApply = () => {
    setShowModal(false);
    if (onDateSelect) {
      onDateSelect(dateRange[0]);
    }
  };
  const defaultName = new Date().toDateString();
  return (
    <div className="flex flex-col items-center">
      {/* Button to Open Modal */}


      <button
  onClick={() => setShowModal(true)}
  className="bg-gray-50 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition border-gray-300 border shadow-md"
>
  📆 {dateRange[0].startDate.toDateString() === dateRange[0].endDate.toDateString()
    ? dateRange[0].startDate.toDateString()  // Show only one date if they are the same
    : `${dateRange[0].startDate.toDateString()} - ${dateRange[0].endDate.toDateString()}`}
</button>





      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-auto  flex items-center justify-center z-50 bottom-30">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg ">
            {/* <h2 className="text-lg font-semibold mb-4 text-gray-900">📅 Pick a Date Range</h2> */}

            {/* Date Range Picker */}
            <DateRange
              onChange={handleSelect}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
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
