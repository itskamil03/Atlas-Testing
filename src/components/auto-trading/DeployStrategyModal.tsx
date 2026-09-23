"use client";

import { useEffect, useState } from "react";

import {
  StrategySignalFields,
  toStrategySignalRequest,
  type StrategySignalFormValues,
} from "@/components/auto-trading/StrategySignalFields";
import { OrderSuccessScreen } from "@/components/auto-trading/OrderSuccessScreen";
import { StrategySignalOtpStep } from "@/components/auto-trading/StrategySignalOtpStep";
import { sendStrategySignalOtp, verifyStrategySignalOtp, getRiskSettings } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/errors";
import { resolveSignalOutcome, type SignalOutcome } from "@/lib/signalOutcome";
import type { StrategySignalOtpChallenge, StrategySignalRequest } from "@/lib/types";

type DeployStrategyModalProps = {
  open: boolean;
  strategyName: string;
  strategyTag: string;
  defaultSymbol?: string;
  defaultQuantity?: string;
  defaultBroker?: StrategySignalRequest["broker"];
  platformEngine?: boolean;
  loading?: boolean;
  error?: string | null;
  onDeploy: (payload: {
    multiplier: string;
    max_profit_limit: string | null;
    max_loss_limit: string | null;
    copy_current_open_trades: boolean;
  }) => Promise<boolean>;
  onComplete?: () => void;
  onClose: () => void;
};

const DEFAULT_SIGNAL: StrategySignalFormValues = {
  symbol: "BTCUSD",
  side: "BUY",
  quantity: "1",
  confidence: "0.82",
  orderType: "MARKET",
  broker: "delta",
};

