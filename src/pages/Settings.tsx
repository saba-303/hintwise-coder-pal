import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [hintStyle, setHintStyle] = useState("balanced");
  const [hintDelay, setHintDelay] = useState([3]);
  const [autoHints, setAutoHints] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const { toast } = useToast();

  const saveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">Customize your learning experience</p>
        </div>

        <div className="space-y-6">
          {/* Hint Style */}
          <Card>
            <CardHeader>
              <CardTitle>Hint Style</CardTitle>
              <CardDescription>
                Choose how detailed you want your hints to be
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={hintStyle} onValueChange={setHintStyle}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/40 transition-colors">
                  <RadioGroupItem value="conceptual" id="conceptual" />
                  <div className="flex-1">
                    <Label htmlFor="conceptual" className="font-medium cursor-pointer">
                      Conceptual
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      High-level concepts and approaches only
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/40 transition-colors">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <div className="flex-1">
                    <Label htmlFor="balanced" className="font-medium cursor-pointer">
                      Balanced
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Mix of concepts and specific algorithmic hints
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/40 transition-colors">
                  <RadioGroupItem value="detailed" id="detailed" />
                  <div className="flex-1">
                    <Label htmlFor="detailed" className="font-medium cursor-pointer">
                      Detailed
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Specific algorithms with pseudo-code examples
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Hint Timing */}
          <Card>
            <CardHeader>
              <CardTitle>Hint Delay</CardTitle>
              <CardDescription>
                Time between each hint in minutes: {hintDelay[0]} min
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Slider
                value={hintDelay}
                onValueChange={setHintDelay}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1 min</span>
                <span>5 min</span>
                <span>10 min</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
              <CardDescription>Fine-tune your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-hints" className="font-medium">
                    Automatic Hints
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically show hints after the delay period
                  </p>
                </div>
                <Switch
                  id="auto-hints"
                  checked={autoHints}
                  onCheckedChange={setAutoHints}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="sound-effects" className="font-medium">
                    Sound Effects
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for hints and completed problems
                  </p>
                </div>
                <Switch
                  id="sound-effects"
                  checked={soundEffects}
                  onCheckedChange={setSoundEffects}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={saveSettings}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;