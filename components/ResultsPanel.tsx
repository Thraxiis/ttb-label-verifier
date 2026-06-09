"use client"

import type { VerificationResult, FieldResult, MatchStatus } from "@/lib/types"

interface Props {
  result: VerificationResult
}

function statusIcon(status: MatchStatus) {
  switch (status) {
    case "pass":
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-bold flex-shrink-0">✓</span>
      )
    case "fail":
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold flex-shrink-0">✕</span>
      )
    case "missing":
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xs font-bold flex-shrink-0">—</span>
      )
    default: // needs_review
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 text-xs font-bold flex-shrink-0">!</span>
      )
  }
}

function OverallBadge({ overall }: { overall: VerificationResult["overall"] }) {
  if (overall === "pass")
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">✓ Pass</span>
  if (overall === "fail")
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">✕ Fail</span>
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">! Needs review</span>
}

function FieldRow({ field }: { field: FieldResult }) {
  const isFail = field.status === "fail"
  const isMissing = field.status === "missing"

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      {statusIcon(field.status)}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-1">{field.field}</p>
        <div className="flex flex-col gap-0.5">
          {!isMissing && (
            <div className="flex gap-2 text-sm">
              <span className="text-gray-400 flex-shrink-0 w-10">Form</span>
              <span className="text-gray-700 truncate">{field.formValue || "—"}</span>
            </div>
          )}
          <div className="flex gap-2 text-sm">
            <span className="text-gray-400 flex-shrink-0 w-10">Label</span>
            <span className={isFail ? "text-red-600 font-medium" : "text-gray-700"}>{field.labelValue || "—"}</span>
          </div>
        </div>
        {field.note && (
          <p className="mt-1 text-xs text-gray-400">{field.note}</p>
        )}
      </div>
    </div>
  )
}

export default function ResultsPanel({ result }: Props) {
  const failCount = result.fields.filter(f => f.status === "fail").length
  const reviewCount = result.fields.filter(f => f.status === "needs_review").length
  const passCount = result.fields.filter(f => f.status === "pass").length

  return (
    <div className="flex flex-col gap-4">

      {/* Overall verdict */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Verification result</p>
          <OverallBadge overall={result.overall} />
        </div>

        {/* Summary counts */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg bg-green-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-green-700">{passCount}</p>
            <p className="text-xs text-green-600">Pass</p>
          </div>
          <div className="flex-1 rounded-lg bg-yellow-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-yellow-700">{reviewCount}</p>
            <p className="text-xs text-yellow-600">Review</p>
          </div>
          <div className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-center">
            <p className="text-lg font-semibold text-red-700">{failCount}</p>
            <p className="text-xs text-red-600">Fail</p>
          </div>
        </div>
      </div>

      {/* Government warning — always shown prominently */}
      <div className={`rounded-xl border p-4 ${
        result.warningCheck.status === "pass"
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {statusIcon(result.warningCheck.status)}
          <p className="text-sm font-medium text-gray-700">Government warning</p>
        </div>
        <p className="text-xs text-gray-500 ml-8">{result.warningCheck.detail}</p>
      </div>

      {/* Per-field results */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">Field breakdown</p>
        {result.fields.map((f, i) => (
          <FieldRow key={i} field={f} />
        ))}
      </div>

    </div>
  )
}
