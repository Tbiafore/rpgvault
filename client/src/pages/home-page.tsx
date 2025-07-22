import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import RpgCard from "@/components/rpg-card";
import ReviewCard from "@/components/review-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Dice6, Star, Users } from "lucide-react";
import type { RpgItem, Review, User } from "@shared/schema";
import customBannerImage from "@assets/Image_1753200339611.png";

export default function HomePage() {
  const [selectedGenre, setSelectedGenre] = useState("overall");

  const { data: featuredRpgs = [], isLoading: rpgsLoading } = useQuery<RpgItem[]>({
    queryKey: ["/api/rpgs", "featured"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/rpgs?featured=true&limit=6");
        if (!res.ok) throw new Error('Failed to fetch featured RPGs');
        const data = await res.json();
        return Array.isArray(data) ? data.map((item: any) => ({
          ...item,
          averageRating: typeof item.averageRating === 'string' ? parseFloat(item.averageRating) || 0 : item.averageRating || 0,
          bayesianRating: typeof item.bayesianRating === 'string' ? parseFloat(item.bayesianRating) || 0 : item.bayesianRating || 0,
          reviewCount: typeof item.reviewCount === 'string' ? parseInt(item.reviewCount) || 0 : item.reviewCount || 0
        })) : [];
      } catch (error) {
        console.error('Featured RPGs query error:', error);
        return [];
      }
    },
  });

  // Get total count of all RPG adventures for stats
  const { data: allRpgs = [] } = useQuery<RpgItem[]>({
    queryKey: ["/api/rpgs", "all"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/rpgs");
        if (!res.ok) throw new Error('Failed to fetch RPGs');
        const data = await res.json();
        return Array.isArray(data) ? data.map((item: any) => ({
          ...item,
          averageRating: typeof item.averageRating === 'string' ? parseFloat(item.averageRating) || 0 : item.averageRating || 0,
          bayesianRating: typeof item.bayesianRating === 'string' ? parseFloat(item.bayesianRating) || 0 : item.bayesianRating || 0,
          reviewCount: typeof item.reviewCount === 'string' ? parseInt(item.reviewCount) || 0 : item.reviewCount || 0
        })) : [];
      } catch (error) {
        console.error('RPGs query error:', error);
        return [];
      }
    },
  });

  const { data: topRanked = [], isLoading: rankingsLoading } = useQuery<RpgItem[]>({
    queryKey: ["/api/rankings", selectedGenre],
    queryFn: async () => {
      try {
        const endpoint = selectedGenre === "overall" 
          ? "/api/rankings/overall?limit=10"
          : `/api/rankings/${selectedGenre}?limit=10`;
        const res = await fetch(endpoint);
        if (!res.ok) {
          // If genre-specific endpoint fails, fallback to overall
          if (selectedGenre !== "overall") {
            const fallbackRes = await fetch("/api/rankings/overall?limit=10");
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              return (fallbackData.items || fallbackData || []).map((item: any) => ({
                ...item,
                averageRating: typeof item.averageRating === 'string' ? parseFloat(item.averageRating) : item.averageRating,
                bayesianRating: typeof item.bayesianRating === 'string' ? parseFloat(item.bayesianRating) : item.bayesianRating
              }));
            }
          }
          throw new Error('Failed to fetch rankings');
        }
        const data = await res.json();
        const items = data.items || data || [];
        return items.map((item: any) => ({
          ...item,
          averageRating: typeof item.averageRating === 'string' ? parseFloat(item.averageRating) : item.averageRating,
          bayesianRating: typeof item.bayesianRating === 'string' ? parseFloat(item.bayesianRating) : item.bayesianRating
        }));
      } catch (error) {
        console.error('Rankings query error:', error);
        return [];
      }
    },
  });

  const { data: recentReviews = [] } = useQuery<(Review & { user: User; rpgItem: RpgItem })[]>({
    queryKey: ["/api/reviews"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        return Array.isArray(data) ? data.map((review: any) => ({
          ...review,
          rating: typeof review.rating === 'string' ? parseFloat(review.rating) : review.rating || 0
        })) : [];
      } catch (error) {
        console.error('Reviews query error:', error);
        return [];
      }
    },
  });

  const { data: stats } = useQuery<{
    rpgCount: number;
    reviewCount: number;
    userCount: number;
    forumPostCount: number;
  }>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        return {
          rpgCount: typeof data.rpgCount === 'string' ? parseInt(data.rpgCount) || 0 : data.rpgCount || 0,
          reviewCount: typeof data.reviewCount === 'string' ? parseInt(data.reviewCount) || 0 : data.reviewCount || 0,
          userCount: typeof data.userCount === 'string' ? parseInt(data.userCount) || 0 : data.userCount || 0,
          forumPostCount: typeof data.forumPostCount === 'string' ? parseInt(data.forumPostCount) || 0 : data.forumPostCount || 0
        };
      } catch (error) {
        console.error('Stats query error:', error);
        return { rpgCount: 0, reviewCount: 0, userCount: 0, forumPostCount: 0 };
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative py-16 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${customBannerImage})`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              The Ultimate RPG Community
            </h2>
            <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto drop-shadow-md">
              Discover, review, and discuss the best tabletop role-playing games. From D&D to indie systems, find your next adventure here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 shadow-lg">
                  Browse RPGs
                </Button>
              </Link>
              <Link href="/forums">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-700 shadow-lg">
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2 flex items-center justify-center">
                <Dice6 className="mr-2" />
                {stats?.rpgCount || allRpgs.length}
              </div>
              <div className="text-gray-400">RPG Adventures Listed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-500 mb-2 flex items-center justify-center">
                <Star className="mr-2" />
                {stats?.reviewCount || recentReviews.length}
              </div>
              <div className="text-gray-400">Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2 flex items-center justify-center">
                <Users className="mr-2" />
                {stats?.userCount || 0}
              </div>
              <div className="text-gray-400">Active Users</div>
            </CardContent>
          </Card>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured RPGs Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Featured RPGs</h3>
                <Link href="/browse">
                  <Button variant="link" className="text-purple-500 hover:text-purple-400">
                    View All
                  </Button>
                </Link>
              </div>
              
              {rpgsLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="w-full h-48 bg-gray-700 rounded-t-lg"></div>
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-6 bg-gray-700 rounded mb-4"></div>
                        <div className="h-16 bg-gray-700 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.isArray(featuredRpgs) && featuredRpgs.slice(0, 4).map((rpg) => (
                    <RpgCard key={rpg.id} rpg={rpg} />
                  ))}
                </div>
              )}
            </section>

            {/* Top Rankings Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Top Ranked Adventures</h3>
                <Link href="/rankings">
                  <Button variant="link" className="text-purple-500 hover:text-purple-400">
                    View All Rankings
                  </Button>
                </Link>
              </div>
              
              <Card>
                <div className="border-b border-gray-700">
                  <nav className="flex overflow-x-auto">
                    {[
                      { key: "overall", label: "All" },
                      { key: "fantasy", label: "Fantasy" },
                      { key: "sci-fi", label: "Science Fiction" },
                      { key: "horror", label: "Horror" },
                      { key: "historical", label: "Historical" },
                      { key: "modern", label: "Modern/Urban" },
                      { key: "superhero", label: "Superhero" }
                    ].map(genre => (
                      <button 
                        key={genre.key}
                        onClick={() => setSelectedGenre(genre.key)}
                        className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                          selectedGenre === genre.key 
                            ? "bg-purple-700 text-white" 
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        }`}
                      >
                        {genre.label}
                      </button>
                    ))}
                    <Link href="/rankings">
                      <button className="px-4 py-3 text-gray-400 hover:text-white font-medium text-sm whitespace-nowrap">
                        More →
                      </button>
                    </Link>
                  </nav>
                </div>
                
                <CardContent className="p-6">
                  {rankingsLoading ? (
                    <div className="space-y-4">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 py-3 animate-pulse">
                          <div className="w-8 h-8 bg-gray-700 rounded"></div>
                          <div className="w-12 h-12 bg-gray-700 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-700 rounded"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : topRanked.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No {selectedGenre === "overall" ? "rankings" : selectedGenre + " adventures"} available yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(topRanked) && topRanked.map((rpg, index) => (
                        <Link key={rpg.id} href={`/rpg/${rpg.id}`}>
                          <div className="flex items-center space-x-4 py-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800 transition-colors cursor-pointer rounded-lg px-2">
                            <div className="flex-shrink-0 w-8 text-center">
                              <span className="text-lg font-bold text-amber-500">{index + 1}</span>
                            </div>
                            <img 
                              src={rpg.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                              alt={rpg.title} 
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div className="flex-1">
                              <h5 className="font-semibold text-white hover:text-purple-400 transition-colors">{rpg.title}</h5>
                              <p className="text-sm text-gray-400">{rpg.description?.substring(0, 50)}...</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex text-amber-500 text-sm">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                              </div>
                              <span className="text-gray-400 text-sm">{parseFloat(rpg.bayesianRating || rpg.averageRating || '0').toFixed(1)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Reviews */}
            <section>
              <h3 className="text-xl font-bold text-white mb-6">Recent Reviews</h3>
              <div className="space-y-4">
                {recentReviews.length === 0 ? (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-gray-400 text-center">No reviews yet. Be the first to write one!</p>
                    </CardContent>
                  </Card>
                ) : (
                  recentReviews.slice(0, 3).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/submit-adventure">
                  <Button className="w-full bg-purple-700 hover:bg-purple-600">
                    <Dice6 className="mr-2 h-4 w-4" />
                    Submit RPG Adventure
                  </Button>
                </Link>


              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
