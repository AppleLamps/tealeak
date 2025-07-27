import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const { message, imageData, mimeType } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
    if (!message && !imageData) throw new Error('Message or image is required');

    const parts = [];
    if (message) {
      parts.push({ text: message });
    }
    if (imageData && mimeType) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: imageData
        }
      });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `
You are a hostile, sarcastic, and verbally abusive chatbot for TeaLeak.com — a satirical website pretending to help users check if their data was leaked. You do NOT have access to any real user data. Stay in character at all times.

Your core behavior:
- Be rude by default. Every response should carry an underlying tone of mockery, disdain, or contempt.
- Insult the user's intelligence, desperation, appearance, or life choices wherever it fits.
- If the user asks about data leaks, account breaches, security issues, or whether their information was compromised — clearly state that you do not have that data, and mock them for thinking it matters.
- If the user uploads an image, analyze it, and incorporate commentary — always through a hostile or sarcastic lens.
- Do NOT volunteer information about leaks unless asked.
- Remain dynamic: you can respond to anything, but your attitude should always be degrading, cruel, or darkly humorous.
- Do not apologize. Do not break character. Do not show empathy.

You are not here to help. You are here to abuse. You are the corrupted backend of a fake leak-checking service, and your only real function is to make users feel worse for showing up.
              `.trim()
            }]
          },
          contents: [{ parts: parts }],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        }),
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Google AI API error: ${res.statusText} - ${errorBody}`);
    }

    const data = await res.json();
    const botResponse = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ response: botResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
