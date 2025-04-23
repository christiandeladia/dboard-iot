// src/components/AdjustDailyConsumptionModal.jsx
import React from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import DailyEnergyChart from '../chart/DailyEnergyChart';

export default function AdjustDailyConsumptionModal({
  isOpen,
  onClose,
  data,
  sliderMax,
  usage,
  onDataChange,
  onMaxDrag,
  shake,
}) {
  if (!isOpen) return null;

  const totalRaw = data.reduce((sum, v) => sum + v, 0);
  const formatted = totalRaw.toFixed(1);

  return (
    <div
      className="
        fixed inset-0 z-50
        flex justify-center items-end lg:items-center
      "
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="
          relative bg-white w-full rounded-t-2xl
          lg:rounded-2xl lg:max-w-lg
          max-h-[80vh] overflow-y-auto
          pb-6 p-6 shadow-lg animate-slide-up
        "
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Adjust Daily Energy Pattern</h3>
          <button onClick={onClose}>
            <AiOutlineClose className="text-black text-2xl cursor-pointer" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-1 ps-6">
          Daily consumption:{' '}
          {totalRaw === sliderMax
            ? (
              <span className={`text-green-600 font-semibold inline-block ${shake ? 'shake' : ''}`}>
                {formatted} kWh (Max)
              </span>
            )
            : <span className="text-red-500 font-bold">
                {formatted}/{sliderMax} kWh
              </span>
          }
        </p>

        <DailyEnergyChart
          data={data}
          draggable
          onDataChange={onDataChange}
          sliderMax={sliderMax}
          usage={usage}
          onMaxDrag={onMaxDrag}
        />
      </div>
    </div>
  );
}
