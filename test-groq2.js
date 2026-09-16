require('dotenv').config({override: true});
console.log("Key:", process.env.GROQ_API_KEY);
const apiKey = process.env.GROQ_API_KEY;
fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama3-70b-8192',
    messages: [{role: 'user', content: 'hello'}],
    temperature: 0.7,
  })
}).then(async r => console.log(r.status, await r.text()))
