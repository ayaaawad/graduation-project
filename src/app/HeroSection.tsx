import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
      {/* Background image with contain for full visibility */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/real%20man%20lap%20image.avif)',
          backgroundSize: 'contain',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Left side gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-transparent z-10" />
      
      {/* Content */}
      <div className="relative z-10 px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Premium Laptops
            </h1>
            <p className="text-lg text-slate-300">
              Curated selection of high-performance machines for professionals and creators.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/ai-match"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5"
            >
              Start AI Matcher
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10 hover:border-white/30"
            >
              Browse Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}