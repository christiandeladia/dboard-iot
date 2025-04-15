import React from "react";

const PersonalizedProposal = ({ formData, goBack }) => {
  return (
    <>
    <div className="w-full mb-5 sticky top-0 z-50 bg-gray-200 shadow-md">
        <div className="flex items-center justify-evenly bg-gray-200 p-4 shadow-md max-w-7xl mx-auto">
        <div>
            <p className=" font-semibold text-gray-800">
            Panels: <span className="font-normal">32kW</span>
            </p>
            <p className="font-semibold text-gray-800">
            Battery: <span className="font-normal">83 kWh</span>
            </p>
        </div>
        <div className="border-l border-gray-400 h-10 mx-4"></div>
        <div>
            <p className="text-sm font-semibold text-gray-800">Total Cost:</p>
            <p className="text-lg font-bold text-gray-900">173,820 PHP</p>
        </div>
        </div>
    </div>
    <h2 className="text-[1.25rem] text-gray-400 tracking-tight font-medium mb-3 text-left w-full max-w-10/12">
          Solar Design Studio
        </h2>
    <div className="w-full max-w-10/12">

      <div className="flex items-center mb-4">
        <h2 className="text-4xl font-medium">
          Your Personalized Solar Proposal
          <span className="pl-2 ">
            <button
              onClick={goBack}
              className="text-sm text-blue-600 underline  relative bottom-[4px]"
            >
              edit
            </button>
          </span>
        </h2>
      </div>

      <div className="w-full h-140 bg-gray-300 mb-8 rounded-lg border-2 flex justify-center items-center">
        {/* <span className="text-gray-500">Image Placeholder</span> */}
      </div>

      <div className="pb-25">
        <p>
          <strong>Type:</strong> {formData.type}
        </p>
        <p>
          <strong>Electricity Bill: <span className="font-normal">₱</span></strong> {formData.bill}
        </p>
        <p>
          <strong>Monthly Data:</strong> {formData.monthly.join(', ')}
        </p>

        <p>
          <strong>Usage Time:</strong> {formData.usage}
        </p>
        <p>
  <strong>Daily Data:</strong>{" "}
  {formData.electricityData
    .map(num =>
      num % 1 === 0 ? num : Number(num).toFixed(1)
    )
    .join(", ")}
</p>


        <p>
          <strong>Installation Type:</strong> {formData.installation}
        </p>
        <p>
          <strong>Address:</strong> {formData.address}
        </p>
      </div>
    </div>
    </>
  );
};

export default PersonalizedProposal;
