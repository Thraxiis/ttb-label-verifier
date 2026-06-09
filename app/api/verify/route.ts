import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"
import type { VerifyRequest, VerificationResult } from "@/lib/types"

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a TTB (Alcohol and Tobacco Tax and Trade Bureau) label compliance assistant.

You will be given an image of an alcohol beverage label and a set of form field values from the corresponding application.

Your job is to:
1. Extract each required field from the label image
2. Compare each extracted value against the provided form value
3. Return a structured JSON assessment

Match rules:
- "pass": values match exactly or are clearly equivalent (e.g. "750 mL" vs "750ml", "USA" vs "United States")
- "needs_review": values differ in a minor, likely-intentional way (e.g. capitalization like "OLD TOM" vs "Old Tom", state abbreviations)
- "fail": values are substantively different or a required element is wrong
- "missing": the field could not be found on the label at all

GOVERNMENT WARNING special rule:
The label MUST contain the exact text: GOVERNMENT WARNING: (in ALL CAPS, bold)
followed by the standard warning statement word-for-word.
Any deviation — title case, missing bold, truncated text — is a hard "fail".

Return ONLY valid JSON matching this exact shape. No markdown, no code fences, no explanation, no extra fields:
{
  "overall": "pass" | "fail" | "needs_review",
  "fields": [
    {
      "field": string,
      "formValue": string,
      "labelValue": string,
      "status": "pass" | "fail" | "needs_review" | "missing",
      "note": string
    }
  ],
  "warningCheck": {
    "status": "pass" | "fail",
    "detail": string
  }
}`

export async function POST(req: NextRequest) {
  try {
    const body: VerifyRequest = await req.json()
    const { imageBase64, mimeType, formFields } = body

    const fieldSummary = Object.entries(formFields)
      .map(([k, v]) => `${k}: ${v || "(not provided)"}`)
      .join("\n")

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 768,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
              media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Please verify this label against the following application form values:\n\n${fieldSummary}`,
            },
          ],
        },
      ],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""
    const clean = raw.replace(/```json\n?|\n?```/g, "").trim()
    const result: VerificationResult = JSON.parse(clean)

    return Response.json(result)
  } catch (err) {
    console.error("Verify error:", err)
    return Response.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    )
  }
}