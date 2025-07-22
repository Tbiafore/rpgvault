import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RatingDisplay from "./rating-display";
import type { Review, User, RpgItem } from "@shared/schema";

interface ReviewCardProps {
  review: Review & { user: User; rpgItem: RpgItem };
  showRpgTitle?: boolean;
}

export default function ReviewCard({ review, showRpgTitle = true }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {review.user.username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-white">{review.user.username}</span>
              <RatingDisplay rating={review.rating} />
            </div>
            {showRpgTitle && (
              <p className="text-sm text-gray-400 mb-2">{review.rpgItem.title}</p>
            )}
            {review.reviewText && (
              <p className="text-sm text-gray-300 mb-2">
                "{review.reviewText.length > 150 
                  ? `${review.reviewText.substring(0, 150)}...` 
                  : review.reviewText}"
              </p>
            )}
            <span className="text-xs text-gray-500">
              {new Date(review.createdAt!).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
