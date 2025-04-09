import React, { useState } from 'react';
import { FaHouseChimney } from "react-icons/fa6";
import { BsBuildingsFill } from "react-icons/bs";


const SolarProposal = ({ updateData  }) => {  // Accepting the prop here
    const [selectedOption, setSelectedOption] = useState(null);

    return (
        <div className="w-full max-w-10/12">
                        <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 mt-15 text-left">
                Solar Design Studio
            </h2>
            <h2 className="text-4xl font-medium mb-8">Get a personalized solar proposal instantly</h2>
            
            <div className="w-full h-70 bg-gray-300 mb-8 rounded-lg border-2 flex justify-center items-center">
            {/* <span className="text-gray-500">Image Placeholder</span> */}
            </div>
            
            <p className="mt-4 text-2xl font-medium mb-8">I'm looking to get solar for:</p>
            
            <div className="mt-2 flex space-x-4 justify-center">
                <button 
                    className="border font-medium px-4 py-3 rounded-md flex-1 flex items-center justify-center"
                    variant={selectedOption === "residential" ? "default" : "outline"}
                    onClick={() => updateData("type", "Residential")}
                >
                    <FaHouseChimney className="mr-2" /> Residential
                </button>
                <button 
                    className="border font-medium px-4 py-3 rounded-md flex-1 flex items-center justify-center"
                    variant={selectedOption === "commercial" ? "default" : "outline"}
                    onClick={() => updateData("type", "Commercial")}
                >
                    <BsBuildingsFill className="mr-2" /> Commercial
                </button>
            </div>

        </div>
    );
};

export default SolarProposal;
