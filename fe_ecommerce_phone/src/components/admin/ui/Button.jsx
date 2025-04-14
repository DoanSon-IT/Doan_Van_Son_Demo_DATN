import React from "react";

export const Button = ({ children, onClick, type = "button", className = "" }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`bg-black hover:bg-pink-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        >
            {children}
        </button>
    );
};
