import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import RatingDisplay from "@/components/rating-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Star, Trophy, Filter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllCategories, getCategoryById } from "@shared/categories";
import type { RpgItem } from "@shared/schema";
import type { MainCategory, SubCategory } from "@shared/categories";

interface RankingsResponse {
  items: RpgItem[];
  totalCount: number;
  hasMore: boolean;
}

export default function Rankings() {
  const [activeCategory, setActiveCategory] = useState("overall");
  const [activeSubcategory, setActiveSubcategory] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const categories = getAllCategories();
  const currentCategory = getCategoryById(activeCategory);

  const { data: rankingsData, isLoading } = useQuery<RankingsResponse>({
    queryKey: ["/api/rankings", activeCategory, activeSubcategory, currentPage],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage;
      let url = `/api/rankings/${activeCategory}?limit=${itemsPerPage}&offset=${offset}`;
      if (activeSubcategory) {
        url += `&subcategory=${activeSubcategory}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch rankings: ${res.status}`);
      }
      return res.json();
    },
  });

  const rankedRpgs = rankingsData?.items || [];
  const totalCount = rankingsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveSubcategory(undefined); // Reset subcategory when changing main category
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Trophy className="w-8 h-8 text-amber-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">RPG Rankings</h1>
          </div>
          
          <p className="text-gray-400 mb-8">
            Discover the highest-rated RPGs using our Bayesian rating system that accounts for both rating quality and quantity.
            Rankings are updated automatically as new reviews are added.
          </p>

          {/* Category Selection */}
          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            {/* Main Category Selection */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Main Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Button
                      key="overall"
                      variant={activeCategory === "overall" ? "default" : "outline"}
                      onClick={() => handleCategoryChange("overall")}
                      className={`text-sm h-auto py-3 px-4 whitespace-normal text-center leading-tight ${activeCategory === "overall" ? "bg-purple-700 hover:bg-purple-600" : ""}`}
                    >
                      Overall
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`text-sm h-auto py-3 px-4 whitespace-normal text-center leading-tight ${activeCategory === category.id ? "bg-purple-700 hover:bg-purple-600" : ""}`}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            {/* Subcategory Selection */}
            {currentCategory && currentCategory.subcategories.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <ChevronDown className="w-5 h-5 mr-2" />
                    Subcategory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={activeSubcategory || "all"} onValueChange={(value) => setActiveSubcategory(value === "all" ? undefined : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={`All ${currentCategory.name} subcategories`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All {currentCategory.name}</SelectItem>
                      {currentCategory.subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {activeSubcategory && (
                    <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-300">
                        {currentCategory.subcategories.find(s => s.id === activeSubcategory)?.description}
                      </p>
                      {currentCategory.subcategories.find(s => s.id === activeSubcategory)?.examples && (
                        <p className="text-xs text-gray-500 mt-2">
                          Examples: {currentCategory.subcategories.find(s => s.id === activeSubcategory)?.examples?.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Rankings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-700 rounded"></div>
                    <div className="w-16 h-16 bg-gray-700 rounded"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded"></div>
                    </div>
                    <div className="w-24 h-6 bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rankedRpgs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">No Rankings Available</h2>
              <p className="text-gray-400">No RPGs have been rated in this category yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Array.isArray(rankedRpgs) && rankedRpgs.map((rpg, index) => (
              <Card key={rpg.id} className="hover:bg-gray-800 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      <span className="text-2xl font-bold text-amber-500">
                        #{(currentPage - 1) * itemsPerPage + index + 1}
                      </span>
                    </div>

                    {/* RPG Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={rpg.imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                        alt={rpg.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    </div>

                    {/* RPG Info */}
                    <div className="flex-1">
                      <Link href={`/rpg/${rpg.id}`}>
                        <h3 className="text-xl font-bold text-white hover:text-purple-400 cursor-pointer">
                          {rpg.title}
                        </h3>
                      </Link>
                      <p className="text-gray-400 mb-2 line-clamp-2">
                        {rpg.description?.substring(0, 100)}...
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="capitalize">
                          {rpg.genre}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {rpg.type}
                        </Badge>
                        {rpg.system && (
                          <Badge variant="outline">
                            {rpg.system}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex-shrink-0 text-right">
                      <RatingDisplay rating={parseFloat(rpg.averageRating || '0')} />
                      <p className="text-sm text-gray-400 mt-1">
                        {rpg.reviewCount} review{rpg.reviewCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} adventures
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        
                        <div className="flex space-x-1">
                          {/* First page */}
                          {currentPage > 3 && (
                            <>
                              <Button
                                variant={1 === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(1)}
                              >
                                1
                              </Button>
                              {currentPage > 4 && (
                                <span className="px-2 py-1 text-gray-400">...</span>
                              )}
                            </>
                          )}
                          
                          {/* Current page and nearby pages */}
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                            if (pageNum > totalPages) return null;
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                          
                          {/* Last page */}
                          {currentPage < totalPages - 2 && (
                            <>
                              {currentPage < totalPages - 3 && (
                                <span className="px-2 py-1 text-gray-400">...</span>
                              )}
                              <Button
                                variant={totalPages === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(totalPages)}
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
