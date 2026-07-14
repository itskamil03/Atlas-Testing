"use client";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-3xl border border-[#1A212A] bg-[#070A10] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <h3 className="text-lg font-semibold text-[#F3F7FB]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#93A0AE]">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-2xl border border-[#2B3440] px-5 py-2.5 text-sm font-medium text-[#D5DEE8] transition hover:border-[#3A4551] disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
              destructive
                ? "bg-[#4F2A2A] text-[#FFB4B4] hover:bg-[#653535]"
                : "bg-[#9BFF00] text-[#11140D] hover:bg-[#B7FF45]"
            }`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
