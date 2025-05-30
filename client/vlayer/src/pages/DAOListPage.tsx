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

  useEffect(() => {
    const loadDAOs = async () => {
      try {
        setLoading(true);
        const [daoData, categoryData] = await Promise.all([
          daoService.getAllDAOs(),
          daoService.getCategories(),
        ]);
        setDAOs(daoData);
        setFilteredDAOs(daoData);
        setCategories(categoryData);
      } catch (error) {
        console.error("Error loading DAOs:", error);
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
      filtered = filtered.filter((dao) => dao.tags.includes(selectedCategory));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (dao) =>
          dao.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dao.description.toLowerCase().includes(searchTerm.toLowerCase())
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
          {filteredDAOs.map((dao) => (
            <Card
              key={dao.dao_id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🏛️</div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {dao.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {dao.tags[0]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-3">
                  {dao.description}
                </CardDescription>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Members</p>
                    <p className="font-medium">
                      {dao.total_members.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Proposals</p>
                    <p className="font-medium">{dao.total_proposals}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(dao.created_at)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {dao.socials[3] && (
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer"
                      onClick={() => window.open(dao.socials[3], "_blank")}
                    >
                      🌐 Website
                    </Badge>
                  )}
                  {dao.socials[2] && (
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer"
                      onClick={() => window.open(dao.socials[2], "_blank")}
                    >
                      🐦 Twitter
                    </Badge>
                  )}
                  {dao.socials[0] && (
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer"
                      onClick={() => window.open(dao.socials[0], "_blank")}
                    >
                      💬 Discord
                    </Badge>
                  )}
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={() => onDAOSelect(dao.dao_id)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
