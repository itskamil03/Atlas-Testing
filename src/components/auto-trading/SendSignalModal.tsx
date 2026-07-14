"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  StrategySignalFields,
  toStrategySignalRequest,
  type StrategySignalFormValues,
} from "@/components/auto-trading/StrategySignalFields";
import { OrderSuccessScreen } from "@/components/auto-trading/OrderSuccessScreen";
import { StrategySignalOtpStep } from "@/components/auto-trading/StrategySignalOtpStep";
import {
  getAutomatedStrategyStatus,
  getAutoTradingStatus,
  sendStrategySignalOtp,
  verifyStrategySignalOtp,
} from "@/lib/api";
import { resolveTradingStrategyId } from "@/lib/automatedStrategy";
import { extractApiErrorMessage } from "@/lib/errors";
import { resolveSignalOutcome, type SignalOutcome } from "@/lib/signalOutcome";
import type { StrategySignalOtpChallenge, StrategySignalRequest } from "@/lib/types";

type SendSignalModalProps = {
  open: boolean;
  strategyTag: string;
  strategyName: string;
  automatedStrategyId?: number;
  defaultSymbol?: string;
  defaultBroker?: StrategySignalRequest["broker"];
  defaultSide?: "BUY" | "SELL";
  onClose: () => void;
  onSent?: () => void;
};

const DEFAULT_SIGNAL: StrategySignalFormValues = {
  symbol: "BTCUSD",
  side: "BUY",
  quantity: "1",
  confidence: "0.82",
  orderType: "MARKET",
  broker: "delta",
};

