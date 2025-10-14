import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problem, description, hintLevel, totalHints } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating hint level ${hintLevel} for problem: ${problem}`);

    // Create a progressive hint system prompt
    const systemPrompt = `You are an expert coding tutor specialized in providing progressive hints for algorithmic problems. 

Your goal is to help students learn by guiding them toward the solution WITHOUT giving away the answer.

Rules for hint progression (out of ${totalHints} total hints):
- Hint 1: Provide only a high-level conceptual direction (e.g., "Think about which data structure could help you track previous elements")
- Hint 2: Suggest a specific approach or algorithm category (e.g., "Consider using a hash map to store values you've seen")
- Hint 3: Give more concrete algorithmic details but no code (e.g., "As you iterate through the array, check if target - current value exists in your hash map")
- Hint 4: Provide pseudo-code or very specific implementation details (e.g., "Initialize an empty hash map. For each number, check if (target - number) exists in the map. If yes, return indices. If no, store the current number and its index.")

CRITICAL: Your response must be a single, concise hint appropriate for level ${hintLevel}. 
Do NOT:
- Give away the complete solution
- Write actual code unless it's the final hint
- Repeat information from previous hints
- Be vague on the final hint

Keep hints under 2-3 sentences and focused on guiding thinking.`;

    const userPrompt = `Problem: ${problem}

Description:
${description}

Generate hint #${hintLevel} of ${totalHints}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const hint = data.choices[0]?.message?.content;

    console.log(`Successfully generated hint: ${hint.substring(0, 50)}...`);

    return new Response(
      JSON.stringify({ hint }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-hint function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});