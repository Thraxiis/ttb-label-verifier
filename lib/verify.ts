import type { VerifyRequest, VerificationResult } from "./types"

export async function verifyLabel(
  file: File,
  formFields: VerifyRequest["formFields"]
): Promise<VerificationResult> {
  const imageBase64 = await fileToBase64(file)

  const body: VerifyRequest = {
    imageBase64,
    mimeType: file.type,
    formFields,
  }

  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Unknown error")
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let raw = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    raw += decoder.decode(value, { stream: true })
  }

  const clean = raw.replace(/```json\n?|\n?```/g, "").trim()
  return JSON.parse(clean) as VerificationResult
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1120
        let { width: w, height: h } = img
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX }
          else { w = Math.round(w * MAX / h); h = MAX }
        }
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1])
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}