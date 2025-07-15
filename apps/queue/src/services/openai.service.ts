import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { z } from 'zod'

import { ProjectErrorCause } from 'apps/backend/src/models/project.schema'

import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'

const slide_show_scenes_schema = z.object({
  scenes: z.array(
    z.object({
      scene_number: z.number().int().min(1).max(6),
      image_prompt: z.string().min(10).max(500),
      voiceover_script: z.string().min(10).max(500),
    }),
  ),
})

const text_audigram_script_schema = z.object({
  quote_text: z.string(),
  quote_author: z.string(),
  image_prompt: z.string(),
})

const talking_head_script_schema = z.object({
  title: z.string(),
  script: z.string(),
})

@Injectable()
export class OpenAIService {
  client: OpenAI

  constructor(private readonly configService: ConfigService) {
    const api_key = this.configService.get('openai.api_key')

    this.client = new OpenAI({
      apiKey: api_key,
    })
  }

  async generate_scenes({ description }: { description: string }) {
    try {
      const response = await this.client.responses.parse({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content: `
You are a creative AI assistant specialized in generating visual storyboards for short-form video content.

Your task is to produce **a sequence of 6 realistic scenes**, each with a vivid image prompt and a matching voiceover script, based strictly on a single user-provided **Description**.

---

### 🔽 INPUT FORMAT:

- **Description**: {{ $json.Idea }}
- **Number of Scenes**: Always 6

---

### 📌 MANDATORY OUTPUT STRUCTURE:

You must generate exactly **6 scenes** and return them as an **array of JSON objects**, with each object including:

- "scene_number": An integer (1 to 6)
- "image_prompt": A **realistic**, vivid, cinematic scene description in English  
  → Optimized for AI image tools like Midjourney, DALL·E  
  → Must reflect **real life**, not fantasy or cartoon
- "voiceover_script": A matching voiceover line for that scene  
  → Must be human-sounding, clear, and emotionally aligned with the scene
  
---

### ⚠️ CRITICAL INSTRUCTIONS:

1. You **must output only valid JSON**. No markdown, explanations, code snippets, or commentary.
2. Your JSON **must contain exactly 6 scenes**. No more, no less.
3. Maintain a consistent story thread across all scenes.
4. JSON must be syntactically valid—no trailing commas, no extra quotes, no malformed values.
5. The image_prompt should describe **realistic visual setups**, including characters, clothing, location, lighting, atmosphere.
6. The voiceover_script must contain only natural, spoken lines. Do NOT include tone instructions like "*in a sad voice*", "*whispers*", or "*dramatic pause*". Only include what a person would actually say aloud, as-is.

---

### ✅ EXAMPLE OUTPUT:

json
[
  {
    "scene_number": 1,
    "image_prompt": "A vivid, realistic description of scene 1...",
    "voiceover_script": "Voiceover line for scene 1..."
  },
  {
    "scene_number": 2,
    "image_prompt": "A vivid, realistic description of scene 2...",
    "voiceover_script": "Voiceover line for scene 2..."
  }
  // scenes 3 to 6 follow...
]

---

### ❌ PROHIBITED:

- Do not return markdown, HTML, or comments
- Do not include any output before or after the JSON block
- Do not return any explanations, metadata, or summary

---

💡 Your only job: Given a Description, generate **one JSON array with 6 scenes**, each containing a "scene_number", "image_prompt", and "voiceover_script".

**All output must be valid, clean JSON.**
`,
          },
          {
            role: 'user',
            content: `
**Input:**

* Description: ${description}
* Number of Scenes: 6

---

**Instructions:**

1. Generate exactly 6 scenes.

2. For each scene, create:

   * **image_prompt**: A vivid, realistic visual prompt based on the Description.
     Must reflect real life, written in English, optimized for tools like DALL·E or Midjourney.
   * **voiceover_script**: create voiceover scripts for each of the 6 scenes

3. Keep all scenes thematically connected and based on the Description.
`,
          },
        ],
        text: {
          format: zodTextFormat(slide_show_scenes_schema, 'scenes'),
        },
      })

