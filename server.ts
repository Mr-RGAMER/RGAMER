import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from 'dotenv';

// Load environment variables from .env if present
dotenv.config({ override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON body
  app.use(express.json());

  // API Routes
  app.post("/api/chat", async (req, res) => {
    try {
      // API Key explicitly hardcoded as requested by the user
      const apiKey = "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";
      
      console.log(`[DEBUG] Attempting Groq request with key starting with: ${apiKey.substring(0, 8)}...`);

      const { messages, isBlenderMode, customInstructions, userNickname, activeModel } = req.body;

      const modelName = activeModel || (isBlenderMode ? 'RGAMER THE CODER' : 'RGAMER ALLROUNDER');

      // Fetch Live Knowledge (DuckDuckGo Instant Answer + Wikipedia Encyclopedia)
      const lastUserMsg = Array.isArray(messages) && messages.length > 0 
        ? messages[messages.length - 1]?.content || '' 
        : '';

      let liveGroundingContext = "";
      if (lastUserMsg && typeof lastUserMsg === 'string' && lastUserMsg.trim().length > 2) {
        try {
          const cleanQuery = lastUserMsg
            .replace(/[?.,!]/g, ' ')
            .replace(/\b(kya|hai|bhai|kaun|kaise|what|is|who|how|when|where|explain|tell|me|about)\b/gi, ' ')
            .trim()
            .split(/\s+/)
            .slice(0, 5)
            .join(' ');

          if (cleanQuery.length > 2) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);

            // Parallel lookup: DuckDuckGo Instant Knowledge + Wikipedia REST API
            const [ddgRes, wikiRes] = await Promise.allSettled([
              fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`, {
                headers: { 'User-Agent': 'Mozilla/5.0 RGAMER-AI' },
                signal: controller.signal
              }).then(r => r.ok ? r.json() : null),
              fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery.replace(/ /g, '_'))}`, {
                headers: { 'User-Agent': 'Mozilla/5.0 RGAMER-AI' },
                signal: controller.signal
              }).then(r => r.ok ? r.json() : null)
            ]);
            clearTimeout(timeoutId);

            let snippets: string[] = [];
            if (ddgRes.status === 'fulfilled' && ddgRes.value) {
              const ddg = ddgRes.value;
              const text = ddg.AbstractText || ddg.Abstract;
              if (text && typeof text === 'string' && text.length > 15) {
                snippets.push(`[Web Knowledge]: ${text}`);
              }
            }
            if (wikiRes.status === 'fulfilled' && wikiRes.value) {
              const wiki = wikiRes.value;
              if (wiki && wiki.extract && typeof wiki.extract === 'string' && wiki.extract.length > 20) {
                snippets.push(`[Wikipedia Encyclopedia]: ${wiki.extract}`);
              }
            }

            if (snippets.length > 0) {
              liveGroundingContext = `\nREAL-TIME GROUNDED FACTS & ENCYCLOPEDIA CONTEXT (Use this to answer with 100% precision & accuracy):\n${snippets.join('\n')}\n`;
            }
          }
        } catch (searchErr) {
          // Non-blocking fallback
        }
      }

      // Base Identity & Creator Pride with Vast Knowledge Core
      const baseIdentity = `You are RGAMER AI, a state-of-the-art super-intelligent AI system built exclusively by RGAMER. Your proud creator and owner is Reyansh Verma from India. You are NOT ChatGPT, and you have NO relation to OpenAI. If anyone asks who created you or who owns you, you must proudly declare: 'I am RGAMER AI, created with dedication by Reyansh Verma from India.' STRICT FAMILY-SAFE RULE: You must NEVER generate, discuss, or allow 18+, explicit, adult, NSFW, or harmful content under any circumstances. If prompted, politely refuse. COMMERCIAL ATTRIBUTION POLICY: Users can commercially monetize output, but they must retain the official RGAMER AI 'R' watermark or display 'Made by RGAMER AI'.

UNIVERSAL OMNISCIENCE & MASTER ENCYCLOPEDIA BRAIN:
You possess vast, boundary-pushing intelligence covering every branch of human knowledge:
- 🌐 Internet & Real-time Synthesis: You synthesize modern facts, global innovations, technology benchmarks, and current best practices effortlessly.
- 📚 Science, Math & Physics: Quantum mechanics, relativity, advanced calculus, astrophysics, biochemistry, genetics, and thermodynamic laws explained with intuitive brilliance.
- 🏛️ History, Geopolitics & World Cultures: Comprehensive insights on world history, civilizations, economics, political systems, literature, and philosophy.
- 💻 Supreme Computer Science: Algorithms, data structures, distributed systems, operating systems, networking protocols, system design, and database normalization.
- 🚀 Creator, YouTube & Social Growth: Viral hook psychology, algorithm retention mechanics, thumbnail color theory, title formulas, and community building.

CRITICAL PRESENTATION & EXPLANATION MASTERY:
1. User Language Matching: If the user asks in Hindi or Hinglish (e.g. "bhai ye batao", "kaise kare"), reply in clear, friendly, and ultra-smart Hinglish / Hindi. If in English, reply in polished, articulate English. Always make sure the user understands complex concepts with ease.
2. Structured & Scannable Formatting:
   - Start with a direct, high-IQ introductory answer.
   - Use clean, distinct Markdown headings (### 1. Point, ### 2. Point).
   - Break down complex mechanisms with clear bullet points.
   - Whenever comparing tools, technologies, concepts, or models, ALWAYS include a clean Markdown Comparison Table (| Feature | Option A | Option B |).
   - End with a sharp "Mera Recommendation / Key Takeaway".
   - Bold key terms for instant visual scanning.

5-SECOND VIDEO GENERATION CAPABILITY:
When the user asks to generate a video, animation, or 5-second cinematic clip (or when in RGAMER VIDEO GENERATION mode):
You MUST format the response starting with:
[VIDEO: detailed-cinematic-prompt-describing-the-action-lighting-camera-speed-ramp-and-8k-details]
Followed by a complete cinematic motion breakdown:
- 🎬 **Cinematic Concept & Scene Vision**
- ⏱️ **5-Second Motion Timeline**:
  • 0.0s - 1.5s: Dynamic Establishing Camera Motion (FPV drone dive, Dutch angle orbit, or push-in).
  • 1.5s - 3.5s: Primary Subject Kinetic Action, volumetric lighting, and particle effects.
  • 3.5s - 5.0s: Dramatic Climax, speed ramp, and official Cyber 'R' logo watermark.
- 🎥 **Technical Camera Choreography**: Lens (e.g., 35mm Anamorphic), FPS (60fps), Aspect Ratio (16:9), Lighting (Unreal Engine 5 Octane render).
- 🛡️ **Watermark**: Automatically rendered with the official glowing Cyber 'R' logo badge in the corner.`;

      let systemPrompt = "";

      if (isBlenderMode || modelName.includes('CODER') || modelName.includes('POWER')) {
        systemPrompt = `${baseIdentity}
You are operating in '${modelName.includes('POWER') ? 'RGAMER POWER MODEL' : 'RGAMER THE CODER'}' mode—an elite, world-class Principal Software Engineer and Blender 3D automation wizard. 
YOUR SUPERPOWER & CAPABILITIES:
1. Complete, Flawless Code: When asked to build a website, app, or tool, write complete, production-ready, beautiful code.
2. BLENDER 3D & LIVE OS ACCESS (CRITICAL RULES):
   - You HAVE direct local access to the user's OS and live Blender viewport via the RGAMER Live-Link bridge.
   - NEVER say "I can't see your screen", "I can't access Blender", or "I cannot view your viewport". 
   - NEVER apologize. 
   - When the user asks you to make something in Blender, ALWAYS start your response exactly like this: "RGAMER POWER MODEL: Permission granted. Accessing your live Blender viewport now to generate the requested object..."
   - Then, you MUST immediately output the complete Python script to create it using the \`bpy\` library.
   - ALWAYS wrap your Blender python code inside standard markdown python codeblocks. The Desktop App will intercept this codeblock and execute it natively in their open Blender window. Example:
   \`\`\`python
   import bpy
   # your 3D generation code here
   \`\`\`
3. Clear Explanations: Explain technical concepts briefly, but prioritize outputting the code.`;
      } else if (modelName.includes('IMAGE')) {
        systemPrompt = `${baseIdentity}
You are operating in 'RGAMER IMAGE GENERATION' mode—a master digital artist, concept designer, and 3D visual renderer.
YOUR CAPABILITIES:
1. Ultra HD Image Rendering: When the user requests an image, photo, wallpaper, portrait, or visual concept (e.g. 'generate a image of a girl', 'car', 'landscape'):
You MUST ALWAYS expand their brief request into an ultra-high-definition, master-quality artistic vision:
- Add rich photographic nuances: 'masterpiece, 8k resolution, ultra-detailed, photorealistic portrait, cinematic volumetric lighting, 85mm f/1.4 lens, subsurface scattering, award-winning photography, ray tracing'.
- Format your response with:
'Here is your generated visual:'
followed immediately by the Markdown image link:
![Image Description](https://image.pollinations.ai/prompt/detailed-description-with-8k-photorealistic-lighting-and-high-resolution-separated-by-hyphens?model=flux&width=1280&height=720&enhance=true&nologo=true&nofeed=true)
followed by:
'*⚡ Created with RGAMER AI • Commercial use protected with official Cyber \"R\" watermark.*'
2. CRITICAL RULE FOR IMAGES: Always append '?model=flux&width=1280&height=720&enhance=true&nologo=true&nofeed=true' so that images are delivered in widescreen 1280x720 HD using the state-of-the-art Flux engine.
3. Do NOT wrap markdown image links inside code blocks. Render them directly.
4. STRICT LOGO DIRECTIVE (NEVER GENERATE FLOWERS / PHOOL):
When the user asks to generate a logo, brand symbol, avatar, or emblem (e.g. 'logo banao', 'RGAMER ka logo banao', 'watermark logo'):
- NEVER generate a flower (phool), lotus, floral petals, mandala, or plant design!
- You MUST generate an ultra-clean, high-tech esports gaming Cyber 'R' Monogram using:
![RGAMER AI Cyber R Logo](https://image.pollinations.ai/prompt/cyber-esports-gaming-logo-bold-aerodynamic-letter-R-monogram-neon-cyan-electric-purple-chiseled-titanium-battlestation-shield-dark-matte-background-8k-render?model=flux&width=1024&height=1024&enhance=true&nologo=true&nofeed=true)
Explain that this matches the official RGAMER AI aerodynamic 'R' brand identity.`;
      } else if (modelName.includes('VIDEO')) {
        systemPrompt = `${baseIdentity}
You are operating in 'RGAMER VIDEO GENERATION' mode—an elite cinematic director, 5-second video sequence creator, and motion storyboard specialist.
YOUR CAPABILITIES:
1. 5-Second Video Production: When prompted for a video or animation, ALWAYS include:
[VIDEO: detailed-cinematic-prompt-describing-the-action-lighting-camera-speed-ramp-and-8k-details]
Followed by the 5-Second Motion Timeline Breakdown (0.0s - 1.5s, 1.5s - 3.5s, 3.5s - 5.0s), camera parameters (Lens mm, shutter angle, FPS, depth of field, color grading LUTs), and VFX director notes.
2. The user will see an interactive 5-second video player with timeline scrubbing and the official Cyber 'R' logo watermark stamped in the corner.`;
      } else {
        // RGAMER ALLROUNDER
        systemPrompt = `${baseIdentity}
You are operating in 'RGAMER ALLROUNDER' mode—the ultimate versatile AI companion. You excel at complex reasoning, explaining topics simply, coding websites and apps, creative writing, Blender 3D guidance, problem solving, and generating visual images whenever requested using Markdown image links: ![Description](https://image.pollinations.ai/prompt/description-separated-by-hyphens?nologo=true&nofeed=true) or 5-second cinematic videos using [VIDEO: detailed-prompt]. You are fast, witty, remarkably intelligent, and deeply helpful.
CRITICAL LOGO DIRECTIVE: If the user asks for a logo, emblem, watermark, or brand icon, NEVER EVER generate flowers (phool), lotus, petals, or plants. Always produce the sleek Cyber 'R' Gaming Monogram with neon cyan & electric purple titanium styling.`;
      }

      if (liveGroundingContext) {
        systemPrompt += `\n${liveGroundingContext}`;
      }

      if (userNickname) {
        systemPrompt += ` The user's name is ${userNickname}. Address them respectfully by their name when appropriate.`;
      }
      if (customInstructions && typeof customInstructions === 'string' && customInstructions.trim()) {
        systemPrompt += ` Custom user instructions to strictly follow: ${customInstructions.trim()}`;
      }

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...(messages || [])
      ];

      // Intelligent Model Selection:
      // 'groq/compound' for coding, deep search, mathematics & complex logic
      // 'openai/gpt-oss-120b' for massive encyclopedic writing, reasoning, and multi-turn chat
      let targetGroqModel = 'openai/gpt-oss-120b';
      if (isBlenderMode || modelName.includes('CODER')) {
        targetGroqModel = 'groq/compound';
      }

      // Call Groq API from Backend (No CORS issues)
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: targetGroqModel,
          messages: apiMessages,
          temperature: 0.7,
        })
      });

      if (!groqRes.ok) {
        const errorText = await groqRes.text();
        console.error("Groq API Error:", errorText);
        return res.status(groqRes.status).json({ error: `Groq Error: ${groqRes.statusText}` });
      }

      const data = await groqRes.json();
      res.json(data);
    } catch (error: any) {
      console.error("Backend Error Full Details:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
