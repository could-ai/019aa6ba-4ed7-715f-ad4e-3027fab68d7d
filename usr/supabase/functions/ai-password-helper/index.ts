import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, prompt, password } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      throw new Error('Missing OpenAI API Key')
    }

    let systemPrompt = "You are a helpful security assistant."
    let userPrompt = ""

    if (action === 'generate') {
      systemPrompt = "You are a password generator. Return ONLY the generated password without any markdown formatting or explanation."
      userPrompt = prompt || "Generate a strong, complex password with 16 characters including symbols, numbers, and mixed case letters."
    } else if (action === 'analyze') {
      systemPrompt = "You are a security expert. Analyze this password and provide a JSON response with two fields: 'strength' (Weak, Medium, Strong) and 'tip' (a brief suggestion). Do not use markdown."
      userPrompt = `Analyze this password: "${password}"`
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "generate" or "analyze".' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
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
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message)
    }

    const result = data.choices[0].message.content.trim()

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})