import React, { useEffect, useState } from 'react';


const PersonalizedProposal = ({ formData }) => {

  

  return (
    <div className="w-full max-w-10/12">
        <h2 className="text-4xl font-medium mb-8">Your Personalized Solar Proposal</h2>

        <div className="w-full h-70 bg-gray-300 mb-8 rounded-lg border-2 flex justify-center items-center">
            {/* <span className="text-gray-500">Image Placeholder</span> */}
         </div>

         <div>
            <p><strong>Type:</strong> {formData.type}</p>
            <p><strong>Electricity Bill:</strong> {formData.bill}</p>
            <p><strong>Usage Time:</strong> {formData.usage}</p>
            <p><strong>Installation Type:</strong> {formData.installation}</p>
            <p><strong>Address:</strong> {formData.address}</p>
        </div>
    </div>
);
};

export default PersonalizedProposal;
