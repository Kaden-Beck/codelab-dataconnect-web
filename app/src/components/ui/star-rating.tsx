import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 0-10 scale
  onRatingChange: (rating: number) => void;
  className?: string;
}

export default function StarRating({ rating, onRatingChange, className }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  // We display 5 stars, but allow for half-star precision logic
  // Internal values 1-10 map to visual stars 0.5-5.0
  const handleClick = (index: number) => {
    onRatingChange(index);
  };

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  // Helper to check if a star is filled (or half filled ideally, but for simplicity: full stars)
  const isFilled = (starIndex: number) => {
    const target = hoverRating || rating;
    // starIndex is 1-5. Rating is 0-10.
    // e.g. star 1 needs rating >= 2. star 2 needs rating >= 4.
    return target >= starIndex * 2;
  };

  return (
    <div className={cn("flex items-center gap-1", className)} onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star * 2)}
          onMouseEnter={() => handleMouseEnter(star * 2)}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              "w-6 h-6 transition-colors",
              isFilled(star) ? "fill-yellow-500 text-yellow-500" : "fill-none text-muted-foreground"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {(hoverRating || rating) > 0 ? (hoverRating || rating) / 2 : 0} / 5
      </span>
    </div>
  );
}