export function DeployStrategyModal({
  open,
  strategyName,
  strategyTag,
  defaultSymbol = "BTCUSD",
  defaultQuantity = "1",
  defaultBroker = "delta",
  platformEngine = false,
  loading = false,
  error = null,
  onDeploy,
  onComplete,
  onClose,
}: DeployStrategyModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [maxProfitLimit, setMaxProfitLimit] = useState("");
  const [maxLossLimit, setMaxLossLimit] = useState("");
  const [signalValues, setSignalValues] = useState<StrategySignalFormValues>({
    ...DEFAULT_SIGNAL,
    symbol: defaultSymbol,
    quantity: defaultQuantity,
    broker: defaultBroker,
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [otpChallenge, setOtpChallenge] = useState<StrategySignalOtpChallenge | null>(null);
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [successDetail, setSuccessDetail] = useState<string | null>(null);
  const [signalOutcome, setSignalOutcome] = useState<SignalOutcome>("queued");
  const [signalHistoryId, setSignalHistoryId] = useState<number | null>(null);
  const [accountDailyLossLimit, setAccountDailyLossLimit] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setMaxProfitLimit("");
      setMaxLossLimit("");
      setAccountDailyLossLimit(null);
      setSignalValues({
        ...DEFAULT_SIGNAL,
        symbol: defaultSymbol,
        quantity: defaultQuantity,
        broker: defaultBroker,
      });
      setLocalError(null);
      setOtpChallenge(null);
      setOtp("");
      setSuccessDetail(null);
      setSignalOutcome("queued");
      setSignalHistoryId(null);
      return;
    }

    setSignalValues({
      ...DEFAULT_SIGNAL,
      symbol: defaultSymbol,
      quantity: defaultQuantity,
      broker: defaultBroker,
    });
    setStep(1);

    void getRiskSettings()
      .then((res) => {
        const limit = res.data.max_daily_loss;
        setAccountDailyLossLimit(limit);
        setMaxLossLimit(String(limit));
      })
      .catch(() => {
        setAccountDailyLossLimit(null);
      });
  }, [defaultBroker, defaultQuantity, defaultSymbol, open]);

  if (!open) return null;

  const canProceedStep1 = maxProfitLimit.trim() !== "" && maxLossLimit.trim() !== "";
  const parsedMaxLoss = Number(maxLossLimit);
  const lossExceedsAccountLimit =
    accountDailyLossLimit !== null &&
    Number.isFinite(parsedMaxLoss) &&
    parsedMaxLoss > accountDailyLossLimit;
  const canDeploy =
    canProceedStep1 &&
    signalValues.symbol.trim() !== "" &&
    signalValues.quantity.trim() !== "" &&
    signalValues.confidence.trim() !== "";

  const combinedError = localError ?? error;
  const isBusy = loading || localLoading;

  const startOtpFlow = async () => {
    setLocalError(null);
    setLocalLoading(true);
    try {
      const response = await sendStrategySignalOtp(toStrategySignalRequest(strategyTag, signalValues));
      setOtpChallenge(response.data);
      setOtp("");
      setStep(3);
    } catch (err) {
      setLocalError(extractApiErrorMessage(err, "Deploy succeeded but OTP could not be sent for the first order."));
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePlatformDeploy = async () => {
    if (lossExceedsAccountLimit) {
      setLocalError(
        `Session max loss cannot exceed your account daily loss limit ($${accountDailyLossLimit}).`,
      );
      return;
    }
    setLocalError(null);
    setLocalLoading(true);
    try {
      const deployed = await onDeploy({
        multiplier: "1.00",
        max_profit_limit: maxProfitLimit.trim(),
        max_loss_limit: maxLossLimit.trim(),
        copy_current_open_trades: false,
      });
      if (deployed) {
        onComplete?.();
        onClose();
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDeployAndRequestOtp = async () => {
    if (lossExceedsAccountLimit) {
      setLocalError(
        `Session max loss cannot exceed your account daily loss limit ($${accountDailyLossLimit}).`,
      );
      return;
    }
    setLocalError(null);
    setLocalLoading(true);
    try {
      const deployed = await onDeploy({
        multiplier: "1.00",
        max_profit_limit: maxProfitLimit.trim(),
        max_loss_limit: maxLossLimit.trim(),
        copy_current_open_trades: false,
      });
      if (!deployed) return;
      await startOtpFlow();
    } finally {
      setLocalLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpChallenge) return;
    setLocalError(null);
    setLocalLoading(true);
    try {
      const response = await verifyStrategySignalOtp(otpChallenge.challenge_id, otp);
      setSuccessDetail(response.data.message || null);
      setSignalOutcome(resolveSignalOutcome(response.data));
      setSignalHistoryId(response.data.signal_history_id ?? null);
      setStep(4);
    } catch (err) {
      setLocalError(extractApiErrorMessage(err, "Invalid OTP. Please try again."));
    } finally {
      setLocalLoading(false);
    }
  };

  const resendOtp = async () => {
    setResendLoading(true);
    setLocalError(null);
    try {
      const response = await sendStrategySignalOtp(toStrategySignalRequest(strategyTag, signalValues));
      setOtpChallenge(response.data);
      setOtp("");
    } catch (err) {
      setLocalError(extractApiErrorMessage(err, "Unable to resend OTP."));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#1A212A] bg-[#070A10] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            {step !== 4 ? (
              <>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8E9AAA]">Deploy strategy</p>
                <h3 className="mt-1 text-xl font-semibold text-[#F3F7FB]">{strategyName}</h3>
                <p className="mt-2 text-sm text-[#93A0AE]">
                  {step === 1
                    ? platformEngine
                      ? "Set profit and loss limits. The platform engine will generate and execute signals automatically."
                      : "Set your profit and loss limits, then configure your first trade signal."
                    : step === 2
                      ? "Review your trade signal, then deploy. OTP is required before the order punches."
                      : "Strategy deployed. Enter OTP to confirm and punch your first order."}
                </p>
              </>
            ) : null}
          </div>
          {step !== 4 ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-[#2B3440] px-3 py-1 text-sm text-[#C7D2DF] hover:border-[#3A4551]"
            >
              Close
            </button>
          ) : null}
        </div>

        {step !== 4 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(["1. Limits", "2. Trade signal", "3. OTP"] as const).map((label, index) => {
              const stepNumber = (index + 1) as 1 | 2 | 3;
              const active = step === stepNumber;
              const complete = step > stepNumber;
              return (
                <span key={label} className="flex items-center gap-2">
                  {index > 0 ? <span className="text-[#3A4551]">→</span> : null}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      active
                        ? "bg-purple-950/40 text-purple-300 ring-1 ring-purple-500/40"
                        : complete
                          ? "bg-purple-950/20 text-purple-400"
                          : "bg-[#1A212A] text-[#6B7785]"
                    }`}
                  >
                    {label}
                  </span>
                </span>
              );
            })}
          </div>
        ) : null}

        {combinedError && step !== 4 ? (
          <p className="mt-4 rounded-2xl border border-[#4F2A2A] bg-[#2A1414] px-4 py-3 text-sm text-[#FFB4B4]">{combinedError}</p>
        ) : null}

        {step === 4 ? (
          <OrderSuccessScreen
            side={signalValues.side}
            symbol={signalValues.symbol.trim().toUpperCase()}
            quantity={signalValues.quantity}
            strategyTag={strategyTag}
            strategyName={strategyName}
            detailMessage={successDetail ?? undefined}
            outcome={signalOutcome}
            signalHistoryId={signalHistoryId}
            onDone={() => {
              onComplete?.();
              onClose();
            }}
          />
        ) : step === 1 ? (
          <>
            <div className="mt-5 space-y-3">
              <label className="block text-sm text-[#9AA5B1]">
                Max profit limit ($)
                <input
                  value={maxProfitLimit}
                  onChange={(event) => setMaxProfitLimit(event.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 500"
                  className="mt-1 w-full rounded-2xl border border-[#242D37] bg-[#0D1218] px-3 py-2 text-[#E8EEF5] outline-none focus:border-purple-500"
                />
              </label>
              <label className="block text-sm text-[#9AA5B1]">
                Max loss limit ($)
                <input
                  value={maxLossLimit}
                  onChange={(event) => setMaxLossLimit(event.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={accountDailyLossLimit ? String(accountDailyLossLimit) : "e.g. 500"}
                  className="mt-1 w-full rounded-2xl border border-[#242D37] bg-[#0D1218] px-3 py-2 text-[#E8EEF5] outline-none focus:border-purple-500"
                />
              </label>
              {accountDailyLossLimit !== null ? (
                <p className="text-xs leading-5 text-[#6B7785]">
                  Defaults to your account daily loss limit (${accountDailyLossLimit}). Session loss cannot
                  exceed this — it blocks new trades when today&apos;s total PnL hits your account limit.
                </p>
              ) : null}
              {lossExceedsAccountLimit ? (
                <p className="text-xs text-[#FFB4B4]">
                  Max loss cannot be higher than your account daily loss limit (${accountDailyLossLimit}).
                </p>
              ) : null}
            </div>

            {platformEngine ? (
              <p className="mt-3 rounded-xl border border-purple-900/50 bg-purple-950/20 px-3 py-2.5 text-xs leading-5 text-purple-300">
                Auto-trading uses strategy config: symbol {defaultSymbol}, quantity {defaultQuantity}. No manual trade is needed at deploy.
              </p>
            ) : null}

            <button
              type="button"
              disabled={!canProceedStep1 || lossExceedsAccountLimit || isBusy}
              onClick={() => (platformEngine ? void handlePlatformDeploy() : setStep(2))}
              className="mt-6 w-full rounded-2xl bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700 active:scale-95 disabled:opacity-60"
            >
              {platformEngine ? (isBusy ? "Deploying..." : "Deploy & Start Auto Trading") : "Next →"}
            </button>
          </>
        ) : step === 2 ? (
          <>
            <div className="mt-5 rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-4">
              <StrategySignalFields strategyTag={strategyTag} values={signalValues} onChange={setSignalValues} />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setStep(1)}
                className="w-full rounded-2xl border border-[#2B3440] px-4 py-3 text-sm font-medium text-[#C7D2DF] hover:border-[#3A4551] disabled:opacity-60"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={isBusy || !canDeploy || lossExceedsAccountLimit}
                onClick={() => void handleDeployAndRequestOtp()}
                className="w-full rounded-2xl bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700 active:scale-95 disabled:opacity-60"
              >
                {isBusy ? "Deploying..." : "Deploy & Auto Trading"}
              </button>
            </div>
          </>
        ) : step === 3 && otpChallenge ? (
          <div className="mt-5">
            <StrategySignalOtpStep
              channel={otpChallenge.channel}
              recipientHint={otpChallenge.recipient_hint}
              debugOtp={otpChallenge.debug_otp}
              otp={otp}
              onOtpChange={setOtp}
              onVerify={() => void verifyOtp()}
              onResend={() => void resendOtp()}
              loading={isBusy}
              resendLoading={resendLoading}
              sideLabel={`${signalValues.side} order`}
              submitLabel={`Verify OTP & punch ${signalValues.side} order`}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
