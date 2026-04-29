"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";

const COOKIE_NAME = "cv-verified";
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; samesite=lax`;
}

export function CvGate() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const correctCode = process.env.NEXT_PUBLIC_CV_ACCESS_CODE;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correctCode || input.trim() === correctCode) {
      setCookie(COOKIE_NAME, "1", COOKIE_DAYS);
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <Lock aria-hidden="true" className="mx-auto size-10 text-accent" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          需要访问码
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          简历页面已设为受限访问。请输入访问码以继续查看。
        </p>
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="输入访问码"
            autoFocus
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-center text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {error ? (
            <p className="mt-3 text-sm text-accent-strong">访问码不正确</p>
          ) : null}
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-accent"
          >
            确认
          </button>
        </form>
      </div>
    </div>
  );
}
