
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db} from "../Config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import LineChartComponent from "./Chart_old";
import Chart from "./Chart2";
import Chart3 from "./Chart3";
import Navbar from "./Navbar";


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user data from Firestore where doc ID = UID
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          console.log("No user data found in Firestore");
        }
      } else {
        setUser(null);
        setUserData(null);
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
      <Navbar user={user} userData={userData} setSelectedPlant={setSelectedPlant} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex flex-col justify-center items-center ">
        <h2 className="text-2xl font-semibold mb-3 mt-9 text-left w-full max-w-11/12">Dashboard</h2>
        {/* <LineChartComponent /> 
        <Chart />  */}
        <Chart3 selectedPlant={selectedPlant} /> 
      </main>
    </div>
  );
};

export default Dashboard;
