"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { apiPost, errorMessage } from "@/lib/api";

const field =
  "w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const result = await apiPost<{ ok: boolean; message: string }>(
        "/api/auth/reset-password",
        { token, password, confirmPassword },
      );
      setMessage(result.message);
      setPassword("");
      setConfirmPassword("");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container-x max-w-md py-16 lg:py-24">
      <p className="eyebrow">Account help</p>
      <h1 className="heading-display mt-2">Choose a new password</h1>
      {!token ? (
        <div className="card mt-8 space-y-4 p-6">
          <p className="text-ink-500">This password reset link is missing or invalid. Request a new one to continue.</p>
          <Link href="/forgot-password" className="btn-primary w-full">Request a new link</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">New password</span>
            <input
              className={field}
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">Confirm new password</span>
            <input
              className={field}
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>

          {message ? (
            <p role="status" className="rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700">
              {message} <Link href="/akaunti" className="font-semibold underline">Sign in</Link>
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn-primary w-full disabled:opacity-60" disabled={saving}>
            {saving ? "Saving…" : "Update password"}
          </button>
        </form>
      )}
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="container-x max-w-md py-16"><div className="card h-64 animate-pulse" /></main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
