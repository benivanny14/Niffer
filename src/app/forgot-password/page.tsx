"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { apiPost, errorMessage } from "@/lib/api";

const field =
  "w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    setMessage("");
    try {
      const result = await apiPost<{ ok: boolean; message: string }>(
        "/api/auth/forgot-password",
        { email },
      );
      setMessage(result.message);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="container-x max-w-md py-16 lg:py-24">
      <p className="eyebrow">Account help</p>
      <h1 className="heading-display mt-2">Reset your password</h1>
      <p className="mt-3 text-ink-500">
        Enter the email address linked to your account. We will send you a secure reset link.
      </p>

      <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">Email address</span>
          <input
            className={field}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            required
          />
        </label>

        {message ? (
          <p role="status" className="rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700">
            {message}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn-primary w-full disabled:opacity-60" disabled={sending}>
          {sending ? "Sending…" : "Send reset email"}
        </button>

        <p className="text-center text-sm text-ink-500">
          Remembered your password?{" "}
          <Link href="/akaunti" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
