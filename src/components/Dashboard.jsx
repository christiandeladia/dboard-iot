import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import LineChartComponent from "./Chart_old";
import Chart from "./Chart2";
import Chart3 from "./Chart3";
import Navbar from "./Navbar";


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/"); // Redirect to login if not authenticated
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe(); // Cleanup
  }, [navigate]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex flex-col justify-center items-center ">
        <h2 className="text-2xl font-semibold mb-3 mt-9 text-left w-full max-w-11/12">Dashboard</h2>
        {/* <LineChartComponent /> 
        <Chart />  */}
        <Chart3 /> 
      </main>
    </div>
  );
};

export default Dashboard;
