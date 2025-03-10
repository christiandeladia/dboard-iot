import { FiLogOut } from "react-icons/fi";
import logo from "../assets/img/logo/logo.png";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../Config"; // Import Firestore instance

const Navbar = ({ user, userData, onLogout, setSelectedPlant }) => {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setLocalSelectedPlant] = useState(null);

  // Fetch plant names from Firestore
  useEffect(() => {
    const fetchPlants = async () => {
      if (userData?.plants && userData.plants.length > 0) {
        const plantPromises = userData.plants.map(async (plantRef) => {
          const plantDoc = await getDoc(doc(db, "plants", plantRef.id)); // Fetch plant document
          return plantDoc.exists()
            ? { value: plantRef.id, label: plantDoc.data().plant_name }
            : { value: plantRef.id, label: "Unknown Plant" }; // Fallback for missing data
        });

        const plantList = await Promise.all(plantPromises);
        setPlants(plantList);

        // ✅ Set default selection to the first plant if available
        if (plantList.length > 0) {
          setLocalSelectedPlant(plantList[0]); // Set state for local dropdown
          setSelectedPlant(plantList[0].value); // Set the parent state
        }
      }
    };

    fetchPlants();
  }, [userData, setSelectedPlant]);

  // Handle dropdown change
  const handleChange = (selected) => {
    setLocalSelectedPlant(selected);
    setSelectedPlant(selected.value);
  };

  // Custom styles for React-Select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: "160px",
      padding: "0px 2px",
      borderColor: "#d1d5db",
      borderRadius: "8px",
      boxShadow: "none",
      "&:hover": { borderColor: "#9ca3af" },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "8px",
      padding: "10px",
      border: "1px solid #d1d5dc",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    }),
    option: (provided, state) => ({
      ...provided,
      padding: "5px",
      borderRadius: "4px",
      backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#eff6ff" : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": { backgroundColor: "#eff6ff", color: "#2563eb" },
    }),
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img className="mb-2" src={logo} alt="Blueshift" width="40" height="40" />
        <h1 className="text-2xl font-semibold text-gray-900">Blueshift</h1>
      </div>

      {/* Right Section: Plant Selector + Logout Button */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center bg-white">
            {plants.length > 0 ? (
              <Select
                isSearchable={false}
                options={plants}
                value={selectedPlant}
                onChange={handleChange}
                styles={customStyles}
                placeholder="Select a plant..."
              />
            ) : (
              <p className="text-gray-500 text-sm">No plants available</p>
            )}
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-red-600 transition-all shadow-md"
        >
          <FiLogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
