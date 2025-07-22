import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RatingDisplay from "./rating-display";
import type { RpgItem } from "@shared/schema";
import { Crown } from "lucide-react";

interface RpgCardProps {
  rpg: RpgItem;
}

export default function RpgCard({ rpg }: RpgCardProps) {
  return (
    <Link href={`/rpg/${rpg.id}`}>
      <Card className="overflow-hidden hover:transform hover:scale-105 transition-transform duration-200 cursor-pointer relative">
        {rpg.isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-amber-500 text-black px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-semibold">
            <Crown className="w-3 h-3" />
            <span>Featured</span>
          </div>
        )}
        <img 
          src={rpg.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"} 
          alt={rpg.title} 
          className="w-full h-48 object-cover"
        />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="capitalize">
                {rpg.genre}
              </Badge>
              {rpg.isFeatured && (
                <Badge variant="default" className="bg-amber-500 text-black hover:bg-amber-600">
                  <Crown className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-end">
              <RatingDisplay rating={parseFloat(rpg.bayesianRating || rpg.averageRating || '0')} />
              {rpg.reviewCount > 0 && rpg.reviewCount < 10 && (
                <span className="text-xs text-gray-500">Adjusted</span>
              )}
            </div>
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">{rpg.title}</h4>
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
            {rpg.description || "No description available..."}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{rpg.reviewCount} review{rpg.reviewCount !== 1 ? 's' : ''}</span>
            {rpg.system && <span>System: {rpg.system}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
