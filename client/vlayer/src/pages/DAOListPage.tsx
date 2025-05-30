import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { DAO } from "../types/dao";
import { daoService } from "../services/daoService";

interface DAOListPageProps {
  onDAOSelect: (daoId: string) => void;
}

export const DAOListPage: React.FC<DAOListPageProps> = ({ onDAOSelect }) => {
  const [daos, setDAOs] = useState<DAO[]>([]);
  const [filteredDAOs, setFilteredDAOs] = useState<DAO[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDAOs = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Loading DAOs...");
        const [daoData, categoryData] = await Promise.all([
          daoService.getAllDAOs(),
          daoService.getCategories(),
        ]);

        console.log("DAO Data received:", daoData);
        console.log("Category Data received:", categoryData);

        // Ensure we have valid data
        const validDAOs = Array.isArray(daoData) ? daoData : [];
        const validCategories = Array.isArray(categoryData) ? categoryData : [];

        console.log("Valid DAOs:", validDAOs.length);
        console.log("Valid Categories:", validCategories.length);

        setDAOs(validDAOs);
        setFilteredDAOs(validDAOs);
        setCategories(validCategories);
      } catch (error) {
        console.error("Error loading DAOs:", error);
        setError("Failed to load DAOs. Please try again later.");
        setDAOs([]);
        setFilteredDAOs([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadDAOs();
  }, []);

  useEffect(() => {
    let filtered = daos;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (dao) =>
          dao.tags && dao.tags.length > 0 && dao.tags.includes(selectedCategory)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (dao) =>
          dao.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dao.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDAOs(filtered);
  }, [daos, selectedCategory, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DAOs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading DAOs</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Discover DAOs</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore and join decentralized autonomous organizations that align
          with your interests and values.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search DAOs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredDAOs.length} of {daos.length} DAOs
      </div>

      {filteredDAOs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No DAOs found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDAOs.map((dao) => {
            // Defensive programming - ensure we have valid DAO data
            if (!dao || !dao.dao_id || !dao.name) {
              return null;
            }

            return (
              <Card
                key={dao.dao_id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => onDAOSelect(dao.dao_id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🏛️</div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {dao.name}
                        </CardTitle>
                        {dao.tags && dao.tags.length > 0 && (
                          <Badge variant="secondary" className="mt-1">
                            {dao.tags[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3">
                    {dao.description || "No description available"}
                  </CardDescription>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Members</p>
                      <p className="font-medium">
                        {dao.total_members?.toLocaleString() ||
                          dao.members?.length?.toLocaleString() ||
                          "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Proposals</p>
                      <p className="font-medium">
                        {dao.total_proposals || dao.proposals?.length || "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {dao.created_at
                          ? formatDate(dao.created_at)
                          : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tokens</p>
                      <p className="font-medium">{dao.tokens?.length || "0"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {dao.socials?.[3] && (
                      <Badge
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(dao.socials[3], "_blank");
                        }}
                      >
                        🌐 Website
                      </Badge>
                    )}
                    {dao.socials?.[2] && (
                      <Badge
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(dao.socials[2], "_blank");
                        }}
                      >
                        🐦 Twitter
                      </Badge>
                    )}
                    {dao.socials?.[0] && (
                      <Badge
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(dao.socials[0], "_blank");
                        }}
                      >
                        💬 Discord
                      </Badge>
                    )}
                  </div>

                  <Button
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDAOSelect(dao.dao_id);
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
