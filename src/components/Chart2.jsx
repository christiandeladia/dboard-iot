import { useEffect, useState } from "react";
import { db } from "../Config"; // Ensure correct Firebase initialization
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Chart = ({ windowWidth = 800 }) => { // Default value for safety
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "meter_average_data"), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Snapshot size:", snapshot.size); // Debugging log

      if (snapshot.empty) {
        console.warn("No data found in Firestore.");
        setChartData([]); // Ensure state updates correctly
        return;
      }

      const hourlyData = {};

      snapshot.docs.forEach((doc) => {
        const docData = doc.data();
        console.log("Raw Firestore Data:", docData); // Debugging log

        if (!docData.timestamp || !docData.voltages_avg) {
          console.warn("Invalid document format:", docData);
          return; // Skip invalid documents
        }

        try {
          // Parse timestamp safely
          const dateParts = docData.timestamp.split(" ");
          if (dateParts.length < 2) return; // Skip if timestamp is invalid

          const [year, month, day] = dateParts[0].split("-").map(Number);
          const [hour] = dateParts[1].split(":").map(Number); // Extract hour
          const hourKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:00`;

          if (!hourlyData[hourKey]) {
            hourlyData[hourKey] = { count: 0, L1: 0, L2: 0, L3: 0 };
          }

          // Sum values for averaging later
          hourlyData[hourKey].L1 += docData.voltages_avg.L1 || 0;
          hourlyData[hourKey].L2 += docData.voltages_avg.L2 || 0;
          hourlyData[hourKey].L3 += docData.voltages_avg.L3 || 0;
          hourlyData[hourKey].count += 1;
        } catch (error) {
          console.error("Error processing document:", error, docData);
        }
      });

      // Compute hourly averages
      const formattedData = Object.keys(hourlyData).map((hour) => ({
        hour,
        L1: (hourlyData[hour].L1 / hourlyData[hour].count).toFixed(2),
        L2: (hourlyData[hour].L2 / hourlyData[hour].count).toFixed(2),
        L3: (hourlyData[hour].L3 / hourlyData[hour].count).toFixed(2),
      }));

      console.log("Formatted Chart Data:", formattedData); // Debugging log
      setChartData(formattedData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-11/12 bg-white p-6 rounded-lg shadow-lg h-[80vh]">
      <h2 className="text-lg font-semibold mb-2">Hourly Average Voltage Data</h2>
      <ResponsiveContainer
        width={windowWidth > 700 ? "95%" : "100%"}
        height="100%"
        minHeight="350px"
        style={{ margin: windowWidth > 700 ? "20px auto 0" : "0" }}
      >
        <AreaChart data={chartData}>
          <Tooltip
            labelFormatter={(label) => {
              if (!label) return "Unknown Time"; // Safeguard
              return new Date(label).toLocaleString("en-US", {
                weekday: "short",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              });
            }}
            formatter={(value, name) => [`${value}V`, name]}
          />
          {windowWidth > 700 && (
            <>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Legend verticalAlign="top" height={36} />
              <YAxis tickLine={false} axisLine={false} unit="V" />
            </>
          )}

          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            orientation="top"
            tickFormatter={(hour) => {
              if (!hour) return ""; // Safeguard
              return new Date(hour).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              });
            }}
            style={{ display: windowWidth < 700 ? "none" : "block" }}
          />

          <Area type="natural" dataKey="L1" stroke="rgb(205, 0, 0)" fill="rgba(205, 0, 0, 0.3)" strokeWidth={2} />
          <Area type="natural" dataKey="L2" stroke="rgb(0, 78, 246)" fill="rgba(0, 78, 246, 0.2)" strokeWidth={2} />
          <Area type="natural" dataKey="L3" stroke="rgb(0, 172, 14)" fill="rgba(0, 172, 14, 0.2)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
