import React from "react";
import { AiOutlineClose } from "react-icons/ai";
import { MdEmail, MdTextsms, MdCall } from "react-icons/md";

const HelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-11/12 max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-lg transition-transform transform translate-y-0">
        <div className="mb-6 flex justify-between">
          <h3 className="text-lg font-bold">Need Help Estimating?</h3>
          <button onClick={onClose}>
            <AiOutlineClose className="text-black text-2xl" />
          </button>
        </div>

        <p className="text-gray-700 mb-6">
          Not sure how much your electricity bill is? Would you like us to assist you via:
        </p>

        <div className="flex space-x-2 justify-center w-full">
          {/* Email Assistance */}
          <a href="mailto:support@example.com?subject=Assistance Needed" className="flex-1 block">
            <button className="w-full bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200 transition flex items-center justify-center space-x-2">
              <MdEmail className="inline-block" />
              <span>Email</span>
            </button>
          </a>
          {/* Text Me */}
          <a href="sms:1234567890" className="flex-1 block">
            <button className="w-full bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200 transition flex items-center justify-center space-x-2">
              <MdTextsms className="inline-block" />
              <span>Text</span>
            </button>
          </a>
          {/* Call Me */}
          <a href="tel:1234567890" className="flex-1 block">
            <button className="w-full bg-gray-100 px-4 py-2 rounded font-medium hover:bg-gray-200 transition flex items-center justify-center space-x-2">
              <MdCall className="inline-block" />
              <span>Call</span>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
