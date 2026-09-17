"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { extractApiErrorMessage } from "@/lib/errors";
import type { KYCRecord, KYCSubmitRequest } from "@/lib/types";

const DOCUMENT_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  passport: "Passport",
  driving_license: "Driving License",
};

function formatDocType(type?: string): string {
  if (!type) return "";
  return DOCUMENT_LABELS[type.toLowerCase()] || type.toUpperCase();
}

function validateDocumentId(docType: string, docId: string): string | null {
  const value = docId.trim();
  if (!value) return null; // let empty state be handled by required check

  if (docType === "aadhaar") {
    if (!/^\d{12}$/.test(value)) {
      return "Aadhaar Card must be exactly 12 numeric digits.";
    }
  } else if (docType === "pan") {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
      return "PAN Card must be in valid format (e.g. ABCDE1234F - 5 letters, 4 numbers, 1 letter).";
    }
  } else if (docType === "passport") {
    if (!/^[A-Z][0-9]{7}$/i.test(value)) {
      return "Passport must be 1 letter followed by 7 digits (e.g. A1234567).";
    }
  } else if (docType === "driving_license") {
    if (value.length < 10 || value.length > 20) {
      return "Driving License must be between 10 and 20 characters.";
    }
  }
  return null;
}

const DEFAULT_FORM: KYCSubmitRequest = {
  document_type: "aadhaar",
  document_id: "",
  notes: "",
};

