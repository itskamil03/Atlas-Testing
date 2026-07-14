export type DashboardSummary = {
  total_trades: number;
  cumulative_pnl: string;
  winning_trades: number;
  losing_trades: number;
  active_auto_strategies?: number;
  auto_trades_today?: number;
};

export type UserProfile = {
  id: number;
  email: string;
  full_name: string;
  username: string | null;
  phone: string | null;
  gender: string | null;
  age: number | null;
  experience_level: string | null;
  bio: string | null;
  public_profile: boolean;
  role: string;
  is_active: boolean;
  created_at: string;
};

export type Trade = {
  id: number;
  user_id: number;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: string;
  price: string;
  order_type: "MARKET" | "LIMIT";
  status: string;
  pnl: string;
  broker_order_id: string;
  broker: string;
  strategy_tag?: string | null;
  leader_trade_id?: number | null;
  stop_loss?: string | null;
  take_profit?: string | null;
  failure_reason?: string | null;
  created_at: string;
};

export type BrokerAccount = {
  id: number;
  user_id: number;
  broker_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata_json: string | null;
  exchange_user_id?: string | null;
  display_client_id?: string | null;
};

export type BrokerBalance = {
  broker: string;
  balance: string;
  currency: string;
  available_balance?: string | null;
};

export type BrokerPosition = {
  symbol: string;
  quantity: string;
  avg_entry_price: string;
  unrealized_pnl: string;
};

export type DashboardOverview = {
  pnl: {
    daily: string;
    weekly: string;
    total: string;
  };
  win_rate: string;
  trade_history_count: number;
  open_positions: BrokerPosition[];
  strategy_performance: {
    strategy_tag: string;
    total_trades: number;
    win_rate: string;
    pnl: string;
  }[];
  updated_at: string;
};

export type StrategySignalRequest = {
  symbol: string;
  side: "BUY" | "SELL";
  confidence: number;
  strategy_tag: string;
  broker: "delta";
  quantity?: string | null;
  price?: string | null;
  order_type: "MARKET" | "LIMIT";
};

export type StrategyCard = {
  id: number;
  name: string;
  description: string | null;
  user_id: number;
  strategy_tag: string;
  is_public: boolean;
  exchange: string;
  risk_level: "low" | "medium" | "high";
  strategy_type: "RSI" | "EMA_CROSSOVER" | "LONDON_BREAKOUT" | "CUSTOM";
  parameters: Record<string, string | number> | null;
  symbol: string | null;
  timeframe: string;
  signal_source: "platform_engine" | "creator_webhook";
  last_backtest_id: number | null;
  logo_url: string | null;
  image_url: string | null;
  tags: string | null;
  followers: number;
  recommended_margin: string;
  mdd_percent: string;
  win_rate_percent: string;
  pnl: string;
  roi_percent: string;
  chart_points: string | null;
  academy_slugs: string | null;
  is_featured: boolean;
  created_at: string;
  is_unlocked?: boolean | null;
  required_plan?: string | null;
};

export type StrategyTradeHistoryItem = {
  id: number;
  symbol: string;
  side: string;
  quantity: string;
  entry_price: string;
  exit_price: string | null;
  status: string;
  pnl: string;
  broker: string;
  strategy_tag: string | null;
  order_type: string;
  created_at: string;
};

export type StrategyAllocationItem = {
  symbol: string;
  percentage: string;
  notional: string;
  trades: number;
};

export type StrategyDetailSummary = {
  live_pnl: string;
  roi_percent: string;
  win_rate_percent: string;
  followers: number;
  total_trades: number;
  open_trades: number;
  closed_trades: number;
  average_gain: string;
  average_loss: string;
  big_win: string;
  big_loss: string;
  risk_reward_ratio: string;
  max_drawdown_percent: string;
};

export type StrategyDetailSection = {
  title: string;
  body: string;
};

export type StrategyDetailResponse = {
  strategy: StrategyCard;
  summary: StrategyDetailSummary;
  strategic_details: StrategyDetailSection[];
  trade_history: StrategyTradeHistoryItem[];
  allocation: StrategyAllocationItem[];
};

export type StrategyDeployRequest = {
  multiplier: string | number;
  max_profit_limit?: string | number | null;
  max_loss_limit?: string | number | null;
  copy_current_open_trades: boolean;
};

export type StrategyDeployResponse = {
  subscription_id: number;
  automated_strategy_id: number;
  status: string;
  message?: string;
};

