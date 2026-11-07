// STUB da fundação — o agente responsável substitui a implementação mantendo o export.
import { BeatBlock } from './BeatBlock'

export function SlotsBeats() {
  return (
    <div id="como-funciona">
      <BeatBlock beat="slots-1"><h2 className="text-4xl font-bold">Seis vagas. Uma conta. Zero planilha.</h2></BeatBlock>
      <BeatBlock beat="slots-2"><p className="text-2xl">Defina quanto cada um paga e o dia do vencimento.</p></BeatBlock>
      <BeatBlock beat="slots-3"><p className="text-2xl">Pronto. Todo mês, as cobranças aparecem sozinhas.</p></BeatBlock>
    </div>
  )
}
