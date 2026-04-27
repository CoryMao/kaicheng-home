import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-4 text-base leading-7 text-muted">
        The page may have moved, or the requested language version may not exist
        yet.
      </p>
      <Link
        href="/en"
        className="mt-8 inline-flex w-fit rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent"
      >
        Back home
      </Link>
    </div>
  );
}
