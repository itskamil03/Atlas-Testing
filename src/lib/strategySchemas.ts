export type StrategyParameterField = {
  key: string;
  label: string;
  type: "number" | "integer" | "text" | "time" | "select";
  default?: string | number;
  min?: number;
  max?: number;
  options?: Array<{ value: string; label: string }>;
};

export type StrategyTypeDefinition = {
  type: string;
  label: string;
  supports_backtest: boolean;
  supports_platform_engine: boolean;
  default_signal_source: "platform_engine" | "creator_webhook";
  parameters: StrategyParameterField[];
  defaults: Record<string, string | number>;
};

export const FALLBACK_STRATEGY_TYPES: StrategyTypeDefinition[] = [
  {
    type: "RSI",
    label: "RSI",
    supports_backtest: true,
    supports_platform_engine: true,
    default_signal_source: "platform_engine",
    parameters: [
      { key: "rsi_period", label: "RSI Period", type: "integer", default: 14, min: 2, max: 200 },
      { key: "rsi_lower", label: "RSI Lower", type: "number", default: 30, min: 0, max: 100 },
      { key: "rsi_upper", label: "RSI Upper", type: "number", default: 70, min: 0, max: 100 },
      { key: "cooldown", label: "Cooldown (seconds)", type: "integer", default: 60, min: 0 },
      { key: "quantity_per_signal", label: "Quantity Per Signal", type: "number", default: 1, min: 0.0001 },
    ],
    defaults: {
      rsi_period: 14,
      rsi_lower: 30,
      rsi_upper: 70,
      cooldown: 60,
      quantity_per_signal: 1,
    },
  },
  {
    type: "EMA_CROSSOVER",
    label: "EMA Crossover",
    supports_backtest: true,
    supports_platform_engine: true,
    default_signal_source: "platform_engine",
    parameters: [
      { key: "fast_period", label: "Fast EMA Period", type: "integer", default: 9, min: 2, max: 200 },
      { key: "slow_period", label: "Slow EMA Period", type: "integer", default: 21, min: 3, max: 400 },
      { key: "cooldown", label: "Cooldown (seconds)", type: "integer", default: 60, min: 0 },
      { key: "quantity_per_signal", label: "Quantity Per Signal", type: "number", default: 1, min: 0.0001 },
      { key: "stop_loss", label: "Stop Loss (optional points)", type: "number", default: 0, min: 0 },
      { key: "take_profit", label: "Take Profit (optional points)", type: "number", default: 0, min: 0 },
    ],
    defaults: {
      fast_period: 9,
      slow_period: 21,
      cooldown: 60,
      quantity_per_signal: 1,
      stop_loss: 0,
      take_profit: 0,
    },
  },
  {
    type: "LONDON_BREAKOUT",
    label: "London Breakout",
    supports_backtest: true,
    supports_platform_engine: true,
    default_signal_source: "platform_engine",
    parameters: [
      { key: "session_start_time", label: "Session Start Time", type: "time", default: "09:00" },
      { key: "session_end_time", label: "Session End Time", type: "time", default: "11:30" },
      { key: "timezone", label: "Timezone", type: "text", default: "Asia/Kolkata" },
      { key: "risk_reward", label: "Risk Reward (TP multiplier)", type: "number", default: 2, min: 0.1 },
      { key: "quantity_per_signal", label: "Quantity Per Signal", type: "number", default: 1, min: 0.0001 },
      {
        key: "breakout_confirmation",
        label: "Breakout Confirmation",
        type: "select",
        default: "close",
        options: [{ value: "close", label: "Candle Close" }],
      },
      { key: "cooldown", label: "Cooldown (seconds)", type: "integer", default: 86400, min: 0 },
    ],
    defaults: {
      session_start_time: "09:00",
      session_end_time: "11:30",
      timezone: "Asia/Kolkata",
      risk_reward: 2,
      quantity_per_signal: 1,
      breakout_confirmation: "close",
      cooldown: 86400,
    },
  },
  {
    type: "CUSTOM",
    label: "Custom (creator signals)",
    supports_backtest: false,
    supports_platform_engine: false,
    default_signal_source: "creator_webhook",
    parameters: [
      { key: "cooldown", label: "Cooldown (seconds)", type: "integer", default: 60, min: 0 },
      { key: "quantity_per_signal", label: "Quantity Per Signal", type: "number", default: 1, min: 0.0001 },
      { key: "notes", label: "Notes", type: "text", default: "" },
    ],
    defaults: {
      cooldown: 60,
      quantity_per_signal: 1,
      notes: "",
    },
  },
];

export function getStrategyTypeDefinition(
  types: StrategyTypeDefinition[],
  strategyType: string,
): StrategyTypeDefinition | undefined {
  return types.find((item) => item.type === strategyType);
}
