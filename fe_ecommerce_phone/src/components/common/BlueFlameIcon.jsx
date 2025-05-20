const BlueFlameIcon = ({ size = 20, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 2C12 2 7 8 7 13C7 16.3137 9.68629 19 13 19C16.3137 19 19 16.3137 19 13C19 8 12 2 12 2Z"
            fill="url(#blueFlameGradient)"
            stroke="#2563eb"
            strokeWidth="1.5"
        />
        <defs>
            <linearGradient id="blueFlameGradient" x1="12" y1="2" x2="12" y2="19" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
        </defs>
    </svg>
);

export default BlueFlameIcon; 