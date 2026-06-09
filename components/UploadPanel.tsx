"use client"

import { useRef, useState } from "react"
import type { VerifyRequest, VerificationResult } from "@/lib/types"
import { verifyLabel } from "@/lib/verify"

interface Props {
  onResult: (result: VerificationResult) => void
  onLoading: (loading: boolean) => void
  onError: (msg: string | null) => void
}

const EMPTY_FIELDS: VerifyRequest["formFields"] = {
  brandName: "",
  classType: "",
  alcoholContent: "",
  netContents: "",
  bottlerAddress: "",
  countryOfOrigin: "",
}

const FIELD_META: { key: keyof VerifyRequest["formFields"]; label: string; placeholder: string }[] = [
  { key: "brandName",       label: "Brand name",          placeholder: "e.g. Old Tom Distillery" },
  { key: "classType",       label: "Class / type",         placeholder: "e.g. Kentucky Straight Bourbon Whiskey" },
  { key: "alcoholContent",  label: "Alcohol content",      placeholder: "e.g. 45% Alc./Vol. (90 Proof)" },
  { key: "netContents",     label: "Net contents",         placeholder: "e.g. 750 mL" },
  { key: "bottlerAddress",  label: "Bottler name & address", placeholder: "e.g. Old Tom Distillery, Louisville, KY" },
  { key: "countryOfOrigin", label: "Country of origin",    placeholder: "e.g. USA" },
]

export default function UploadPanel({ onResult, onLoading, onError }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) {
      onError("Please upload an image file (JPG, PNG, WebP).")
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    onError(null)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function setField(key: keyof typeof fields, value: string) {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    if (!file) { onError("Please upload a label image."); return }
    onError(null)
    onLoading(true)
    try {
      const result = await verifyLabel(file, fields)
      onResult(result)
    } catch (err) {
      onError(err instanceof Error ? err.message : "Verification failed.")
    } finally {
      onLoading(false)
    }
  }

  function reset() {
    setFile(null)
    setPreview(null)
    setFields(EMPTY_FIELDS)
    onError(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          Label image
        </p>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors
            ${dragging ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
        >
          <svg className="mb-2 h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm font-medium text-gray-700">Drop label image here</p>
          <p className="mt-1 text-xs text-gray-400">or click to browse · JPG, PNG, WebP</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {preview && (
          <div className="mt-3">
            <img src={preview} alt="Label preview" className="max-h-48 w-full rounded-md border border-gray-100 object-contain" />
            <div className="mt-2 flex items-center justify-between">
              <p className="truncate text-xs text-gray-400">{file?.name}</p>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">Remove</button>
            </div>
          </div>
        )}
      </div>

      {/* Form fields */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          Application form fields
        </p>
        <div className="flex flex-col gap-3">
          {FIELD_META.map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">{label}</label>
              <input
                type="text"
                value={fields[key]}
                onChange={e => setField(key, e.target.value)}
                placeholder={placeholder}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-gray-400 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!file}
        className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
        </svg>
        Analyze label
      </button>
    </div>
  )
}
