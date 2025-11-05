import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { problem, hintLevel, currentCode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create detailed system prompt based on hint level
    let systemPrompt = "";
    if (hintLevel === 1) {
      systemPrompt = "You are a coding tutor. Provide a VERY BRIEF conceptual hint about the approach to solve this problem. Don't give away the solution, just point the student in the right direction. Keep it to 1-2 sentences focusing on the high-level strategy or data structure to use.";
    } else if (hintLevel === 2) {
      systemPrompt = "You are a coding tutor. The student has already received a conceptual hint. Now provide a MORE DETAILED hint that explains the algorithmic approach or pattern to use. Include specific steps or pseudocode-level guidance, but don't write actual code. 2-3 sentences with more specifics.";
    } else if (hintLevel === 3) {
      systemPrompt = "You are a coding tutor. The student has received conceptual and algorithmic hints. Now provide a DETAILED hint that includes the NEXT LINE OF CODE they should write or the exact next step in their implementation. You can show a small code snippet (1-3 lines) demonstrating the next action they should take, but don't solve the entire problem.";
    } else {
      systemPrompt = "You are a coding tutor. This is the final hint. Provide SIGNIFICANT guidance including detailed code examples and step-by-step implementation details. Show them most of the solution structure but let them fill in the final details themselves.";
    }

    const userPrompt = `Problem: ${problem.title}
Description: ${problem.description}
Constraints: ${problem.constraints?.join(', ') || 'None'}

Current student code:
${currentCode || 'No code written yet'}

Provide hint level ${hintLevel} for this problem.`;

    console.log(`Generating hint level ${hintLevel} for problem: ${problem.title}`);

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${errorText}`);
    }

    const data = await response.json();
    const hint = data.choices[0].message.content;

    console.log(`Generated hint: ${hint.substring(0, 100)}...`);

    return new Response(
      JSON.stringify({ hint }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in generate-hint function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