export type StrategyUndeployResponse = {
  subscription_id: number;
  automated_strategy_id: number;
  status: string;
  message: string;
};

export type PublicStrategyFilters = {
  page?: number;
  page_size?: number;
  strategy_tag?: string;
  exchange?: string;
  risk_level?: string;
  featured_only?: boolean;
  search?: string;
};

export type CreateAutomatedStrategyRequest = {
  name: string;
  description?: string | null;
  strategy_type: "RSI" | "MOVING_AVERAGE" | "BOLLINGER_BANDS";
  symbol: string;
  broker: "delta";
  parameters: Record<string, unknown>;
  max_trades_per_day: number;
  max_loss_limit: string | number;
  max_profit_limit?: string | number | null;
  multiplier: string | number;
  capital_allocation_percent: string | number;
  quantity_per_trade: string | number;
};

export type UpdateAutomatedStrategyRequest = Partial<CreateAutomatedStrategyRequest>;

export type AutomatedStrategyItem = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  strategy_type: string;
  symbol: string;
  broker: string;
  parameters: string;
  is_active: boolean;
  status: string;
  strategy_tag: string | null;
  account_id: number | null;
  max_trades_per_day: number;
  max_loss_limit: string;
  max_profit_limit: string | null;
  multiplier: string;
  capital_allocation_percent: string;
  quantity_per_trade: string;
  created_at: string;
  updated_at: string;
};

export type AutomatedStrategyStatus = {
  id: number;
  status: string;
  strategy_tag: string | null;
  account_id: number | null;
  subscription_id: number | null;
};

export type AutoTradingStartRequest = {
  strategy_id: number;
  mode: "live";
  max_position_size: string | number;
  daily_loss_limit: string | number;
  max_open_positions: number;
};

export type AutoTradingStartResponse = {
  success: boolean;
  message: string;
  strategy_id: number;
  mode: "live";
};

export type AutoTradingStopResponse = {
  success: boolean;
  message: string;
};

export type AutoTradingStatus = {
  strategy_id: number;
  strategy_name: string;
  status: "running" | "paused" | "stopped" | string;
  mode: "live" | string;
  started_at: string;
  stopped_at: string | null;
  open_positions: number;
  today_pnl: string;
  total_pnl: string;
  executed_trades: number;
  daily_loss_limit: string;
  max_position_size: string;
  max_open_positions: number;
};

export type AutoTradingMetricsStatus = {
  strategy_id: number;
  status: string;
  signals_received: number;
  trades_executed: number;
  trades_failed: number;
};

export type AutoTradingDashboard = {
  signals: number;
  executed_trades: number;
  failed_trades: number;
  active_positions: number;
  pnl: string | number;
  win_rate: number;
};

export type SignalHistoryItem = {
  id: number;
  strategy_id: number;
  strategy_tag: string;
  symbol: string;
  side: string;
  quantity: string;
  status: string;
  failure_reason: string | null;
  created_at: string;
};

export type SignalHistoryResponse = {
  items: SignalHistoryItem[];
  total: number;
  page: number;
  page_size: number;
};

export type AutoTradingStrategySummary = {
  strategy_id: number;
  strategy_name: string;
  status: string;
  mode: string;
};

export type AutoTradingStrategiesResponse = {
  strategies: AutoTradingStrategySummary[];
};

export type AutoTradingLogItem = {
  id: number;
  event_type: "trade" | "lifecycle" | string;
  signal_type: string | null;
  symbol: string | null;
  side: string | null;
  quantity: string | null;
  price: string | null;
  execution_status: string;
  message: string | null;
  executed_price: string | null;
  executed_at: string | null;
  created_at: string;
};

export type AutoTradingLogsResponse = {
  items: AutoTradingLogItem[];
  total: number;
  page: number;
  page_size: number;
};

export type StrategyOrderItem = {
  id: number;
  automated_strategy_id: number;
  user_id: number;
  symbol: string;
  side: string;
  quantity: string;
  entry_price: string;
  exit_price: string | null;
  status: string;
  broker_order_id: string;
  broker: string;
  pnl: string;
  pnl_percent: string;
  filled_quantity: string;
  signal: string;
  rsi_value: string | null;
  created_at: string;
  filled_at: string | null;
  closed_at: string | null;
  is_open?: boolean;
  mark_price?: string | null;
  realized_pnl?: string;
  unrealized_pnl?: string | null;
  trade_id?: number | null;
  pnl_type?: "realized" | "unrealized" | "none";
};

