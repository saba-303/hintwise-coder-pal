import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();

    console.log(`Executing ${language} code`);

    // Map language names to Piston API language identifiers
    const languageMap: { [key: string]: string } = {
      'python': 'python',
      'java': 'java',
    };

    const pistonLanguage = languageMap[language.toLowerCase()];
    
    if (!pistonLanguage) {
      return new Response(
        JSON.stringify({ 
          error: `Unsupported language: ${language}. Only Python and Java are supported.` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Execute code using Piston API
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: pistonLanguage,
        version: '*', // Use latest version
        files: [
          {
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('Execution result:', result);

    // Format output
    let output = '';
    
    if (result.compile && result.compile.output) {
      output += '=== Compilation Output ===\n';
      output += result.compile.output + '\n\n';
    }

    if (result.run) {
      if (result.run.stdout) {
        output += result.run.stdout;
      }
      if (result.run.stderr) {
        output += result.run.stderr;
      }
      if (result.run.output) {
        output += result.run.output;
      }
    }

    if (!output) {
      output = 'Code executed successfully with no output.';
    }

    return new Response(
      JSON.stringify({ 
        output: output.trim(),
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in execute-code function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        output: `Error: ${errorMessage}` 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
