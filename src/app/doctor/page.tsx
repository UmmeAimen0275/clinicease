import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const session = await auth(); // read the logged-in user on the server
  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Doctor area</h1>
      <p>
        Welcome, {session?.user.name} ({session?.user.role})
      </p>
      {/* Logout button: a server action */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button type="submit" variant="outline">
          Log out
        </Button>
      </form>
    </main>
  );
}
