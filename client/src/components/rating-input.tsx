import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  label?: string;
  className?: string;
}

export default function RatingInput({ 
  value, 
  onChange, 
  max = 10, 
  label = "Rating",
  className = "" 
}: RatingInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleStarClick = (rating: number) => {
    onChange(rating);
    setInputValue(rating.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= max) {
      // Round to 1 decimal place
      const roundedValue = Math.round(numValue * 10) / 10;
      if (roundedValue !== value) {
        onChange(roundedValue);
      }
    }
  };

  const handleInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < 1 || numValue > max) {
      setInputValue(value.toString());
    } else {
      const roundedValue = Math.round(numValue * 10) / 10;
      setInputValue(roundedValue.toString());
      onChange(roundedValue);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : value;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium text-gray-200">{label}</Label>
      
      {/* Visual Star Rating */}
      <div className="flex items-center space-x-1">
        {[...Array(max)].map((_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= displayRating;
          const isHalfActive = !isActive && starValue - 0.5 <= displayRating;
          
          return (
            <button
              key={index}
              type="button"
              className="relative p-1 hover:scale-110 transition-transform"
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
            >
              <Star 
                className={`w-6 h-6 transition-colors ${
                  isActive 
                    ? 'fill-amber-500 text-amber-500' 
                    : isHalfActive 
                    ? 'text-amber-500' 
                    : 'text-gray-400 hover:text-amber-300'
                }`} 
              />
              {isHalfActive && (
                <div className="absolute inset-0 overflow-hidden w-1/2">
                  <Star className="w-6 h-6 fill-amber-500 text-amber-500 ml-1 mt-1" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Numeric Input */}
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          min="1"
          max={max}
          step="0.1"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="w-20 text-center"
          placeholder="8.5"
        />
        <span className="text-sm text-gray-400">/ {max}</span>
      </div>

      {/* Quick Rating Buttons */}
      <div className="flex flex-wrap gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <Button
            key={rating}
            type="button"
            variant={value === rating ? "default" : "outline"}
            size="sm"
            onClick={() => handleStarClick(rating)}
            className={`text-xs ${
              value === rating ? "bg-purple-700 hover:bg-purple-600" : ""
            }`}
          >
            {rating}
          </Button>
        ))}
      </div>

      {/* Half-point buttons */}
      <div className="flex flex-wrap gap-1">
        {[1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5].map((rating) => (
          <Button
            key={rating}
            type="button"
            variant={value === rating ? "default" : "outline"}
            size="sm"
            onClick={() => handleStarClick(rating)}
            className={`text-xs ${
              value === rating ? "bg-purple-700 hover:bg-purple-600" : ""
            }`}
          >
            {rating}
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500">
        Enter a rating from 1.0 to {max}.0 (decimals like 8.7 are allowed)
      </div>
    </div>
  );
}