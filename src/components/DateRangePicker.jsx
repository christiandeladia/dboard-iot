import React, { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main styles
import "react-date-range/dist/theme/default.css"; // Theme styles
import { FaAngleLeft, FaAngleRight, FaChevronDown, FaClock, FaForward  } from "react-icons/fa";

const options = [
  { value: "today", label: "Today" },
  { value: "last24", label: "Last 24 Hours" },
  { value: "future", label: "Future" },
  { value: "custom", label: "Custom" },
];

const DateDropdown = ({ onDateSelect }) => {
  const [selectedOption, setSelectedOption] = useState(options[0]); // default: Today
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Date range state (using an array with one selection object)
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  // Temporary state for custom selections
  const [tempDateRange, setTempDateRange] = useState(dateRange);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowMenu(false);
    if (option.value === "custom") {
      setShowModal(true);
    } else {
      let newRange;
      const now = new Date();
      if (option.value === "today") {
        newRange = [
          {
            startDate: now,
            endDate: now,
            key: "selection",
          },
        ];
      } else if (option.value === "last24") {
        newRange = [
          {
            startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            endDate: now,
            key: "selection",
          },
        ];
      } else if (option.value === "future") {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const futureEnd = new Date(tomorrow);
        futureEnd.setDate(futureEnd.getDate() + 7);
        newRange = [
          {
            startDate: tomorrow,
            endDate: futureEnd,
            key: "selection",
          },
        ];
      }
      setDateRange(newRange);
      if (onDateSelect) {
        onDateSelect([
          Math.floor(newRange[0].startDate.getTime() / 1000),
          Math.floor(newRange[0].endDate.getTime() / 1000),
        ]);
      }
    }
  };

  const handleModalSelect = (ranges) => {
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

  // Shift the date when navigation buttons are clicked.
  const shiftDate = (direction) => {
    const current = dateRange[0].startDate;
    const newDate = new Date(current);
    newDate.setDate(newDate.getDate() + (direction === "left" ? -1 : 1));
    const updatedRange = [
      {
        startDate: newDate,
        endDate: newDate,
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

  // Helper: Check if two dates are the same (ignoring time)
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Display text on the dropdown button.
  const displayText = () => {
    if (selectedOption.value === "custom") {
      const { startDate, endDate } = dateRange[0];
      if (isSameDay(startDate, endDate)) {
        return startDate.toDateString();
      } else {
        return `${startDate.toDateString()} - ${endDate.toDateString()}`;
      }
    } else if (selectedOption.value === "today") {
      const today = new Date();
      const selectedDate = dateRange[0].startDate;
      if (isSameDay(selectedDate, today)) {
        return "Today";
      }
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (isSameDay(selectedDate, yesterday)) {
        return "Yesterday";
      }
      return selectedDate.toDateString();
    } else if (selectedOption.value === "last24") {
      // Instead of showing the date range, display text with an icon.
      return (
        <span>
           Last 24 Hours
        </span>
      );
    } else if (selectedOption.value === "future") {
      return (

          <span className="flex items-center justify-start">

          <FaClock
            className="inline-block mr-1"
            style={{
              fill: "url(#cyan-blue-gradient)",
            }}
          />Future
          <svg width="0" height="0">
            <defs>
              <linearGradient id="cyan-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
                <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
              </linearGradient>
            </defs>
          </svg>

          </span>


      );
    }
    return selectedOption.label;
  };

  // Show navigation buttons if not Custom and the range is a single day.
  const showNavigationButtons =
    selectedOption.value !== "custom" &&
    isSameDay(dateRange[0].startDate, dateRange[0].endDate);

  // Close dropdown when clicking outside.
  const dropdownRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      {/* Custom Dropdown Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowMenu((prev) => !prev)}
          className="bg-white border border-gray-300 shadow-md rounded-md px-4 py-2 hover:bg-gray-100 transition flex items-center justify-between min-w-40"
        >
          {displayText()}
          <FaChevronDown className="ml-2" />
        </button>
        {showMenu && (
          <div className="absolute mt-2 p-3 w-full rounded-md shadow-lg bg-white z-10 border border-gray-300">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option)}
                className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black rounded ${
                  option.value === selectedOption.value ? "bg-blue-500 text-white" : ""
                }`}
              >
                {option.value === "future" ? (
                  <span className="flex items-center justify-start">
                              <FaClock
            className="inline-block mr-1"
            style={{
              fill: "url(#cyan-blue-gradient)",
            }}
          />Future
          <svg width="0" height="0">
            <defs>
              <linearGradient id="cyan-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
                <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
              </linearGradient>
            </defs>
          </svg>
                  </span>
                ) : (
                  option.label
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Left/Right Navigation Buttons (only for non-Custom when a single-day range is selected) */}
      {showNavigationButtons && (
        <>
          <button
            onClick={() => shiftDate("left")}
            className="px-3 py-3 bg-white border border-gray-300 shadow-md rounded hover:bg-gray-200 transition"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={() => shiftDate("right")}
            className="px-3 py-3 bg-white border border-gray-300 shadow-md rounded hover:bg-gray-200 transition"
          >
            <FaAngleRight />
          </button>
        </>
      )}

      {/* Modal for Custom Date Range */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <DateRange
              onChange={handleModalSelect}
              moveRangeOnFirstSelection={false}
              ranges={tempDateRange}
              months={2}
              direction="horizontal"
              preventSnapRefocus={true}
              calendarFocus="backwards"
              showSelectionPreview={true}
            />
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

export default DateDropdown;
