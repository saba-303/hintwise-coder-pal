import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Clock, Lightbulb, Play, Send, ArrowLeft } from "lucide-react";

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  constraints: string[];
  test_cases: any[];
  solution_template: string;
}

const ProblemSolver = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [progressId, setProgressId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (problemId && userId) {
      fetchProblem();
      loadProgress();
    }
  }, [problemId, userId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-save code every 10 seconds
  useEffect(() => {
    if (userId && problemId && code) {
      const autoSave = setInterval(() => {
        saveProgress(false);
      }, 10000);

      return () => clearInterval(autoSave);
    }
  }, [code, userId, problemId]);

  const fetchProblem = async () => {
    try {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("id", problemId)
        .single();

      if (error) throw error;
      setProblem({
        ...data,
        test_cases: Array.isArray(data.test_cases) ? data.test_cases : [],
        constraints: Array.isArray(data.constraints) ? data.constraints : []
      });
      if (!code) {
        setCode(data.solution_template);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading problem",
        description: error.message,
      });
      navigate("/problems");
    }
  };

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("problem_id", problemId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProgressId(data.id);
        setCode(data.code || problem?.solution_template || "");
        setTimeElapsed(data.time_spent || 0);
        setHints(Array.isArray(data.hints_details) ? data.hints_details.map(h => String(h)) : []);
      }
    } catch (error: any) {
      console.error("Error loading progress:", error);
    }
  };

  const saveProgress = async (showToast = true) => {
    if (!userId || !problemId) return;

    try {
      const progressData = {
        user_id: userId,
        problem_id: problemId,
        code: code,
        time_spent: timeElapsed,
        hints_used: hints.length,
        hints_details: hints,
        last_saved_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_progress")
        .upsert(progressData, { onConflict: 'user_id,problem_id' })
        .select()
        .single();

      if (error) throw error;
      
      if (data && !progressId) {
        setProgressId(data.id);
      }

      if (showToast) {
        toast({
          title: "Progress saved",
          description: "Your code has been saved successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error saving progress:", error);
      if (showToast) {
        toast({
          variant: "destructive",
          title: "Error saving progress",
          description: error.message,
        });
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const requestHint = async () => {
    if (isGeneratingHint || !problem) return;

    setIsGeneratingHint(true);
    try {
      const currentHintLevel = hints.length + 1;
      
      const { data, error } = await supabase.functions.invoke("generate-hint", {
        body: {
          problem: {
            title: problem.title,
            description: problem.description,
            constraints: problem.constraints,
          },
          hintLevel: currentHintLevel,
          currentCode: code,
        },
      });

      if (error) throw error;

      const newHint = data.hint;
      const updatedHints = [...hints, newHint];
      setHints(updatedHints);

      toast({
        title: `Hint ${currentHintLevel}`,
        description: "New hint generated successfully!",
      });

      // Save progress with new hint
      await saveProgress(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error generating hint",
        description: error.message,
      });
    } finally {
      setIsGeneratingHint(false);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running code...\n");
    
    try {
      // Simulate code execution with test cases
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (problem?.test_cases && problem.test_cases.length > 0) {
        let results = "Test Results:\n\n";
        problem.test_cases.forEach((testCase: any, index: number) => {
          results += `Test Case ${index + 1}:\n`;
          results += `Input: ${testCase.input}\n`;
          results += `Expected: ${testCase.output}\n`;
          results += `Status: Simulated (Run in browser)\n\n`;
        });
        setOutput(results);
      } else {
        setOutput("Code executed successfully!\n\nNote: Actual execution coming soon.");
      }

      toast({
        title: "Code executed",
        description: "Check the output console below.",
      });
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Execution error",
        description: error.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!userId || !problemId) return;

    try {
      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: userId,
          problem_id: problemId,
          code: code,
          status: "solved",
          time_spent: timeElapsed,
          hints_used: hints.length,
          hints_details: hints,
          submitted_at: new Date().toISOString(),
          last_saved_at: new Date().toISOString(),
        }, { onConflict: 'user_id,problem_id' });

      if (error) throw error;

      toast({
        title: "Solution submitted!",
        description: "Your solution has been saved. Check your dashboard for progress.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error submitting solution",
        description: error.message,
      });
    }
  };

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading problem...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/problems")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold">{problem.title}</h1>
              <Badge variant="outline">{problem.difficulty}</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => saveProgress(true)}>
                Save Progress
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground whitespace-pre-wrap">{problem.description}</p>
                
                <div>
                  <h3 className="font-semibold mb-2">Constraints:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Test Cases:</h3>
                  <div className="space-y-2">
                    {problem.test_cases.map((testCase: any, index: number) => (
                      <div key={index} className="p-3 rounded bg-muted/50 text-sm">
                        <p><strong>Input:</strong> {testCase.input}</p>
                        <p><strong>Output:</strong> {testCase.output}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Progressive Hints</CardTitle>
                  <Button
                    size="sm"
                    onClick={requestHint}
                    disabled={isGeneratingHint || hints.length >= 4}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {isGeneratingHint ? "Generating..." : `Request Hint ${hints.length + 1}/4`}
                  </Button>
                </div>
                <CardDescription>
                  Get AI-powered hints to guide your thinking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hints.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hints requested yet. Try solving the problem first!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {hints.map((hint, index) => (
                      <div key={index} className="p-3 rounded bg-accent/10 border border-accent/20">
                        <p className="text-xs font-semibold text-accent mb-1">Hint {index + 1}</p>
                        <p className="text-sm">{hint}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Editor</CardTitle>
                <CardDescription>Write your solution (auto-saves every 10 seconds)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono min-h-[400px] text-sm"
                  placeholder="Write your code here..."
                />
                <div className="flex gap-2 mt-4">
                  <Button onClick={runCode} disabled={isRunning} className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? "Running..." : "Run Code"}
                  </Button>
                  <Button onClick={submitCode} variant="default" className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Solution
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Output Console</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded min-h-[200px] whitespace-pre-wrap font-mono">
                  {output || "Run your code to see output here..."}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolver;