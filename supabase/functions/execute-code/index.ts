// execute-code.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  // if you need cookies/auth change to true and set allowed origin
  "Access-Control-Allow-Credentials": "false",
};

function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req: Request): Promise<Response> => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Make sure body exists
    const text = await req.text();
    if (!text) {
      return jsonResponse({ error: true, output: "Empty request body" }, 400);
    }

    // Parse JSON safely
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return jsonResponse({ error: true, output: "Invalid JSON body" }, 400);
    }

    // Validate expected fields
    // Accept either { code, language } or { code: "...", language: "python" }
    const anyBody = body as Record<string, unknown>;
    const code = typeof anyBody.code === "string" ? anyBody.code : null;
    const language = typeof anyBody.language === "string" ? anyBody.language : "python";

    if (!code) {
      return jsonResponse({ error: true, output: "Missing 'code' field in request body" }, 400);
    }

    // Language/version mapping (adjust versions as needed)
    const languageMap: Record<string, string> = {
      python: "python",
      java: "java",
      javascript: "javascript",
      ts: "typescript",
      // add more if you want
    };
    const versionMap: Record<string, string> = {
      python: "3.10.0",
      java: "17.0.2",
      javascript: "node16",
      typescript: "4.9.5",
    };

    const pistonLanguage = languageMap[language.toLowerCase()] || "python";
    const pistonVersion = versionMap[language.toLowerCase()] || "3.10.0";

    // Build files array (Java needs Main.java etc.)
    const fileName = pistonLanguage === "java" ? "Main.java" : pistonLanguage === "javascript" ? "index.js" : "main.py";

    // Call Piston execute endpoint
    // NOTE: emkc.org mirror is commonly used. If you have another host, replace URL.
    const pistonUrl = "https://emkc.org/api/v2/piston/execute";

    const pistonResp = await fetch(pistonUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLanguage,
        version: pistonVersion,
        files: [{ name: fileName, content: code }],
      }),
    });

    if (!pistonResp.ok) {
      const errText = await pistonResp.text().catch(() => "");
      console.error("Piston HTTP error:", pistonResp.status, errText);
      return jsonResponse({ error: true, output: `Piston HTTP ${pistonResp.status}: ${errText}` }, 502);
    }

    const result = await pistonResp.json().catch((e) => {
      console.error("Failed to parse piston json:", e);
      return null;
    });

    if (!result) {
      return jsonResponse({ error: true, output: "Empty or invalid response from execution API" }, 502);
    }

    // Piston may return { compile?, run? } or other keys. Normalize output.
    let combinedOutput = "";
    let exitCode: number | null = null;

    // compile stage (if present)
    if (result.compile) {
      const comp = result.compile;
      if (typeof comp.stdout === "string") combinedOutput += comp.stdout;
      if (typeof comp.stderr === "string") combinedOutput += (combinedOutput ? "\n" : "") + comp.stderr;
      if (typeof comp.code === "number") exitCode = comp.code;
    }

    // run stage (if present)
    if (result.run) {
      const run = result.run;
      if (typeof run.stdout === "string") combinedOutput += (combinedOutput ? "\n" : "") + run.stdout;
      if (typeof run.stderr === "string") combinedOutput += (combinedOutput ? "\n" : "") + run.stderr;
      if (typeof run.code === "number") exitCode = run.code;
    }

    // some piston mirrors may put output in result.output or result.message — include them
    if (!combinedOutput) {
      if (typeof result.output === "string") combinedOutput = result.output;
      else if (typeof result.message === "string") combinedOutput = result.message;
    }

    // Build response object
    const responsePayload = {
      error: !!(exitCode !== null && exitCode !== 0),
      exitCode: exitCode,
      output: combinedOutput || "(no output)",
      raw: result, // keep raw for debugging (optional)
    };

    // If non-zero exit code, send 200 but mark error true (so client sees details)
    return jsonResponse(responsePayload, 200);
  } catch (err) {
    console.error("Unhandled error in execute handler:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: true, output: msg }, 500);
  }
});
