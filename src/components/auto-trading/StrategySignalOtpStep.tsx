"use client";

type StrategySignalOtpStepProps = {
  channel: string;
  recipientHint: string;
  debugOtp?: string | null;
  otp: string;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack?: () => void;
  loading?: boolean;
  resendLoading?: boolean;
  sideLabel?: string;
  submitLabel?: string;
};

export function StrategySignalOtpStep({
  channel,
  recipientHint,
  debugOtp,
  otp,
  onOtpChange,
  onVerify,
  onResend,
  onBack,
  loading = false,
  resendLoading = false,
  sideLabel = "trade",
  submitLabel,
}: StrategySignalOtpStepProps) {
  const channelLabel = channel === "phone" ? "mobile number" : "email";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[#8E9AAA]">Confirm order</p>
        <h4 className="mt-1 text-lg font-semibold text-[#F3F7FB]">Enter verification OTP</h4>
        <p className="mt-2 text-sm text-[#93A0AE]">
          We sent a 6-digit OTP to your registered {channelLabel}{" "}
          <span className="text-[#C9D4E0]">{recipientHint}</span>. Your {sideLabel} order will punch only after
          verification.
        </p>
      </div>

      <label className="block text-sm text-[#9AA5B1]">
        OTP code
        <input
          value={otp}
          onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit OTP"
          className="mt-1 w-full rounded-2xl border border-[#242D37] bg-[#0D1218] px-3 py-3 text-center text-lg tracking-[0.35em] text-[#E8EEF5] outline-none focus:border-purple-500"
        />
      </label>

      {debugOtp ? (
        <p className="rounded-xl border border-purple-900/50 bg-purple-950/20 px-3 py-2 text-xs text-purple-300">
          Dev OTP: <span className="font-semibold">{debugOtp}</span>
        </p>
      ) : null}

      <div className={`flex gap-3 ${onBack ? "" : ""}`}>
        {onBack ? (
          <button
            type="button"
            disabled={loading}
            onClick={onBack}
            className="w-full rounded-2xl border border-[#2B3440] px-4 py-3 text-sm font-medium text-[#C7D2DF] hover:border-[#3A4551] disabled:opacity-60"
          >
            ← Back
          </button>
        ) : null}
        <button
          type="button"
          disabled={loading || otp.length !== 6}
          onClick={onVerify}
          className="w-full rounded-2xl bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700 active:scale-95 disabled:opacity-60"
        >
          {loading ? "Verifying..." : submitLabel ?? "Verify OTP & punch order"}
        </button>
      </div>

      <button
        type="button"
        disabled={loading || resendLoading}
        onClick={onResend}
        className="w-full text-sm text-purple-400 hover:underline disabled:opacity-60"
      >
        {resendLoading ? "Resending OTP..." : "Resend OTP"}
      </button>
    </div>
  );
}
