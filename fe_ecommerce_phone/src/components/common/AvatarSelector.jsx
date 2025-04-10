import React from "react";

const AvatarSelector = ({
    avatarOptions = [],
    selectedAvatar,
    onAvatarSelect
}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {avatarOptions.map((avatar, idx) => (
                <div
                    key={idx}
                    onClick={() => onAvatarSelect(avatar)}
                    className={`cursor-pointer transform transition-all hover:scale-105 ${selectedAvatar === avatar
                        ? "scale-105"
                        : ""
                        }`}
                >
                    <div className={`rounded-full overflow-hidden border-2 w-16 h-16 mx-auto ${selectedAvatar === avatar
                        ? "border-purple-500 ring-2 ring-purple-400"
                        : "border-gray-300"
                        }`}>
                        <img
                            src={avatar}
                            alt="avatar option"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AvatarSelector;