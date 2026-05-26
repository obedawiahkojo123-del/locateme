import Link from "next/link";

export default function DashboardHome() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="max-w-xl text-center">

        <h1 className="text-5xl font-black mb-6">
          LocateMe Dashboard
        </h1>

        <p className="text-zinc-400 leading-8 text-lg mb-8">

          No active dashboard session found.

          <br /><br />

          Your private dashboard becomes available
          after generating a new LocateMe link.

        </p>

        <Link
          href="/create"
          className="inline-flex items-center justify-center bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-2xl font-bold transition"
        >
          Create New Location
        </Link>

      </div>

    </main>
  );
}