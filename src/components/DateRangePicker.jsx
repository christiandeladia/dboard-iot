import React, { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // Main styles
import "react-date-range/dist/theme/default.css"; // Theme styles
import { FaAngleLeft, FaAngleRight, FaChevronDown, FaChevronRight, FaClock, FaChartBar } from "react-icons/fa";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { groupedPhaseOptions } from "../components/PowerDropdown";


// CustomDropdown component using chevrons from react-icons
const CustomDropdown = ({ label, labelAvg, children }) => {
  const [open, setOpen] = useState(false);
  return (
<div className="mb-2">
  <div
    onClick={() => setOpen(!open)}
    className="cursor-pointer font-semibold flex items-center justify-between"
  >
    <span>{label}</span>
    <div className="flex items-center justify-start">
      <span>{labelAvg}</span>
      {open ? <FaChevronDown className="ml-1" /> : <FaChevronRight className="ml-1" />}
    </div>
  </div>
  {open && <div className="pl-4">{children}</div>}
</div>

  );
};

const options = [
  { value: "today", label: "Today" },
  { value: "last24", label: "Last 24 Hours" },
  { value: "future", label: "Future" },
  { value: "custom", label: "Custom" },
];

const DateDropdown = ({ onDateSelect, onChartTypeChange, overallAverages }) => {
  const [selectedOption, setSelectedOption] = useState(options[0]); // default: Today
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // NEW: Sidebar toggle

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

  // Chart type state: "area" or "bar"
  const [chartType, setChartType] = useState("area");

  // Toggle between area and bar chart types.
  const toggleChartType = () => {
    const newType = chartType === "area" ? "bar" : "area";
    setChartType(newType);
    if (onChartTypeChange) onChartTypeChange(newType);
  };

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

  // Calculate difference in days between start and end date.
  const diffDays = (dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24);

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
      return <span>Last 24 Hours</span>;
    } else if (selectedOption.value === "future") {
      return (
        <span className="flex items-center justify-start">
          <FaClock
            className="inline-block mr-1"
            style={{
              fill: "url(#cyan-blue-gradient)",
            }}
          />
          Future
          <svg width="0" height="0">
            <defs>
              <linearGradient id="cyan-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
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


 // Helper function to render the sidebar layout using groupedPhaseOptions.
 const renderSidebar = () => {
  return groupedPhaseOptions.map((group, i) => (
    <div key={i} className="mb-10">
      <div className="font-bold text-xl mb-3">{group.label}</div>
      {group.options && group.options.length > 0 ? (
        group.options.map((subgroup, j) => {
          const subgroupLabel = subgroup.label;
          const values = subgroup.options.map(
            (option) => overallAverages?.[option.value]
          );
          const validValues = values.filter((v) => v !== null && v !== undefined);
          const avg =
            validValues.length > 0
              ? parseFloat(
                  (
                    validValues.reduce((sum, v) => sum + v, 0) /
                    validValues.length
                  ).toFixed(2)
                )
              : null;
          return (
            <CustomDropdown
              key={j}
              label={
                <>
                  {typeof subgroupLabel === "string"
                    ? subgroupLabel
                    : subgroupLabel}
                </>
              }
              labelAvg={
                <>
                  {avg !== null && (
                    <span className="text-sm text-gray-600"> (Average: {avg})</span>
                  )}
                </>
              }
            >
              {subgroup.options.map((option) => (
                <div key={option.value} className="flex justify-between pb-1 w-9/10">
                  <span className="text-gray-700">{option.label}:</span>
                  <span className="text-gray-700 font-semibold">
                    {overallAverages && overallAverages[option.value] != null
                      ? overallAverages[option.value]
                      : "N/A"}
                  </span>
                </div>
              ))}

            </CustomDropdown>
          );
        })
      ) : (
        <p className="ml-4 text-gray-700">No options available</p>
      )}
    </div>
  ));
};



  return (
    <div className="flex items-center space-x-2 relative">
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
                    />
                    Future
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id="cyan-blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
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

      {/* Navigation Buttons for non-custom single day range */}
      {showNavigationButtons && (
        <>
          <button
            onClick={() => shiftDate("left")}
            title={"Previous Date"}
            className="px-3 py-3 bg-white border border-gray-300 shadow-md rounded hover:bg-gray-200 transition"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={() => shiftDate("right")}
            title={"Next Date"}
            className="px-3 py-3 bg-white border border-gray-300 shadow-md rounded hover:bg-gray-200 transition"
          >
            <FaAngleRight />
          </button>
        </>
      )}

      {/* Chart Toggle Button for Custom Date Range */}
      {selectedOption.value === "custom" && diffDays >= 2 && (
        <button
          onClick={toggleChartType}
          disabled={diffDays > 7}
          title={diffDays > 7 ? "Chart toggle disabled for ranges longer than 8 days" : "Chart Toggle"}
          className={`px-3 py-3 bg-white border border-gray-300 shadow-md rounded transition ${
            diffDays > 7 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-200"
          }`}
        >
          <FaChartBar className={chartType === "bar" ? "text-blue-500" : "text-gray-500"} />
        </button>
      )}

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        title={"View Data List"}
        className="px-3 py-3 bg-white border border-gray-300 shadow-md rounded hover:bg-gray-200 transition me-0"
      >
        <BsLayoutSidebarInsetReverse className="text-gray-500" />
      </button>

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed right-0 top-0 h-full w-90 bg-white shadow-lg z-50 p-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold"></h3>
            <button onClick={() => setShowSidebar(false)} className="text-gray-600 text-2xl">
              &times;
            </button>
          </div>
          <p className="text-gray-700 font-bold mb-5 pb-2 border-b border-gray-400">
            {displayText()}
          </p>
          {overallAverages ? renderSidebar() : <p className="text-gray-700">No data available</p>}
        </div>
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
