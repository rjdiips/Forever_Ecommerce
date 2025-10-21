import React from "react";
import { assets } from "../assets/assets.js";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex justify-between items-center bg-gray-100 py-2 px-[4%]">
      <img className="w-[max(10%,80px)]" src={assets.logo} alt="" />
      <button
        onClick={() => {
          setToken("");
        }}
        className="bg-white hover:bg-black text-black hover:text-white border px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
