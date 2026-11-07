// STUB da fundação — o agente responsável substitui a implementação mantendo o export.
import { BeatBlock } from './BeatBlock'

export function PaidBeats() {
  return (
    <div>
      <BeatBlock beat="paid-1"><h2 className="text-4xl font-bold">Quem pagou? Um toque responde.</h2></BeatBlock>
      <BeatBlock beat="paid-2"><p className="text-2xl">Toque no ✓ e está registrado.</p></BeatBlock>
      <BeatBlock beat="paid-3"><p className="text-2xl">Arrecadação completa.</p></BeatBlock>
    </div>
  )
}
