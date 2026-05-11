"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const COOKIE_NAME = "admin-verified";
const COOKIE_DAYS = 30;

const t = {
  zh: {
    welcome: "欢迎",
    subtitle: "你是访客还是本人？",
    visitor: "访客",
    owner: "本人",
    enterCode: "输入访问码",
    codeHint: "请输入管理后台访问码以继续。",
    codePlaceholder: "输入访问码",
    wrongCode: "访问码不正确",
    back: "返回",
    confirm: "确认",
  },
  en: {
    welcome: "Welcome",
    subtitle: "Are you a visitor or the owner?",
    visitor: "Visitor",
    owner: "Owner",
    enterCode: "Enter Access Code",
    codeHint: "Please enter the admin access code to continue.",
    codePlaceholder: "Enter access code",
    wrongCode: "Incorrect code",
    back: "Back",
    confirm: "Confirm",
  },
};

export default function GatePage() {
  const router = useRouter();
  const [step, setStep] = useState<"choose" | "password">("choose");
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [lang, setLang] = useState<"zh" | "en">("en");

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.language.startsWith("zh")) {
      setLang("zh");
    }
  }, []);

  const correctCode = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE;
  const locale = lang === "zh" ? "zh" : "en";
  const text = t[lang];

  function goVisitor() {
    router.push(`/${locale}`);
  }

  function handleOwnerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correctCode || input.trim() === correctCode) {
      const expires = new Date(
        Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000,
      ).toUTCString();
      document.cookie = `${COOKIE_NAME}=1; expires=${expires}; path=/; samesite=lax`;
      router.push(`/${locale}`);
    } else {
      setError(true);
    }
  }

  if (step === "password") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {text.enterCode}
          </h1>
          <p className="mt-2 text-sm text-muted">{text.codeHint}</p>
          <form onSubmit={handleOwnerSubmit} className="mt-6">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              placeholder={text.codePlaceholder}
              autoFocus
              className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-center text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {error && (
              <p className="mt-3 text-sm text-accent-strong">{text.wrongCode}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("choose");
                  setInput("");
                  setError(false);
                }}
                className="flex-1 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent"
              >
                {text.back}
              </button>
              <button
                type="submit"
                className="flex-1 rounded-md bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-accent"
              >
                {text.confirm}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {text.welcome}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">{text.subtitle}</p>
        <div className="mt-8 flex gap-4">
          <button
            onClick={goVisitor}
            className="flex-1 rounded-md border border-border bg-surface px-4 py-6 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
          >
            <div className="mb-2 text-2xl">🙋</div>
            {text.visitor}
          </button>
          <button
            onClick={() => setStep("password")}
            className="flex-1 rounded-md border border-border bg-surface px-4 py-6 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
          >
            <div className="mb-2 text-2xl">🔑</div>
            {text.owner}
          </button>
        </div>
      </div>
    </div>
  );
}
