import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('EXTERNAL_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API Key not configured')
    }

    const { action, payload } = await req.json()

    let systemMessage = ''
    let userMessage = ''

    if (action === 'generate_password') {
      systemMessage = 'You are a secure password generator. Generate a strong, random password. Return ONLY the password string, no other text or explanations.'
      userMessage = payload || 'Generate a complex password with 16 characters including symbols.'
    } else if (action === 'analyze_password') {
      systemMessage = 'You are a cybersecurity expert. Analyze the strength of the provided password. Give a short, concise assessment (Weak, Medium, Strong) and one specific tip for improvement if needed.'
      userMessage = `Analyze this password: ${payload}`
    } else {
      throw new Error('Invalid action')
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
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error.message)
    }

    const result = data.choices[0].message.content.trim()

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
