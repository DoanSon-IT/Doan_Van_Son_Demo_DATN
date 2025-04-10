import React from "react";

const AvatarWithFrame = ({ avatarUrl, frameUrl, size = 120 }) => {
    // Adjust the frame ratio for better fit
    const frameRatio = 1.4; // Reduced from 1.66 to prevent excessive overflow
    const frameSize = size * frameRatio;

    return (
        <div className="relative flex items-center justify-center" style={{ width: frameSize, height: frameSize }}>
            {/* Avatar in center */}
            <div
                className="absolute rounded-full overflow-hidden shadow-lg z-20"
                style={{
                    width: size,
                    height: size,
                    // Centered positioning
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                <img
                    src={avatarUrl || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                />
                <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
                    }}
                />
            </div>

            {/* Frame on top */}
            {frameUrl && (
                <img
                    src={frameUrl}
                    alt="Frame"
                    className="absolute pointer-events-none z-30"
                    style={{
                        width: frameSize,
                        height: frameSize,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        objectFit: "contain"
                    }}
                />
            )}
        </div>
    );
};

export default AvatarWithFrame;