export function SendSignalModal({
  open,
  strategyTag,
  strategyName,
  automatedStrategyId,
  defaultSymbol = "BTCUSD",
  defaultBroker = "delta",
  defaultSide = "BUY",
  onClose,
  onSent,
}: SendSignalModalProps) {
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [values, setValues] = useState<StrategySignalFormValues>({
    ...DEFAULT_SIGNAL,
    symbol: defaultSymbol,
    broker: defaultBroker,
    side: defaultSide,
  });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sessionRunning, setSessionRunning] = useState<boolean | null>(null);
  const [otpChallenge, setOtpChallenge] = useState<StrategySignalOtpChallenge | null>(null);
  const [otp, setOtp] = useState("");
  const [successDetail, setSuccessDetail] = useState<string | null>(null);
  const [signalOutcome, setSignalOutcome] = useState<SignalOutcome>("queued");
  const [signalHistoryId, setSignalHistoryId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("form");
      setFeedback(null);
      setSessionRunning(null);
      setOtpChallenge(null);
      setOtp("");
      setSuccessDetail(null);
      setSignalOutcome("queued");
      setSignalHistoryId(null);
      setValues({
        ...DEFAULT_SIGNAL,
        symbol: defaultSymbol,
        broker: defaultBroker,
        side: defaultSide,
      });
      return;
    }

    if (!automatedStrategyId) {
      setSessionRunning(null);
      return;
    }

    void (async () => {
      try {
        const tradingStrategyId = await resolveTradingStrategyId(automatedStrategyId);
        if (tradingStrategyId === null) {
          const statusRes = await getAutomatedStrategyStatus(automatedStrategyId);
          const label = statusRes.data.status?.toUpperCase() ?? "";
          setSessionRunning(["RUNNING", "ACTIVE"].includes(label));
          return;
        }
        const liveRes = await getAutoTradingStatus(tradingStrategyId);
        const label = liveRes.data.status?.toUpperCase() ?? "";
        setSessionRunning(["RUNNING", "ACTIVE"].includes(label));
      } catch {
        setSessionRunning(null);
      }
    })();
  }, [automatedStrategyId, defaultBroker, defaultSide, defaultSymbol, open]);

  if (!open) return null;

  const canSend =
    values.symbol.trim() !== "" && values.quantity.trim() !== "" && values.confidence.trim() !== "";

  const requestOtp = async () => {
    setFeedback(null);
    setLoading(true);
    try {
      const response = await sendStrategySignalOtp(toStrategySignalRequest(strategyTag, values));
      setOtpChallenge(response.data);
      setOtp("");
      setStep("otp");
    } catch (err) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(err, "Unable to send OTP."),
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpChallenge) return;
    setFeedback(null);
    setLoading(true);
    try {
      const response = await verifyStrategySignalOtp(otpChallenge.challenge_id, otp);
      setSuccessDetail(response.data.message || null);
      setSignalOutcome(resolveSignalOutcome(response.data));
      setSignalHistoryId(response.data.signal_history_id ?? null);
      setStep("success");
      onSent?.();
    } catch (err) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(err, "Invalid OTP. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResendLoading(true);
    setFeedback(null);
    try {
      const response = await sendStrategySignalOtp(toStrategySignalRequest(strategyTag, values));
      setOtpChallenge(response.data);
      setOtp("");
      setFeedback({ type: "success", text: "A new OTP has been sent." });
    } catch (err) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(err, "Unable to resend OTP."),
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#1A212A] bg-[#070A10] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            {step !== "success" ? (
              <>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8E9AAA]">Order execution</p>
                <h3 className="mt-1 text-xl font-semibold text-[#F3F7FB]">{strategyName}</h3>
              </>
            ) : null}
          </div>
          {step !== "success" ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-[#2B3440] px-3 py-1 text-sm text-[#C7D2DF] hover:border-[#3A4551]"
            >
              Close
            </button>
          ) : null}
        </div>

        {sessionRunning === false && step === "form" ? (
          <p className="mt-4 rounded-xl border border-[#4A4428] bg-[#2A2414] px-3 py-2.5 text-sm text-[#F5D98B]">
            Auto-trading is not running.{" "}
            {automatedStrategyId ? (
              <Link href={`/my-strategies/${automatedStrategyId}`} className="text-[#9BFF00] underline">
                Open My Strategies
              </Link>
            ) : null}{" "}
            and click <strong>Start</strong>, then send your signal.
          </p>
        ) : null}

        {feedback && step !== "success" ? (
          <p
            className={`mt-4 rounded-xl border px-3 py-2.5 text-sm ${
              feedback.type === "success"
                ? "border-[#31503A] bg-[#142419] text-[#AEE7B8]"
                : "border-[#4F2A2A] bg-[#2A1414] text-[#FFB4B4]"
            }`}
          >
            {feedback.text}
          </p>
        ) : null}

        {step === "success" ? (
          <OrderSuccessScreen
            side={values.side}
            symbol={values.symbol.trim().toUpperCase()}
            quantity={values.quantity}
            strategyTag={strategyTag}
            strategyName={strategyName}
            detailMessage={successDetail ?? undefined}
            outcome={signalOutcome}
            signalHistoryId={signalHistoryId}
            onDone={onClose}
          />
        ) : step === "form" ? (
          <>
            <div className="mt-5 rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-4">
              <StrategySignalFields strategyTag={strategyTag} values={values} onChange={setValues} />
            </div>

            {automatedStrategyId ? (
              <p className="mt-3 text-center text-xs text-[#6B7785]">
                <Link href={`/my-strategies/${automatedStrategyId}`} className="text-[#9BFF00] hover:underline">
                  Manage deployment & controls →
                </Link>
              </p>
            ) : null}

            <button
              type="button"
              disabled={loading || !canSend || sessionRunning === false}
              onClick={() => void requestOtp()}
              className="mt-5 w-full rounded-2xl bg-[#9BFF00] px-4 py-3 font-semibold text-[#11140D] transition hover:bg-[#B7FF45] disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : `Send ${values.side} signal & punch order`}
            </button>
          </>
        ) : otpChallenge ? (
          <div className="mt-5">
            <StrategySignalOtpStep
              channel={otpChallenge.channel}
              recipientHint={otpChallenge.recipient_hint}
              debugOtp={otpChallenge.debug_otp}
              otp={otp}
              onOtpChange={setOtp}
              onVerify={() => void verifyOtp()}
              onResend={() => void resendOtp()}
              onBack={() => {
                setStep("form");
                setOtp("");
              }}
              loading={loading}
              resendLoading={resendLoading}
              sideLabel={`${values.side} order`}
              submitLabel={`Verify OTP & punch ${values.side} order`}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
