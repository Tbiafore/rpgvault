import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export default function RatingDisplay({ rating, size = "sm", showValue = true }: RatingDisplayProps) {
  // Convert rating to number and handle invalid values
  const numericRating = Number(rating) || 0;
  const fullStars = Math.floor(numericRating / 2);
  const hasHalfStar = numericRating % 2 >= 1;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex text-amber-500">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={`${sizeClasses[size]} fill-current`} />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${sizeClasses[size]} text-gray-400`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${sizeClasses[size]} fill-current text-amber-500`} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`${sizeClasses[size]} text-gray-400`} />
        ))}
      </div>
      
      {showValue && (
        <span className={`text-gray-400 ${textSize[size]}`}>
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
