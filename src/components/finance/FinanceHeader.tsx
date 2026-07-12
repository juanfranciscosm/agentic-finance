import Image from "next/image";

export default function FinanceHeader() {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        <div className="relative h-25 w-25 shrink-0 overflow-hidden">
          <Image
            src="/airos-logo.png"
            alt="Logo de AIROS"
            fill
            sizes="56px"
            priority
            className="object-contain p-2"
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2a5970]">
            Powered by AIROS
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#2f3841]">
            AIROS Financial Agent
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Asistente de finanzas personales y soporte para clientes bancarios.
          </p>
        </div>
      </div>
    </header>
  );
}