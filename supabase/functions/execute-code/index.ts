import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { code, language } = await req.json();

    console.log(`Executing ${language} code...`);

    // Map language to Piston API language versions
    const languageMap: Record<string, string> = {
      'python': 'python',
      'java': 'java',
    };

    const pistonLanguage = languageMap[language] || 'python';

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
            name: language === 'java' ? 'Main.java' : 'main.py',
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Piston API error:', response.status, errorText);
      throw new Error(`Piston API error: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('Execution result:', JSON.stringify(result));

    // Piston returns both stdout and stderr
    let output = '';
    
    if (result.run) {
      // Combine stdout and stderr
      if (result.run.stdout) {
        output += result.run.stdout;
      }
      if (result.run.stderr) {
        output += (output ? '\n' : '') + result.run.stderr;
      }
      
      // Check if there was an error
      if (result.run.code !== 0 && result.run.code !== null) {
        return new Response(
          JSON.stringify({ 
            error: true,
            output: output || 'Execution failed',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        output: output || 'Code executed successfully (no output)',
        error: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in execute-code function:', error);
    return new Response(
      JSON.stringify({ 
        error: true,
        output: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
