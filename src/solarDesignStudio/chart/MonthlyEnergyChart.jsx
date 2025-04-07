import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Generate sample data for days 1 to 31
const data = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  kwh: Math.floor(Math.random() * 100) + 20
}));

function MonthlyEnergyChart() {
    return (
      <div className="w-full h-50 flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis tickMargin={0} width={30}/>
            <Tooltip />
            <Bar dataKey="kwh" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

export default MonthlyEnergyChart;
