import { ThemeCustomizer } from "../components/ThemeCustomizer";

export default function Colors() {
  return (
    <main className="min-h-screen py-8 bg-base-300">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Event Theme Designer</h1>
        <p className="text-center mb-8 text-base-content/70">Make your event uniquely yours with custom colors</p>
        <ThemeCustomizer />
      </div>
    </main>
  )
}

