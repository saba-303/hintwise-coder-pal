import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Lightbulb, TrendingUp, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI-Powered Coding Assistant</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Master Coding with
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Progressive Hints
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            CodeSmart helps you learn to code by providing timed, progressive hints that guide you
            toward the solution without giving it away. Build genuine problem-solving skills.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/solve">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-6"
              >
                <Code2 className="mr-2 h-5 w-5" />
                Start Solving
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="text-center space-y-4 p-6 rounded-2xl border border-border hover:border-primary/40 transition-colors bg-card">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Progressive Hints</h3>
            <p className="text-muted-foreground">
              Get hints that gradually increase in detail, helping you think through problems step
              by step
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-2xl border border-border hover:border-accent/40 transition-colors bg-card">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30">
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your improvement over time and identify patterns in your problem-solving
              approach
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-2xl border border-border hover:border-warning/40 transition-colors bg-card">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-warning/20 to-accent/20 border border-warning/30">
              <Code2 className="h-8 w-8 text-warning" />
            </div>
            <h3 className="text-xl font-bold">Real-Time Practice</h3>
            <p className="text-muted-foreground">
              Solve problems with a timer that tracks your progress and provides hints at the right
              moments
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start p-6 rounded-xl border border-border bg-card">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Choose a Problem</h3>
                <p className="text-muted-foreground">
                  Select from a variety of coding challenges across different difficulty levels
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-6 rounded-xl border border-border bg-card">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Start Solving</h3>
                <p className="text-muted-foreground">
                  Begin coding while the timer tracks your progress and hint availability
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-6 rounded-xl border border-border bg-card">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-warning/20 text-warning flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Get AI Hints</h3>
                <p className="text-muted-foreground">
                  Request progressive hints that guide your thinking without spoiling the solution
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-6 rounded-xl border border-border bg-card">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Track & Improve</h3>
                <p className="text-muted-foreground">
                  Review your attempts and watch your problem-solving skills improve over time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
