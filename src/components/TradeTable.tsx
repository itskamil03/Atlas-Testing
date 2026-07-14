import type { Trade } from "@/lib/types";

function tradeStatusClass(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "EXECUTED") return "text-[#AEE7B8]";
  if (normalized === "FAILED") return "text-[#FFB4B4]";
  if (normalized === "PENDING") return "text-[#F5D98B]";
  return "text-[#AEB8C5]";
}

type Props = {
  trades: Trade[];
  showFailureReason?: boolean;
};

export function TradeTable({ trades, showFailureReason = false }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#1A1E23] bg-[#0A0D13] p-0">
      <div className="border-b border-[#1E252E] p-6">
        <h2 className="text-xl font-semibold text-[#F3F7FB]">Trade History</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#0E141B] text-[#A3AFBC]">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">PnL</th>
              <th className="px-4 py-3">Status</th>
              {showFailureReason ? <th className="px-4 py-3">Failure reason</th> : null}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-t border-[#171E27] text-[#D5DEE8]">
                <td className="px-4 py-3 text-[#93A0AE]">{new Date(trade.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                <td className={`px-4 py-3 ${trade.side === "BUY" ? "text-[#67E8A5]" : "text-[#FB7185]"}`}>{trade.side}</td>
                <td className="px-4 py-3">{trade.quantity}</td>
                <td className="px-4 py-3">{trade.price}</td>
                <td className={`px-4 py-3 ${Number(trade.pnl) >= 0 ? "text-[#9BFF00]" : "text-[#FB7185]"}`}>{trade.pnl}</td>
                <td className={`px-4 py-3 ${tradeStatusClass(trade.status)}`}>{trade.status}</td>
                {showFailureReason ? (
                  <td className="px-4 py-3 text-[#93A0AE]">{trade.failure_reason ?? "-"}</td>
                ) : null}
              </tr>
            ))}
            {trades.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-[#708090]" colSpan={showFailureReason ? 8 : 7}>
                  No trades yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
