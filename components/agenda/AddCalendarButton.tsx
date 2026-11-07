'use client'

import { useState } from 'react'
import { CalendarPlus, Download } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'

export function AddCalendarButton() {
  const [open, setOpen] = useState(false)

  function downloadCalendar() {
    setOpen(true)
  }

  return (
    <>
      <a
        href="/api/agenda/ics"
        download="spotifamilia-vencimentos.ics"
        onClick={downloadCalendar}
        aria-label="Adicionar ao calendário"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-app-accent px-4 text-sm font-semibold tracking-[-0.01em] text-app-accent-ink transition-[background-color,transform] duration-200 ease-app hover:bg-app-accent-hover active:scale-[0.97]"
      >
        <span aria-hidden className="flex shrink-0 items-center [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-[1.75]"><CalendarPlus /></span>
        <span className="sm:hidden">Adicionar</span>
        <span className="hidden sm:inline">Adicionar ao calendário</span>
      </a>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Leve seus vencimentos com você"
        description="O arquivo .ics foi baixado. Siga os passos do seu calendário para importar as datas."
      >
        <div className="space-y-5">
          <section>
            <h3 className="text-sm font-semibold text-app-text">No iPhone</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-app-muted">
              <li>Abra o arquivo baixado ou toque nele em Arquivos.</li>
              <li>Escolha adicionar todos os eventos ao Calendário.</li>
            </ol>
          </section>
          <section>
            <h3 className="text-sm font-semibold text-app-text">No Google Agenda</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-app-muted">
              <li>No computador, abra Configurações e depois Importar e exportar.</li>
              <li>Selecione o arquivo .ics e escolha em qual agenda importar.</li>
            </ol>
          </section>
          <a href="/api/agenda/ics" download="spotifamilia-vencimentos.ics" onClick={downloadCalendar} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-app-line bg-app-elevated px-5 text-sm font-semibold text-app-text transition-colors hover:bg-app-raised">
            <Download aria-hidden className="h-5 w-5" />
            Baixar arquivo .ics novamente
          </a>
        </div>
      </Sheet>
    </>
  )
}
