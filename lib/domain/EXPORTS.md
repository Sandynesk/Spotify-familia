# Assinaturas públicas — motor de domínio

## Funções puras

```ts
detectarTipoChave(chave: string): TipoChavePix
crc16CcittFalse(texto: string): string
gerarPixCopiaECola(input: GerarPixCopiaEColaInput): string
gerarQrSvg(texto: string, opcoes?: { margem?: number; cor?: string; fundo?: string }): Promise<string>
normalizarTelefoneBR(tel: string | null | undefined): string | null
linkWhatsApp(telefone: string | null, texto: string): string
gerarMensagemCobranca(input: MensagemCobrancaInput): string
gerarMensagemGrupo(input: MensagemGrupoInput): string
gerarMensagemAgradecimento(input: { nome: string; mes: string; valor: number }): string
resumoMembroParaGrupo(membro: MembroDominio, meses: string[], total: number): LinhaMensagemGrupo
diasDeAtraso(pagamento: PagamentoDominio, membro: Pick<MembroDominio, 'dia_vencimento'>): number | null
calcularPontualidade(membro: MembroDominio, pagamentos: PagamentoDominio[], hoje?: Date): ResumoPontualidade
serieMensal(pagamentos: PagamentoDominio[], meses: string[]): ItemSerieMensal[]
saldoDoPlano(input: { valorPlano: number; previstoMes: number; arrecadadoMes: number }): SaldoPlano
previsaoProximosMeses(membros: MembroDominio[], n: number, hoje?: Date): PrevisaoMensal[]
ranking(membros: MembroDominio[], pagamentos: PagamentoDominio[], hoje?: Date): ItemRanking[]
taxaDeRecebimento(pagamentos: PagamentoDominio[]): number
tempoMedioParaReceber(membros: MembroDominio[], pagamentos: PagamentoDominio[]): number | null
resumoDoAno(membros: MembroDominio[], pagamentos: PagamentoDominio[], ano: number): ResumoAno
calcularRetrospectiva(input: { ano: number; membros: MembroDominio[]; pagamentos: PagamentoDominio[]; valorPlano: number }): Retrospectiva
proximosVencimentos(membros: MembroDominio[], pagamentos: PagamentoDominio[], hoje: Date, dias: number): ProximoVencimento[]
gerarIcs(input: { membros: MembroDominio[]; ate: string | Date; nomeCalendario: string }): string
gerarCsv<T extends object>(linhas: T[], colunas: ColunaCsv<T>[]): string
dividirPlano(valorPlano: number, pessoas: number | MembroDominio[], opcoes?: { donoPaga?: boolean; arredondar?: 'centavo' | 'cima10' }): DivisaoPlano
reajuste(membros: MembroDominio[], novoValorPlano: number, estrategia: 'igual' | 'proporcional'): ItemReajuste[]
linhaDoTempo(membros: MembroDominio[], pagamentos: PagamentoDominio[], limite: number): EventoAtividade[]
```

## Server actions

```ts
getInsightsData(ano?: number): Promise<{ error: string } | { ano: number; membros: Membro[]; pagamentos: Pagamento[]; serie: ItemSerieMensal[]; resumo: ResumoAno; saldo: SaldoPlano }>
getRetrospectivaData(ano: number): Promise<{ error: string } | Retrospectiva>
getAgendaData(): Promise<{ error: string } | { vencimentos: ProximoVencimento[]; calendario: string }>
getAtividadeData(limite?: number): Promise<{ error: string } | EventoAtividade[]>
getPontualidadeMembro(membroId: string): Promise<{ error: string } | ResumoPontualidade>
getCobrancaData(): Promise<{ error: string } | { cobrancas: ItemCobranca[] }>
marcarVariosPagos(pagamentoIds: string[]): Promise<{ error: string } | { success: true; atualizados: number }>
desfazerVarios(pagamentoIds: string[]): Promise<{ error: string } | { success: true; atualizados: number }>
marcarPagoEm(pagamentoId: string, dataISO: string): Promise<{ error: string } | { success: true }>
salvarObservacao(pagamentoId: string, texto: string): Promise<{ error: string } | { success: true }>
reajustarValores(itens: { membroId: string; novoValor: number }[], opcoes: { aplicarDesde: 'mesAtual' | 'proximoMes' }): Promise<{ error: string } | { success: true; atualizados: number; aplicadoDesde: string }>
exportarCsv(tipo: 'pagamentos' | 'membros', ano?: number): Promise<{ error: string } | { nome: string; conteudo: string }>
```

## Tipos públicos

`MembroDominio`, `PagamentoDominio`, `ColunaCsv<T>`, `Selo`, `ResumoPontualidade`, `DivisaoPlano`, `ItemReajuste`, `EventoAtividade`, `TipoChavePix`, `TomMensagem`, `ProximoVencimento`, `ItemSerieMensal`, `SaldoPlano`, `PrevisaoMensal`, `ItemRanking`, `ResumoAno`, `Retrospectiva`, `RetrospectivaPagamentoRapido`, `RetrospectivaMesDificil`, `CardRetrospectiva`, `GerarPixCopiaEColaInput`, `MensagemCobrancaInput`, `LinhaMensagemGrupo`, `MensagemGrupoInput` e `ItemCobranca`.
