export type MatchStatus = "pass" | "fail" | "needs_review" | "missing"

export interface FieldResult {
  field: string
  formValue: string
  labelValue: string
  status: MatchStatus
  note: string
}

export interface VerificationResult {
  overall: "pass" | "fail" | "needs_review"
  fields: FieldResult[]
  warningCheck: {
    status: MatchStatus
    detail: string
  }
}

// What the frontend sends to /api/verify
export interface VerifyRequest {
  imageBase64: string
  mimeType: string
  formFields: {
    brandName: string
    classType: string
    alcoholContent: string
    netContents: string
    bottlerAddress: string
    countryOfOrigin: string
  }
}