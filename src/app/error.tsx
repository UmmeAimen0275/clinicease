"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div className="max-w-sm space-y-4">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          The server took too long to respond. Please try again in a moment.
        </p>
        <button onClick={reset} className="rounded-xl bg-teal-600 px-6 py-2.5 font-medium text-white hover:bg-teal-700">
          Try again
        </button>
      </div>
    </main>
  );
}