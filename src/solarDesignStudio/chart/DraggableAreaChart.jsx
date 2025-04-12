import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import DraggableDot from './DraggableDot';

const dayTimeData   = [2, 2, 3, 3, 16, 16, 18, 16, 17, 4, 4, 3];
const nightTimeData = [16, 17, 17, 15, 5, 5, 4, 5, 4, 13, 15, 16];
const twentyFourSevenData = [9, 10, 9, 9, 9, 10, 10, 10, 10, 10, 11, 9];

const times = [
  '12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM',
  '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'
];

const DraggableAreaChart = ({ selectedUsage, onDataChange, resetSignal }) => {
  let dataset;
  if (selectedUsage === "Night time") {
    dataset = nightTimeData;
  } else if (selectedUsage === "24 Hours") {
    dataset = twentyFourSevenData;
  } else {
    dataset = dayTimeData;
  }

  // Build initial data array for the chart
  const initialData = times.map((time, index) => ({
    time,
    kwh: dataset[index],
  }));

  const [data, setData] = useState(initialData);
  const [dragging, setDragging] = useState(null);

  // When resetSignal or selectedUsage changes, reset to default data.
  useEffect(() => {
    setData(initialData);
  }, [resetSignal, selectedUsage]);

  const updateDataAtIndex = (index, newValue) => {
    setData((prevData) =>
      prevData.map((point, i) =>
        i === index ? { ...point, kwh: newValue } : point
      )
    );
  };

  // Send updated data (just the kWh values array) up to the parent.
  useEffect(() => {
    const currentValues = data.map((point) => point.kwh);
    if (onDataChange) {
      onDataChange(currentValues);
    }
  }, [data, onDataChange]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 20]} tick={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="kwh"
            stroke="#36A2EB"
            fill="#9AD0F5"
            strokeWidth={3}
            dot={(props) => {
              const { key, ...rest } = props;
              return (
                <DraggableDot
                  key={key}
                  {...rest}
                  updateData={updateDataAtIndex}
                  dragging={dragging}
                  setDragging={setDragging}
                />
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DraggableAreaChart;
