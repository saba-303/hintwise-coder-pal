import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code2, LogOut, User, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

const Problems = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProblems(problems);
    } else {
      setFilteredProblems(problems.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, problems]);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .order("difficulty", { ascending: true });

      if (error) throw error;
      setProblems(data || []);
      setFilteredProblems(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading problems",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "hard": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "";
    }
  };

  const categories = [
    "all",
    "array",
    "string",
    "linked_list",
    "tree",
    "graph",
    "dynamic_programming",
    "sorting",
    "searching",
    "hash_table",
    "stack",
    "queue",
    "heap",
    "math",
    "bit_manipulation",
    "backtracking",
    "greedy",
    "two_pointers",
    "sliding_window"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">CodeSmart</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
                <User className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Problem</h2>
          <p className="text-muted-foreground">Select a coding challenge to start practicing</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat.replace(/_/g, " ").toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Problems Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading problems...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProblems.map((problem) => (
              <Card 
                key={problem.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/solve/${problem.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                    <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {problem.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-xs">
                    {problem.category.replace(/_/g, " ")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No problems found in this category.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Problems;
