require('dotenv').config({override: true});
const apiKey = process.env.GROQ_API_KEY;
fetch('https://api.groq.com/openai/v1/models', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
}).then(async r => console.log(r.status, await r.text()))
