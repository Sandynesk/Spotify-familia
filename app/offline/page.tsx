import { BrandSymbol } from '@/components/landing/BrandMark'

export default function OfflinePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#48E5B2]/[0.08] blur-[100px]"
      />
      <section className="relative flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-9 flex h-24 w-24 items-center justify-center rounded-[30px] border border-white/10 bg-white/[0.045] shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
          <BrandSymbol size={57} />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#48E5B2]">
          SpotiFamília · offline
        </p>
        <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.03em]">
          Você está sem internet
        </h1>
        <p className="mt-4 max-w-sm text-[15px] leading-6 text-white/60">
          Seus dados aparecem assim que a conexão voltar.
        </p>
        <form action="" method="get" className="mt-9">
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#48E5B2] px-7 text-sm font-semibold text-[#04261B] transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#48E5B2]"
          >
            Tentar de novo
          </button>
        </form>
      </section>
    </main>
  )
}
