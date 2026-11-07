import { BeatBlock } from './BeatBlock'
import { StoryText } from './StoryText'

export function SlotsBeats() {
  return (
    <div id="como-funciona">
      <BeatBlock beat="slots-1">
        <StoryText
          beat="slots-1"
          step="01"
          title="Cadastre cada pessoa uma vez."
          support="Nome, contato e avatar para cada membro da família. Tudo configurado uma única vez."
          heading={{
            line1: 'Seis vagas. Uma conta.',
            line2: 'Zero planilha.',
          }}
        />
      </BeatBlock>

      <BeatBlock beat="slots-2">
        <StoryText
          beat="slots-2"
          step="02"
          title="Defina quanto cada um paga e o dia do vencimento."
          support="Valores individuais e a data certa do mês. Como o Vô Zé pagando R$ 5,00 sem complicação."
        />
      </BeatBlock>

      <BeatBlock beat="slots-3">
        <StoryText
          beat="slots-3"
          step="03"
          title="Pronto. Todo mês, as cobranças aparecem sozinhas."
          support="O painel gera automaticamente a lista do mês com o status de cada cobrança."
        />
      </BeatBlock>
    </div>
  )
}
