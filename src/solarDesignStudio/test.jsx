import { useState } from "react";
// import { Button } from "@/components/ui/button";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    bill: "",
    usage: "",
    installation: "",
    address: ""
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const updateData = (key, value) => setFormData({ ...formData, [key]: value });

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Choose Type</h2>
          <div className="flex gap-4">
            <button onClick={() => updateData("type", "Residential")}>Residential</button>
            <button onClick={() => updateData("type", "Commercial")}>Commercial</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Enter Electricity Bill</h2>
          <input
            type="number"
            className="border p-2 w-full"
            value={formData.bill}
            onChange={(e) => updateData("bill", e.target.value)}
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Choose Usage Time</h2>
          <div className="flex gap-4">
            <button onClick={() => updateData("usage", "Day Time")}>Day Time</button>
            <button onClick={() => updateData("usage", "Night Time")}>Night Time</button>
            <button onClick={() => updateData("usage", "24 Hours")}>24 Hours</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Choose Installation Type</h2>
          <div className="flex gap-4">
            <button onClick={() => updateData("installation", "Roof")}>Roof</button>
            <button onClick={() => updateData("installation", "Ground")}>Ground</button>
            <button onClick={() => updateData("installation", "Canopy")}>Canopy</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Enter Address</h2>
          <input
            type="text"
            className="border p-2 w-full"
            value={formData.address}
            onChange={(e) => updateData("address", e.target.value)}
          />
        </div>
      )}

      {step === 6 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Review Your Data</h2>
          <p><strong>Type:</strong> {formData.type}</p>
          <p><strong>Bill:</strong> {formData.bill}</p>
          <p><strong>Usage:</strong> {formData.usage}</p>
          <p><strong>Installation:</strong> {formData.installation}</p>
          <p><strong>Address:</strong> {formData.address}</p>
        </div>
      )}

      <div className="flex justify-between mt-4">
        {step > 1 && <button onClick={prevStep}>Back</button>}
        {step < 6 && <button onClick={nextStep}>Next</button>}
      </div>
    </div>
  );
}
