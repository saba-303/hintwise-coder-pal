import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Lightbulb, TrendingUp, Code2, ArrowLeft, User } from "lucide-react";

interface UserProgress {
  id: string;
  problem_id: string;
  status: string;
  hints_used: number;
  time_spent: number;
  submitted_at: string | null;
  hints_details: string[];
  problems: {
    title: string;
    difficulty: string;
    category: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<UserProgress[]>([]);
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
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select(`
          *,
          problems (
            title,
            difficulty,
            category
          )
        `)
        .eq("user_id", user.id)
        .order("last_saved_at", { ascending: false });

      if (error) throw error;
      setProgress((data || []).map(item => ({
        ...item,
        hints_details: Array.isArray(item.hints_details) ? item.hints_details.map(h => String(h)) : []
      })));
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const stats = {
    totalProblems: progress.length,
    solved: progress.filter(p => p.status === "solved").length,
    avgHints: progress.length > 0 
      ? (progress.reduce((acc, p) => acc + p.hints_used, 0) / progress.length).toFixed(1)
      : "0",
    avgTime: progress.length > 0
      ? formatTime(Math.floor(progress.reduce((acc, p) => acc + p.time_spent, 0) / progress.length))
      : "0m 0s",
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "hard": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "solved": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "attempted": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "in_progress": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/problems")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Problems
              </Button>
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold">My Dashboard</h1>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
              <User className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProblems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.solved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Hints Used</CardTitle>
              <Lightbulb className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgHints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgTime}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Your Progress & Hints Report</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading your progress...</p>
            ) : progress.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven't attempted any problems yet.
                </p>
                <Button onClick={() => navigate("/problems")}>
                  Start Solving Problems
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {progress.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/solve/${item.problem_id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{item.problems.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={getDifficultyColor(item.problems.difficulty)}>
                            {item.problems.difficulty}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(item.status)}>
                            {item.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="secondary">
                            {item.problems.category.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <Lightbulb className="h-3 w-3" />
                          <span>{item.hints_used} hints used</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(item.time_spent)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hints Report */}
                    {item.hints_details && item.hints_details.length > 0 && (
                      <div className="mt-2 pt-3 border-t border-border/40">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Hints Used:</p>
                        <div className="space-y-2">
                          {item.hints_details.map((hint, index) => (
                            <div key={index} className="text-sm p-2 rounded bg-accent/10 border border-accent/20">
                              <span className="text-xs font-semibold text-accent">Hint {index + 1}:</span>
                              <p className="text-muted-foreground mt-1">{hint}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;