import { FiLogOut } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import logo from "../assets/img/logo/logo.png";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../Config";
import {NavbarLoadingSkeleton} from "../components/LoadingSkeleton";

const Navbar = ({ user, userData, onLogout, setSelectedPlant }) => {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setLocalSelectedPlant] = useState(null);
  const [isPlantsLoading, setIsPlantsLoading] = useState(true);

  // Fetch plant names from Firestore only when userData is available
  useEffect(() => {
    if (!userData) return; // Wait until userData is provided
    const fetchPlants = async () => {
      if (userData.plants && userData.plants.length > 0) {
        const plantPromises = userData.plants.map(async (plantRef) => {
          const plantDoc = await getDoc(doc(db, "plants", plantRef.id));
          return plantDoc.exists()
            ? { value: plantRef.id, label: plantDoc.data().plant_name }
            : { value: plantRef.id, label: "Unknown Plant" };
        });
        const plantList = await Promise.all(plantPromises);
        setPlants(plantList);

        // Set default selection to the first plant if available
        if (plantList.length > 0) {
          setLocalSelectedPlant(plantList[0]);
          setSelectedPlant(plantList[0].value);
        }
      }
      setIsPlantsLoading(false);
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
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
        ? "#eff6ff"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": { backgroundColor: "#eff6ff", color: "#2563eb" },
    }),
  };

  return (
    <nav className="bg-white shadow-md py-2 px-10 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img className="mb-2" src={logo} alt="Blueshift" width="30" height="30" />
        <h1 className="text-xl font-semibold text-gray-900">Blueshift</h1>
      </div>

      {/* Right Section: Plant Selector + Logout Button */}
      <div className="flex items-center gap-2.5">
        {user && (
          <div className="flex items-center bg-white">
            {(!userData || isPlantsLoading) ? (
              <NavbarLoadingSkeleton />
            ) : plants.length > 0 ? (
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
        {/* Profile Button */}
        <button
          className="text-gray-500 bg-white px-2.5 py-2.5 rounded-lg flex items-center font-semibold hover:bg-gray-500 hover:text-white transition-all shadow-md border border-gray-300"
        >
          <FaUser />
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="bg-gray-500 text-white px-2.5 py-2.5 rounded-lg flex items-center font-semibold hover:bg-gray-600 transition-all shadow-md"
        >
          <FiLogOut />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
