import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('EXTERNAL_API_KEY');
    if (!apiKey) {
      throw new Error('Missing OpenAI API Key');
    }

    const { action, prompt, password } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (action === 'generate') {
      systemPrompt = "You are a helpful security assistant. Generate a strong, secure password based on the user's requirements. Return ONLY the password string, no other text.";
      userPrompt = prompt || "Generate a strong random password with 12 characters including symbols and numbers.";
    } else if (action === 'analyze') {
      systemPrompt = "You are a security expert. Analyze the strength of the provided password. Provide a JSON response with 'score' (0-100), 'feedback' (string), and 'suggestions' (array of strings). Return ONLY the JSON.";
      userPrompt = `Analyze this password: ${password}`;
    } else {
      throw new Error('Invalid action. Use "generate" or "analyze".');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    const data = await response.json();
    const result = data.choices[0].message.content;

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});