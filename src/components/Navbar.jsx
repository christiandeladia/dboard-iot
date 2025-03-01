import { FiLogOut } from "react-icons/fi";
import logo from '../assets/img/logo/logo.png';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img
          className="mb-2"
          src={logo}
          alt="Blueshift"
          width="40"
          height="40"
        />
        <h1 className="text-2xl font-semibold text-gray-900">Blueshift</h1>
      </div>

      <div className="flex items-center gap-4">
      {user && (
          <div>
            <p className="text-gray-700">Welcome, {user.email}</p>
            <p className="text-gray-500 text-sm">UID: {user.uid}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-4xl flex items-center gap-2 hover:bg-red-700 transition-all"
        >
          <FiLogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
