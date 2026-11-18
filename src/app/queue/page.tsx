import Link from "next/link";
import { QueueBoard } from "@/components/queue-board";

export default function QueuePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-background p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">Waiting room</h1>
          <p className="text-muted-foreground">Live queue. Updates every 5 seconds.</p>
        </div>
        <QueueBoard />
        <p className="text-center"><Link href="/" className="text-sm underline">Back to home</Link></p>
      </div>
    </main>
  );
}