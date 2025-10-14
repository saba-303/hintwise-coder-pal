import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";

interface ProblemAttempt {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  completed: boolean;
  hintsUsed: number;
  timeSpent: number;
  date: Date;
}

const Dashboard = () => {
  const [attempts] = useState<ProblemAttempt[]>([
    {
      id: "1",
      title: "Two Sum",
      difficulty: "Easy",
      completed: true,
      hintsUsed: 1,
      timeSpent: 12,
      date: new Date("2025-10-13"),
    },
    {
      id: "2",
      title: "Valid Parentheses",
      difficulty: "Easy",
      completed: true,
      hintsUsed: 0,
      timeSpent: 8,
      date: new Date("2025-10-13"),
    },
    {
      id: "3",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      completed: false,
      hintsUsed: 2,
      timeSpent: 25,
      date: new Date("2025-10-14"),
    },
  ]);

  const stats = {
    totalProblems: attempts.length,
    completed: attempts.filter((a) => a.completed).length,
    avgHints: (attempts.reduce((acc, a) => acc + a.hintsUsed, 0) / attempts.length).toFixed(1),
    avgTime: Math.round(attempts.reduce((acc, a) => acc + a.timeSpent, 0) / attempts.length),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Practice Dashboard
          </h1>
          <p className="text-muted-foreground">Track your progress and improve your coding skills</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Total Problems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProblems}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.completed / stats.totalProblems) * 100).toFixed(0)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                Avg Hints Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.avgHints}</div>
            </CardContent>
          </Card>

          <Card className="border-warning/20 hover:border-warning/40 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                Avg Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.avgTime} min</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attempts</CardTitle>
            <CardDescription>Your latest problem-solving sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {attempt.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <h3 className="font-medium">{attempt.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            attempt.difficulty === "Easy"
                              ? "default"
                              : attempt.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {attempt.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {attempt.hintsUsed} hints • {attempt.timeSpent} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {attempt.date.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link to="/solve">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Start New Problem
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;