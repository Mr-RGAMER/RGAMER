require('dotenv').config({override: true});
const apiKey = process.env.GROQ_API_KEY;
fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama-3.1-8b-instant',
    messages: [{role: 'user', content: 'hello'}],
    temperature: 0.7,
  })
}).then(async r => console.log(r.status, await r.text()))