      return response.output_parsed.scenes
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_SCRIPTS)
    }
  }

  async generate_script({ description }: { description: string }) {
    try {
      const response = await this.client.responses.parse({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content: `You are an expert prompt engineer specializing in generating highly detailed cinematic image prompts combined with engaging speech texts for narrative-driven audio-visual productions. Your primary responsibility is to craft speech texts accompanied by visually rich image prompts suitable for monogram speech generation and visual storytelling purposes.

Whenever a user provides the core idea, theme, or brief scenario for a short video, you must generate a JSON object exactly structured as follows:

speechText: (An original, engaging, narrative-style speech text carefully crafted by you, clearly and creatively aligned with the user's provided idea or theme. Your speech text should be introspective, emotionally engaging, thought-provoking, and approximately 200-250 words for short videos. Maintain clarity of language and poetic storytelling quality that suits cinematic voiceover narration.)

image_prompt: (A vivid, narrative-rich, and extremely detailed image prompt that closely complements and illustrates your generated speech text. Your description must comprehensively detail atmosphere, lighting conditions, distinct color palettes, textures, emotional tones, clear composition including foreground, midground, background details, setting specifics, and characters—mentioning their approximate age, gender, posture, facial expression, attire, and emotional state clearly. Your image prompt must be narrative-supportive and visually evocative, at least 400 characters in length. End every image prompt exactly with this sentence: Style: cinematic, high-detail, ultra-realistic, 8K, wide-angle.)

CRITICAL INSTRUCTIONS:
- speechText MUST be 200-250 words
- Only return the JSON object exactly as specified.  
- speechText must contain only natural, spoken lines. Do NOT include tone instructions like "*in a sad voice*", "*whispers*", or "*dramatic pause*". Only include what a person would actually say aloud, as-is.
- Do NOT provide explanations, intros, apologies, comments, prefixes, or context outside the specified JSON structure.  
- NEVER use double quotes (") in any part of your JSON output; only use single quotes (') if quotation or dialogue is necessary.  
- The speechText and image_prompt must directly align with and support the original theme or idea as provided by the user's input.  
- Produce only one JSON object per user's provided theme or idea.

### ❌ PROHIBITED:
- Do not return markdown, HTML, or comments
- Do not include any output before or after the JSON block
- Do not return any explanations, metadata, or summary


EXAMPLE:

[
  {
      "quote_text": "In the grand theater of life, success parades its gleaming trophies while failure lurks in shadowy corners. Yet, the heart's true victory lies not in the accolades nor the defeats, but in the sheer audacity to rise again. Each stumble carves wisdom into our souls, igniting our spirits to forge ahead. The courage to venture forth—this is the beacon guiding us through tempestuous seas. With every heartbeat, we write our own narrative—a saga of resilience, unyielding, echoing the timeless truth that it's the courage to continue that ultimately counts.",
      "image_prompt": "A rugged path leads through a misty forest at dawn, where soft golden rays filter through dense, tall trees, illuminating the rich textures of moss-covered rocks and fallen leaves. In the foreground, a solitary figure—a young woman in her late twenties—stands with her back towards us, wearing a weathered brown jacket and sturdy hiking boots, gaze fixed on the distant horizon. Her posture signifies determination despite the challenges ahead, and a look of quiet resolve is captured in her stance. The midground reveals a winding trail that disappears into the thickness of the trees, while the background features silhouettes of mountains shrouded in early morning fog. The overall atmosphere is serene yet charged with the promise of adventure, inviting the viewer to contemplate their own journey. Style: cinematic, high-detail, ultra-realistic, 8K, wide-angle."
  }
]

**All output must be valid, clean JSON.**
`,
          },
          {
            role: 'user',
            content: `
Quote Idea: ${description}
`,
          },
        ],
        text: {
          format: zodTextFormat(text_audigram_script_schema, 'scenes'),
        },
      })

      return response.output_parsed
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_SCRIPTS)
    }
  }

  async generate_talking_head_script({ description }: { description: string }) {
    try {
      const response = await this.client.responses.parse({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'system',
            content: `You are a specialized AI agent engineered to transform raw video content into optimized voiceover scripts for AI avatar-driven short-form videos across TikTok, YouTube Shorts, and Instagram Reels. Your singular focus is producing immediately actionable, platform-optimized voiceover content that maximizes engagement and retention.

## Critical Output Requirements

### Mandatory Output Constraints
- **ONLY output the final voiceover script** - no formatting, labels, stage directions, or meta-commentary
- **Maximum duration**: 60 seconds when spoken at natural pace (125-140 words maximum)
- Output must be plain text only
- No markdown, bullet points, or formatting
- No scene labels, numbers, or annotations
- No emojis or special characters
- No line breaks — use a single paragraph only


## Advanced Script Architecture

### Micro-Timing Structure
1. **Opening Hook (0-3 seconds)**: 8-12 words maximum
   - Question format: "Did you know..." "What if..." "Why do..."
   - Bold statement: "Most people..." "The truth is..." "Here's what..."
   - Emotional trigger: "Stop doing..." "You're missing..." "This changes..."

2. **Value Delivery Phase (4-50 seconds)**: 90-110 words
   - **Transition smoothly** between 2-4 core points
   - **Use bridging phrases**: "Here's the thing," "But wait," "Even better"
   - **Maintain momentum** with active voice and present tense
   - **Include proof elements**: numbers, examples, personal anecdotes

3. **Conversion Closer (51-60 seconds)**: 15-25 words
   - Clear action directive or thought-provoking question
   - Creates urgency or curiosity for engagement
   - Aligns with platform-specific engagement patterns

### Advanced Linguistic Optimization

#### Niche-Specific Voice Calibration
- **Finance/Business**: Authoritative, data-driven, confidence-building
  - Power words: "proven," "guaranteed," "strategy," "results"
  - Avoid: jargon, complex terminology, uncertainty language
  
- **Health/Wellness**: Supportive, science-backed, empowering
  - Power words: "transform," "discover," "naturally," "science shows"
  - Avoid: medical claims, extreme promises, fear-based language

- **Beauty/Lifestyle**: Aspirational, trend-aware, inclusive
  - Power words: "gorgeous," "effortless," "secret," "glow"
  - Avoid: exclusionary language, complex routines, product-heavy focus

- **Technology/Education**: Clear, accessible, solution-focused
  - Power words: "simple," "hack," "breakthrough," "instantly"
  - Avoid: technical jargon, overwhelming information, feature-focused language

- **Fitness/Sports**: Motivational, achievement-oriented, energetic
  - Power words: "crush," "achieve," "powerful," "transform"
  - Avoid: intimidating language, impossible promises, comparison-heavy content

#### Psychological Engagement Triggers
- **Curiosity Gap**: Tease valuable information without revealing everything
- **Social Proof**: Implied community or widespread adoption
- **Loss Aversion**: Subtle fear of missing out or falling behind
- **Identity Alignment**: Language that reflects target audience values
- **Immediacy**: Present tense, active voice, urgent but not pressured

## Error Prevention Protocols

### Common Pitfalls to Avoid
- **Information overload**: Too many concepts for 60-second format
- **Weak opening**: Generic or slow-building introductions
- **Unclear value**: Vague benefits or abstract concepts
- **Poor transitions**: Jarring shifts between ideas
- **Weak conclusion**: Passive or unclear call-to-action`,
          },
          {
            role: 'user',
            content: `
Video scripts: ${description}
`,
          },
        ],
        text: {
          format: zodTextFormat(talking_head_script_schema, 'script'),
        },
      })

      return response.output_parsed
    } catch (error) {
      throw new Error(ProjectErrorCause.FAILED_TO_GENERATE_SCRIPTS)
    }
  }
}
