"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { getAdminRoute, setAdminViewMode } from "@/lib/adminRoutes";
import { extractApiErrorMessage } from "@/lib/errors";
import type { AcademyArticle, AcademyArticleCreateRequest, UserProfile } from "@/lib/types";

const DEFAULT_ARTICLE: AcademyArticleCreateRequest = {
  title: "",
  slug: "",
  category: "general",
  summary: "",
  content_markdown: "",
  is_published: true,
};

export default function AcademyPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<AcademyArticle[]>([]);
  const [form, setForm] = useState<AcademyArticleCreateRequest>(DEFAULT_ARTICLE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const [articlesRes, profileRes] = await Promise.all([
        api.get<AcademyArticle[]>("/academy/articles"),
        api.get<UserProfile>("/auth/me"),
      ]);
      const viewMode = typeof window !== "undefined" ? sessionStorage.getItem("viewMode") : null;
      if (profileRes.data.role === "admin" && viewMode !== "trader") {
        setAdminViewMode();
        router.replace(getAdminRoute("academy"));
        return;
      }
      setArticles(articlesRes.data);
    } catch {
      setError("Unable to load academy articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    void loadArticles();
  }, [router]);

  const onLogout = () => {
    clearTokens();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#050607] text-gray-900 dark:text-[#E8ECEF]">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 dark:border-[#1A1E23] bg-white dark:bg-[#090B0F] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-[#8B95A1]">Academy</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-[#F6FAFF]">Learning Resources</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/dashboard")} className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/5 transition duration-150 active:scale-95">Dashboard</button>
            <button onClick={onLogout} className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/5 transition duration-150 active:scale-95">Sign Out</button>
          </div>
        </header>

        {error ? <p className="mb-3 rounded-lg border border-red-300 dark:border-[#4F2A2A] bg-red-50 dark:bg-[#2A1414] px-3 py-2 text-sm text-red-600 dark:text-[#FFB4B4]">{error}</p> : null}
        {message ? <p className="mb-3 rounded-lg border border-purple-300 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/20 px-3 py-2 text-sm text-purple-700 dark:text-purple-300">{message}</p> : null}

        <section className="rounded-2xl border border-gray-200 dark:border-[#1A1E23] bg-white dark:bg-[#0A0D13] p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F3F7FB]">Published Articles</h2>
          {loading ? <p className="mt-3 text-sm text-gray-500 dark:text-[#9AA5B1]">Loading...</p> : null}
          <div className="mt-3 space-y-3">
            {articles.map((item) => (
              <article key={item.id} className="rounded-xl border border-gray-200 dark:border-[#24303A] bg-gray-50 dark:bg-[#0D131B] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button onClick={() => router.push(`/dashboard/academy/${item.slug}`)} className="text-left text-lg font-semibold text-gray-800 dark:text-[#EFF4FA] hover:text-gray-900 dark:hover:text-[#FFFFFF]">{item.title}</button>
                    <p className="text-xs text-gray-500 dark:text-[#8D9AAA]">{item.category} • {item.slug}</p>
                  </div>
                  <span className="rounded-full border border-gray-300 dark:border-[#2A313A] px-2 py-1 text-xs text-gray-600 dark:text-[#AAB4C0]">{item.is_published ? "Published" : "Draft"}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-[#B8C2CF]">{item.summary}</p>
              </article>
            ))}
            {!loading && articles.length === 0 ? <p className="text-sm text-gray-400 dark:text-[#7F8A97]">No academy articles yet.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}