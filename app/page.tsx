"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import LiquidGlass from "liquid-glass-react";

const COOKIE_NAME = "admin-verified";
const COOKIE_DAYS = 30;

export default function GatePage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const visitorRef = useRef<HTMLDivElement>(null);
  const ownerRef = useRef<HTMLDivElement>(null);

  const correctCode = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE;

  function triggerConfetti(el: HTMLElement | null) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    confetti({
      particleCount: 80,
      spread: 120,
      startVelocity: 45,
      origin: { x, y },
      colors: ["#fbfaf7", "#0f766e", "#d97706", "#a16207"],
    });
  }

  function handleVisitor() {
    triggerConfetti(visitorRef.current);
    setTimeout(() => router.push("/en"), 350);
  }

  function handleOwner() {
    triggerConfetti(ownerRef.current);
    setTimeout(() => setShowPassword(true), 350);
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correctCode || input.trim() === correctCode) {
      const expires = new Date(
        Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000,
      ).toUTCString();
      document.cookie = `${COOKIE_NAME}=1; expires=${expires}; path=/; samesite=lax`;
      setError(false);
      triggerConfetti(ownerRef.current);
      setTimeout(() => router.push("/en"), 350);
    } else {
      setError(true);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Blurred homepage background via iframe */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          src="/en"
          title=""
          className="h-full w-full scale-110 blur-xl opacity-25"
          style={{ border: "none", pointerEvents: "none" }}
        />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      {/* Gate overlay */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        {showPassword ? (
          /* Password modal */
          <div className="mx-4 w-full max-w-sm">
            <LiquidGlass
              mode="prominent"
              cornerRadius={24}
              className="px-8 py-10"
            >
              <div className="text-center">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Enter Access Code
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Please enter the admin access code to continue.
                </p>
                <form onSubmit={handlePasswordSubmit} className="mt-6">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setError(false);
                    }}
                    placeholder="Enter access code"
                    autoFocus
                    className="w-full rounded-md border border-border bg-background/60 px-4 py-2.5 text-center text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  {error && (
                    <p className="mt-3 text-sm text-accent-strong">
                      Incorrect code
                    </p>
                  )}
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPassword(false);
                        setInput("");
                        setError(false);
                      }}
                      className="flex-1 rounded-md border border-border bg-surface/60 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-md bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-accent"
                    >
                      Confirm
                    </button>
                  </div>
                </form>
              </div>
            </LiquidGlass>
          </div>
        ) : (
          /* Main choice */
          <div className="mx-4 flex flex-col items-center gap-10 sm:flex-row">
            <div ref={visitorRef}>
              <LiquidGlass
                mode="prominent"
                cornerRadius={24}
                className="px-12 py-10"
                onClick={handleVisitor}
              >
                <div className="select-none text-center">
                  <div className="text-4xl">🙋</div>
                  <p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    Visitor
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Continue to homepage
                  </p>
                </div>
              </LiquidGlass>
            </div>

            <div ref={ownerRef}>
              <LiquidGlass
                mode="prominent"
                cornerRadius={24}
                className="px-12 py-10"
                onClick={handleOwner}
              >
                <div className="select-none text-center">
                  <div className="text-4xl">🔑</div>
                  <p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    Owner
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Enter admin mode
                  </p>
                </div>
              </LiquidGlass>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
