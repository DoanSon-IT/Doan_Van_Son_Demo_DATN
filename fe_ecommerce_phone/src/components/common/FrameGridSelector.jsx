import React from "react";
import AvatarWithFrame from "./AvatarWithFrame";

const FrameGridSelector = ({
    frameOptions = [],
    selectedFrameIndex,
    setSelectedFrameIndex,
    avatarUrl
}) => {
    // Create a special version that shows only frames without avatar
    const FrameOnly = ({ frameUrl, isSelected }) => (
        <div className="relative w-24 h-24 flex items-center justify-center">
            <img
                src={frameUrl}
                alt="Frame option"
                className="w-full h-full object-contain"
            />
            {isSelected && (
                <div className="absolute inset-0 bg-purple-500 bg-opacity-10 flex items-center justify-center rounded-xl">
                    <div className="bg-purple-500 w-6 h-6 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {frameOptions.map((frame, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            setSelectedFrameIndex(index);
                            localStorage.setItem("avatarFrame", index);
                        }}
                        className={`relative cursor-pointer border-2 rounded-xl overflow-hidden transform transition-all hover:scale-105 ${selectedFrameIndex === index
                            ? "border-purple-500 scale-105 ring-2 ring-purple-400"
                            : "border-gray-300"
                            }`}
                    >
                        <FrameOnly
                            frameUrl={frame}
                            isSelected={selectedFrameIndex === index}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FrameGridSelector;