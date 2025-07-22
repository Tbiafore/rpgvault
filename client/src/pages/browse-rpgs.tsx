import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import RpgCard from "@/components/rpg-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { RpgItem } from "@shared/schema";

export default function BrowseRpgs() {
  const [location] = useLocation();
  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    system: "",
  });

  // Handle URL search parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    
    if (searchParam) {
      setFilters(prev => ({ ...prev, search: searchParam }));
    }
  }, [location]);

  const { data: rpgs = [], isLoading } = useQuery<RpgItem[]>({
    queryKey: ["/api/rpgs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.genre) params.append("genre", filters.genre);
      if (filters.system) params.append("system", filters.system);
      
      const res = await fetch(`/api/rpgs?${params}`);
      return res.json();
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" back to empty string for API filtering
    const apiValue = value === "all" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: apiValue }));
  };

  const clearFilters = () => {
    setFilters({ search: "", genre: "", system: "" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Browse RPGs</h1>
          
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search RPGs..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filters.genre} onValueChange={(value) => handleFilterChange("genre", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                    <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                    <SelectItem value="horror">Horror</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                    <SelectItem value="superhero">Superhero</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.system} onValueChange={(value) => handleFilterChange("system", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="System" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Systems</SelectItem>
                    <SelectItem value="AD&D 1e">AD&D 1e</SelectItem>
                    <SelectItem value="Boot Hill">Boot Hill</SelectItem>
                    <SelectItem value="Call of Cthulhu">Call of Cthulhu</SelectItem>
                    <SelectItem value="Champions">Champions</SelectItem>
                    <SelectItem value="Cthulhu Invictus">Cthulhu Invictus</SelectItem>
                    <SelectItem value="Cyberpunk 2013">Cyberpunk 2013</SelectItem>
                    <SelectItem value="Cyberpunk 2020">Cyberpunk 2020</SelectItem>
                    <SelectItem value="Cyberpunk Red">Cyberpunk Red</SelectItem>
                    <SelectItem value="D&D 5e">D&D 5e</SelectItem>
                    <SelectItem value="DC Heroes">DC Heroes</SelectItem>
                    <SelectItem value="Delta Green">Delta Green</SelectItem>
                    <SelectItem value="Dungeon Crawl Classics">Dungeon Crawl Classics</SelectItem>
                    <SelectItem value="Icons">Icons</SelectItem>
                    <SelectItem value="Marvel Multiverse RPG">Marvel Multiverse RPG</SelectItem>
                    <SelectItem value="Marvel Super Heroes">Marvel Super Heroes</SelectItem>
                    <SelectItem value="Mutants & Masterminds">Mutants & Masterminds</SelectItem>
                    <SelectItem value="Pulp Cthulhu">Pulp Cthulhu</SelectItem>
                    <SelectItem value="Savage Worlds">Savage Worlds</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        ) : rpgs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-xl text-gray-400">No RPGs found matching your criteria.</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rpgs.map((rpg) => (
              <RpgCard key={rpg.id} rpg={rpg} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
