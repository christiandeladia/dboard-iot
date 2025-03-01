import { FiLogOut } from "react-icons/fi";
import logo from "../assets/img/logo/logo.png";
import React, { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../Config"; // Import Firestore instance

const Navbar = ({ user, userData, onLogout, setSelectedPlant  }) => {
  // const [selectedPlant, setSelectedPlant] = useState("");
  const [plants, setPlants] = useState([]);

  // Fetch plant names from Firestore
  useEffect(() => {
    const fetchPlants = async () => {
      if (userData?.plants && userData.plants.length > 0) {
        const plantPromises = userData.plants.map(async (plantRef) => {
          const plantDoc = await getDoc(doc(db, "plants", plantRef.id)); // Fetch plant document
          return plantDoc.exists()
            ? { id: plantRef.id, name: plantDoc.data().plant_name }
            : { id: plantRef.id, name: "Unknown Plant" }; // Fallback for missing data
        });

        const plantList = await Promise.all(plantPromises);
        setPlants(plantList);

        // Set default selection to the first plant if available
        if (plantList.length > 0) {
          setSelectedPlant(plantList[0].id);
        }
      }
    };

    fetchPlants();
  }, [userData, setSelectedPlant]);

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img className="mb-2" src={logo} alt="Blueshift" width="40" height="40" />
        <h1 className="text-2xl font-semibold text-gray-900">Blueshift</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div>
            {/* <p className="text-gray-700">Welcome, {user.email}</p>
            <p className="text-gray-500 text-sm">UID: {user.uid}</p>
            {userData && <p className="text-gray-700 font-semibold">{userData.email}</p>} */}

            {/* Dropdown for Plants */}
            {plants.length > 0 ? (
              <select
                // value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 bg-white text-gray-700"
              >
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-500">No plants available</p>
            )}
          </div>
        )}
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-4xl flex items-center gap-2 hover:bg-red-700 transition-all"
        >
          <FiLogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
