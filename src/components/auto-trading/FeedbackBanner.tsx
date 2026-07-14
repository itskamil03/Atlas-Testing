type FeedbackBannerProps = {
  error?: string | null;
  message?: string | null;
};

export function FeedbackBanner({ error, message }: FeedbackBannerProps) {
  return (
    <>
      {message ? (
        <p className="mb-4 rounded-2xl border border-[#31503A] bg-[#142419] px-4 py-3 text-sm text-[#AEE7B8]">{message}</p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-2xl border border-[#4F2A2A] bg-[#2A1414] px-4 py-3 text-sm text-[#FFB4B4]">{error}</p>
      ) : null}
    </>
  );
}