export type StrategyRunItem = {
  id: number;
  automated_strategy_id: number;
  user_id: number;
  status: string;
  celery_task_id: string | null;
  start_time: string;
  end_time: string | null;
  pnl: string;
  trades_executed: number;
  winning_trades: number;
  losing_trades: number;
  total_loss_today: string;
  error_message: string | null;
  created_at: string;
};

export type StrategyStats = {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: string;
  total_pnl_percent: number;
};

export type StrategyHealth = {
  active_strategies: number;
  total_running_instances: number;
  total_pnl_today: string;
  total_trades_today: number;
  error_count: number;
};

export type StrategySignalResponse = {
  accepted: boolean;
  message: string;
  status?: "queued" | "stored" | "executed" | "failed";
  sessions_queued?: number;
  signal_history_id?: number | null;
};

export type RiskSettings = {
  max_daily_loss: number;
  max_trades_per_day: number;
};

export type StrategySignalOtpChallenge = {
  challenge_id: string;
  channel: string;
  recipient_hint: string;
  expires_in_seconds: number;
  debug_otp?: string | null;
};

export type AdminStrategyCreateRequest = {
  name: string;
  description: string | null;
  strategy_tag: string;
  exchange: string;
  risk_level: "low" | "medium" | "high";
  strategy_type: "RSI" | "EMA_CROSSOVER" | "LONDON_BREAKOUT" | "CUSTOM";
  parameters: Record<string, string | number>;
  symbol: string | null;
  timeframe: string;
  signal_source: "platform_engine" | "creator_webhook";
  logo_url: string | null;
  image_url: string | null;
  tags: string[];
  followers: number;
  recommended_margin: string;
  mdd_percent: string;
  win_rate_percent: string;
  pnl: string;
  roi_percent: string;
  chart_points: string[];
  academy_slugs: string[];
  is_public: boolean;
  is_featured: boolean;
};

export type AdminStrategyUpdateRequest = Partial<AdminStrategyCreateRequest>;

export type CopyLeaderStats = {
  leader_id: number;
  followers: number;
  total_copied_trades: number;
  win_rate: number;
};

export type UserSettings = {
  id: number;
  user_id: number;
  theme: "dark" | "light";
  accent_color: string;
  notify_trade_alerts: boolean;
  notify_strategy_alerts: boolean;
  notify_system_alerts: boolean;
  default_lot_size: string;
  max_open_positions: number;
  created_at: string;
  updated_at: string;
};

export type UserSettingsUpdateRequest = {
  theme: "dark" | "light";
  accent_color: string;
  notify_trade_alerts: boolean;
  notify_strategy_alerts: boolean;
  notify_system_alerts: boolean;
  default_lot_size: number;
  max_open_positions: number;
};

export type KYCRecord = {
  id: number;
  user_id: number;
  status: "pending" | "approved" | "rejected";
  document_type: string;
  document_id: string;
  notes: string | null;
  rejection_reason?: string | null;
  document_url?: string | null;
  created_at: string;
  updated_at: string;
  verified_at: string | null;
};

export type KYCSubmitRequest = {
  document_type: string;
  document_id: string;
  notes?: string | null;
};

