"use client";

import { useState } from "react";
import { getAccessToken } from "@/lib/auth";

type ProtectedUser = Record<string, unknown>;

export default function ProtectedUsers() {
  const [users, setUsers] = useState<ProtectedUser[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    setError("");

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("Missing access token. Please log in first.");
      }

      const res = await fetch("http://localhost:5000/api/users/protected", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto mb-10 max-w-6xl px-6">
      <h2 className="text-2xl font-semibold">Protected users</h2>
      <button
        onClick={fetchUsers}
        className="mt-3 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
        disabled={loading}
      >
        {loading ? "Loading..." : "Load Protected Users"}
      </button>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {users.length > 0 && (
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900/10 p-4 text-sm">
          {JSON.stringify(users, null, 2)}
        </pre>
      )}
    </section>
  );
}
