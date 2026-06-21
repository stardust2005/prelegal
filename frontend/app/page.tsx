import NdaWorkspace from "@/components/NdaWorkspace";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-900">Mutual NDA Generator</h1>
        <p className="text-sm text-zinc-600">
          Fill in the details below to generate a Common Paper Mutual NDA, then download it as a
          PDF.
        </p>
      </header>

      <NdaWorkspace />
    </div>
  );
}
