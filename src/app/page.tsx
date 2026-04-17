export default function Home() {
  const url = "https://allocate-dsem.up.railway.app/";
  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-8">
      <div className="text-center">
        <p className="text-lg text-zinc-900">
          This app has been moved to:{" "}
          <a
            href={url}
            className="font-semibold text-violet-700 underline underline-offset-4 hover:text-violet-900"
          >
            {url}
          </a>
        </p>
      </div>
    </main>
  );
}
