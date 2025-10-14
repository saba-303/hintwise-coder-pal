import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock, Play, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SAMPLE_PROBLEM = {
  title: "Two Sum",
  difficulty: "Easy",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]`,
  constraints: `• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
• -10^9 <= target <= 10^9
• Only one valid answer exists.`,
};

const ProblemSolver = () => {
  const [code, setCode] = useState("// Write your solution here\n");
  const [hints, setHints] = useState<string[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const requestHint = async () => {
    setIsGeneratingHint(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-hint", {
        body: {
          problem: SAMPLE_PROBLEM.title,
          description: SAMPLE_PROBLEM.description,
          hintLevel: currentHintIndex + 1,
          totalHints: 4,
        },
      });

      if (error) throw error;

      if (data?.hint) {
        setHints((prev) => [...prev, data.hint]);
        setCurrentHintIndex((prev) => prev + 1);
        toast({
          title: `Hint ${currentHintIndex + 2}`,
          description: "New hint revealed!",
        });
      }
    } catch (error) {
      console.error("Error generating hint:", error);
      toast({
        title: "Error",
        description: "Failed to generate hint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingHint(false);
    }
  };

  const runCode = () => {
    toast({
      title: "Code Executed",
      description: "Check the console for output (demo mode)",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{SAMPLE_PROBLEM.title}</h1>
              <Badge
                variant={
                  SAMPLE_PROBLEM.difficulty === "Easy"
                    ? "default"
                    : SAMPLE_PROBLEM.difficulty === "Medium"
                    ? "secondary"
                    : "destructive"
                }
              >
                {SAMPLE_PROBLEM.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" />
                <span>{currentHintIndex + 1} hints used</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-foreground">
                    {SAMPLE_PROBLEM.description}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {SAMPLE_PROBLEM.constraints}
                </pre>
              </CardContent>
            </Card>

            {/* Hints Section */}
            {hints.length > 0 && (
              <Card className="border-accent/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    Progressive Hints
                  </CardTitle>
                  <CardDescription>
                    Hints get more specific as you progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hints.map((hint, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-accent/10 border border-accent/30 animate-in fade-in slide-in-from-left-4"
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="text-accent border-accent">
                          Hint {index + 1}
                        </Badge>
                        <p className="text-sm flex-1">{hint}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button
              onClick={requestHint}
              disabled={isGeneratingHint || currentHintIndex >= 3}
              className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
              size="lg"
            >
              <Lightbulb className="mr-2 h-5 w-5" />
              {isGeneratingHint
                ? "Generating Hint..."
                : currentHintIndex >= 3
                ? "All Hints Revealed"
                : "Request Next Hint"}
            </Button>
          </div>

          {/* Code Editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Code Editor</CardTitle>
                <CardDescription>Write your solution here</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="code-editor min-h-[500px] font-mono text-sm resize-none"
                  placeholder="// Start coding..."
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={runCode} className="flex-1 bg-primary hover:bg-primary/90">
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </Button>
              <Button variant="outline" className="flex-1">
                Submit Solution
              </Button>
            </div>

            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-sm">Output Console</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="code-editor p-4 min-h-[120px] text-sm font-mono text-muted-foreground">
                  Ready to run your code...
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolver;