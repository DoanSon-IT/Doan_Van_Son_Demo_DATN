import React from "react";
import { Star } from "lucide-react";

const StarRatingInput = ({ value = 0, onChange }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={20}
                    className={`cursor-pointer transition-colors ${star <= value ? "text-yellow-400" : "text-gray-300"
                        }`}
                    onClick={() => onChange(star)}
                    fill={star <= value ? "#facc15" : "none"}
                />
            ))}
        </div>
    );
};

export default StarRatingInput;
