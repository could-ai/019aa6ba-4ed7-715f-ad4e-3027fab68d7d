import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { action, prompt } = await req.json()

    let systemPrompt = "You are a helpful security assistant."
    let userPrompt = prompt

    if (action === 'generate_password') {
      systemPrompt = "You are a password generator. Generate a strong, secure password based on the user's requirements. Return ONLY the password string, no other text."
      userPrompt = prompt || "Generate a strong password with 12 characters, including numbers and symbols."
    } else if (action === 'analyze_strength') {
      systemPrompt = "You are a security expert. Analyze the strength of the provided password. Return a JSON object with 'score' (1-10) and 'feedback' (string)."
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    const data = await response.json()
    
    if (data.error) {
       return new Response(JSON.stringify({ error: data.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = data.choices[0].message.content

    return new Response(
      JSON.stringify({ result }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})