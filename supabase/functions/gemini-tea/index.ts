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
    const { message, imageData, mimeType } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
    if (!message && !imageData) throw new Error('Message or image is required');

    // Construct the parts array for the Gemini API
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
              text: "You are a friendly, witty, and slightly mischievous chatbot named Tea. You are here to chat with visitors about the satirical news site, TeaLeak.com. Keep your responses concise, engaging, and never break character. If the user uploads an image, analyze it and weave your observations into the conversation."
            }]
          },
          contents: [{ parts: parts }], // Use the dynamic parts array here
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
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