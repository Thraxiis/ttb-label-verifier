"use client"

import { useState } from "react"
import UploadPanel from "@/components/UploadPanel"
import type { VerificationResult } from "@/lib/types"

export default function Home() {
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-medium text-gray-900">TTB Label Verifier</h1>
          <p className="mt-1 text-sm text-gray-400">Upload a label image and enter the application form values to check compliance.</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <UploadPanel
            onResult={r => { setResult(r); setLoading(false) }}
            onLoading={setLoading}
            onError={setError}
          />

          {/* Results placeholder — replaced by ResultsPanel in slice 3 */}
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
                <p className="text-sm text-gray-400">Analyzing label...</p>
              </div>
            ) : result ? (
              <pre className="max-h-96 overflow-auto text-left text-xs text-gray-600">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-300">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-sm">Results will appear here</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