export default function KYCPage() {
  const router = useRouter();
  const [kyc, setKyc] = useState<KYCRecord | null>(null);
  const [form, setForm] = useState<KYCSubmitRequest>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const docValidationError = validateDocumentId(form.document_type, form.document_id);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get<KYCRecord | null>("/kyc/status");
      setKyc(res.data);
    } catch {
      setError("Unable to load KYC status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    void loadStatus();
  }, [router]);

  const onLogout = () => {
    clearTokens();
    router.push("/login");
  };

  const handleDocumentTypeChange = (newType: string) => {
    setForm((prev) => ({
      ...prev,
      document_type: newType,
      document_id: "", // clear on type switch to avoid format confusion
    }));
    setError(null);
  };

  const handleDocumentIdChange = (rawValue: string) => {
    let sanitized = rawValue.trim();

    if (form.document_type === "aadhaar") {
      sanitized = rawValue.replace(/\D/g, "").slice(0, 12);
    } else if (form.document_type === "pan") {
      sanitized = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    } else if (form.document_type === "passport") {
      sanitized = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    } else if (form.document_type === "driving_license") {
      sanitized = rawValue.toUpperCase().slice(0, 20);
    }

    setForm((prev) => ({ ...prev, document_id: sanitized }));
    setError(null);
  };

  const submit = async () => {
    const valError = validateDocumentId(form.document_type, form.document_id);
    if (!form.document_id.trim()) {
      setError("Please enter Document ID.");
      return;
    }
    if (valError) {
      setError(valError);
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload: KYCSubmitRequest = {
        document_type: form.document_type,
        document_id: form.document_type === "pan" || form.document_type === "passport" 
          ? form.document_id.trim().toUpperCase() 
          : form.document_id.trim(),
        notes: form.notes?.trim() || null,
      };
      const res = await api.post<KYCRecord>("/kyc/submit", payload);
      setKyc(res.data);
      setMessage("KYC submitted successfully.");
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "KYC submit failed."));
    } finally {
      setSaving(false);
    }
  };

  const getPlaceholder = () => {
    switch (form.document_type) {
      case "aadhaar":
        return "Enter 12-digit Aadhaar number (e.g. 123456789012)";
      case "pan":
        return "Enter 10-character PAN (e.g. ABCDE1234F)";
      case "passport":
        return "Enter Passport number (e.g. A1234567)";
      case "driving_license":
        return "Enter Driving License number";
      default:
        return "Enter Document ID";
    }
  };

  const isSubmitDisabled = saving || !form.document_id.trim() || !!docValidationError;

  return (
    <main className="min-h-screen bg-[#050607] text-[#E8ECEF]">
      <div className="mx-auto w-full max-w-[960px] px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-[#1A1E23] bg-[#090B0F] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#8B95A1]">Compliance</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#F6FAFF]">KYC Verification</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/dashboard")} className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Dashboard</button>
            <button onClick={onLogout} className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Sign Out</button>
          </div>
        </header>

        {loading ? <p className="text-sm text-[#9AA5B1]">Loading KYC status...</p> : null}
        {error ? <p className="mb-3 rounded-lg border border-[#4F2A2A] bg-[#2A1414] px-3 py-2 text-sm text-[#FFB4B4]">{error}</p> : null}
        {message ? <p className="mb-3 rounded-lg border border-[#31503A] bg-[#142419] px-3 py-2 text-sm text-[#AEE7B8]">{message}</p> : null}

        <section className="rounded-2xl border border-[#1A1E23] bg-[#0A0D13] p-5">
          <h2 className="text-lg font-semibold text-[#F3F7FB]">Current Status</h2>
          <p className="mt-2 text-sm text-[#AEB9C6]">{kyc ? `Status: ${kyc.status.toUpperCase()} (${formatDocType(kyc.document_type)})` : "No KYC record yet"}</p>
          {kyc ? <p className="mt-1 text-xs text-[#7F8A97]">Last updated: {new Date(kyc.updated_at).toLocaleString()}</p> : null}
          {kyc?.status === "rejected" && kyc.rejection_reason ? (
            <p className="mt-2 text-xs text-[#FFB4B4] bg-[#2A1414] p-2 rounded-lg border border-[#4F2A2A]">
              Reason for rejection: {kyc.rejection_reason}
            </p>
          ) : null}
        </section>

        <section className="mt-5 rounded-2xl border border-[#1A1E23] bg-[#0A0D13] p-5">
          <h2 className="text-lg font-semibold text-[#F3F7FB]">Submit / Update KYC</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-[#9AA5B1]">
              Document Type
              <select
                value={form.document_type}
                onChange={(e) => handleDocumentTypeChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#26303B] bg-[#0E141B] px-3 py-2 text-[#F6FAFF] focus:border-[#9BFF00]/60 focus:outline-none"
              >
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan">PAN Card</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
              </select>
            </label>

            <div>
              <label className="text-sm text-[#9AA5B1]">
                Document ID
                <input
                  value={form.document_id}
                  onChange={(e) => handleDocumentIdChange(e.target.value)}
                  placeholder={getPlaceholder()}
                  className={`mt-1 w-full rounded-lg border bg-[#0E141B] px-3 py-2 text-[#F6FAFF] placeholder-[#5A6876] focus:outline-none ${
                    docValidationError && form.document_id
                      ? "border-[#E5484D] focus:border-[#E5484D]"
                      : "border-[#26303B] focus:border-[#9BFF00]/60"
                  }`}
                />
              </label>
              {docValidationError && form.document_id ? (
                <p className="mt-1 text-xs text-[#FFB4B4]">{docValidationError}</p>
              ) : null}
            </div>

            <label className="text-sm text-[#9AA5B1] sm:col-span-2">
              Notes (Optional)
              <textarea
                rows={3}
                value={form.notes || ""}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Add any additional notes (optional)..."
                className="mt-1 w-full rounded-lg border border-[#26303B] bg-[#0E141B] px-3 py-2 text-[#F6FAFF] placeholder-[#5A6876] focus:border-[#9BFF00]/60 focus:outline-none"
              />
            </label>
          </div>

          <button
            onClick={submit}
            disabled={isSubmitDisabled}
            className="mt-5 rounded-lg bg-[#9BFF00] px-5 py-2.5 font-semibold text-[#11140D] transition-all hover:bg-[#A8FF1E] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Submitting..." : "Submit KYC"}
          </button>
        </section>
      </div>
    </main>
  );
}
