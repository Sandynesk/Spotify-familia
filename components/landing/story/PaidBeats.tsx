import { BeatBlock } from './BeatBlock'
import { StoryText } from './StoryText'

export function PaidBeats() {
  return (
    <div>
      <BeatBlock beat="paid-1">
        <StoryText
          beat="paid-1"
          step="01"
          title="Atrasou? Você vê na hora."
          support="Quem passa do vencimento fica em destaque vermelho, com o valor em atraso no painel."
          heading={{
            line1: 'Quem pagou?',
            line2: 'Um toque responde.',
          }}
        />
      </BeatBlock>

      <BeatBlock beat="paid-2">
        <StoryText
          beat="paid-2"
          step="02"
          title="Toque no ✓ e está registrado."
          support="Basta um toque na lista. O valor recebido sobe e a barra de arrecadação avança na hora."
        />
      </BeatBlock>

      <BeatBlock beat="paid-3">
        <StoryText
          beat="paid-3"
          step="03"
          title="Arrecadação completa."
          support="Com todos os pagamentos confirmados, o atraso zera e a arrecadação atinge 100%."
        />
      </BeatBlock>
    </div>
  )
}