export type AcademyArticle = {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content_markdown: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type AcademyArticleCreateRequest = {
  title: string;
  slug: string;
  category: string;
  summary: string;
  content_markdown: string;
  is_published: boolean;
};

export type AcademyArticleUpdateRequest = Partial<AcademyArticleCreateRequest>;

export type BacktestRun = {
  id: number;
  user_id: number;
  strategy_tag: string;
  symbol: string;
  timeframe: string;
  periods: number;
  roi: number;
  drawdown: number;
  win_rate: number;
  report_json: string;
  created_at: string;
};

export type BacktestRunRequest = {
  strategy_tag: string;
  symbol: string;
  timeframe: string;
  periods: number;
  initial_capital: number;
};

export type AppNotification = {
  id: number;
  user_id: number;
  category: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type CreateNotificationRequest = {
  category: string;
  title: string;
  message: string;
};

export type AdminDashboardSummary = {
  total_customers: number;
  active_customers: number;
  total_admins: number;
  total_strategies: number;
  public_strategies: number;
  total_academy_articles: number;
  published_academy_articles: number;
  total_trades: number;
  open_trades: number;
};

export type AdminDashboardMetrics = {
  total_users: number;
  active_traders: number;
  total_strategies: number;
  trades_today: number;
  revenue: string;
  profit_share: string;
  total_followers: number;
  total_subscriptions: number;
};

export type ChartPoint = {
  label: string;
  value: string;
};

export type ActivityItem = {
  id: string;
  category: string;
  title: string;
  detail: string;
  created_at: string;
};

export type PagedMeta = {
  page: number;
  page_size: number;
  total: number;
};

export type AdminUserItem = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  kyc_status: "pending" | "approved" | "rejected";
  subscription_status: "active" | "inactive" | "cancelled";
  plan_name?: string | null;
  access_percent?: number;
  linked_exchange_accounts: number;
  followers: number;
  wallet_balance: string;
  max_daily_loss: string;
  max_trades_per_day: number;
  created_at: string;
};

export type AdminUserListResponse = {
  meta: PagedMeta;
  items: AdminUserItem[];
};

export type AdminTradeItem = {
  id: number;
  user_id: number;
  symbol: string;
  side: string;
  quantity: string;
  price: string;
  order_type: string;
  status: string;
  pnl: string;
  broker: string;
  strategy_tag: string | null;
  created_at: string;
};

export type AdminTradeListResponse = {
  meta: PagedMeta;
  items: AdminTradeItem[];
};

export type StrategyPerformance = {
  equity_curve: ChartPoint[];
  daily_returns: ChartPoint[];
  monthly_returns: ChartPoint[];
  drawdown_curve: ChartPoint[];
  win_loss_ratio: string;
  average_rr: string;
  open_positions: number;
};

export type PlatformSettings = {
  id: number;
  site_name: string;
  support_email: string;
  fee_percent: number;
  profit_share_percent: number;
  maintenance_mode: boolean;
  telegram_alerts_enabled: boolean;
  telegram_chat_id: string | null;
  exchange_api_key: string | null;
  exchange_api_secret: string | null;
  updated_at: string;
};

export type PlatformSettingsUpdateRequest = Omit<PlatformSettings, "id" | "updated_at">;

export type SubscriptionPlan = {
  slug: string;
  display_name: string;
  price_inr: string;
  access_percent: number;
  mentor_support: boolean;
  description: string;
};

export type SubscriptionStatus = {
  has_active_subscription: boolean;
  plan_name: string | null;
  plan_display_name: string | null;
  status: string;
  access_percent: number;
  unlocked_strategy_count: number;
  total_published_strategies: number;
  mentor_support_enabled: boolean;
  amount_paid: string;
  started_at?: string | null;
};

export type StrategyAccessItem = {
  strategy_id: number;
  strategy_tag: string;
  name: string;
  is_unlocked: boolean;
  required_plan: string | null;
};

export type StrategyAccessSummary = {
  plan_name: string | null;
  access_percent: number;
  unlocked_count: number;
  locked_count: number;
  total_published: number;
  strategies: StrategyAccessItem[];
};

export type PaymentInitiateRequest = {
  plan_name: string;
};

export type PaymentInitiateResponse = {
  payment_id: number;
  reference_code: string;
  plan_name: string;
  amount_inr: string;
  upi_vpa: string;
  upi_payee_name: string;
  payment_method: string;
  expires_at: string;
  instructions: string;
};

export type PaymentSubmitRequest = {
  upi_transaction_id: string;
  payer_upi_id?: string | null;
  payment_notes?: string | null;
};

export type SubscriptionPayment = {
  id: number;
  user_id: number;
  plan_name: string;
  amount_inr: string;
  currency: string;
  payment_method: string;
  status: string;
  reference_code: string;
  upi_transaction_id: string | null;
  payer_upi_id: string | null;
  payment_notes: string | null;
  admin_notes: string | null;
  verified_at: string | null;
  submitted_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type MentorSupportRequest = {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  handled_by_user_id: number | null;
  created_at: string;
  updated_at: string;
};

export type MentorSupportCreateRequest = {
  subject: string;
  message: string;
};

export type AuditLogItem = {
  id: number;
  actor_user_id: number | null;
  action: string;
  target_type: string;
  target_id: string | null;
  severity: "info" | "warning" | "error";
  metadata_json: string | null;
  created_at: string;
};

export type AuditLogListResponse = {
  meta: PagedMeta;
  items: AuditLogItem[];
};
