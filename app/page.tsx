import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse"></span>
          Now accepting beta testers
        </div>
        <h1 className="text-5xl font-black tracking-tight mb-4">
          FreeJobBoard<span className="text-indigo-400">.ai</span>
        </h1>
        <p className="text-slate-400 text-lg mb-10">
          Launch a beautiful, modern job board — free. Forever.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-colors">
            Create Your Board — Free →
          </Link>
          <Link href="/login"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
