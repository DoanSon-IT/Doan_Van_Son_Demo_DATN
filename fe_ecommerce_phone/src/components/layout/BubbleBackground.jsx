import React from "react";

const BubbleBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
            <span
                key={i}
                className="absolute rounded-full opacity-20"
                style={{
                    width: `${30 + Math.random() * 60}px`,
                    height: `${30 + Math.random() * 60}px`,
                    left: `${Math.random() * 100}%`,
                    bottom: `-${Math.random() * 40}px`,
                    background: `radial-gradient(circle at 30% 30%, #fff, #60a5fa, transparent 70%)`,
                    animation: `bubbleUp ${6 + Math.random() * 6}s linear infinite`,
                    animationDelay: `${Math.random() * 6}s`
                }}
            />
        ))}
    </div>
);

export default BubbleBackground; 