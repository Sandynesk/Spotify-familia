'use server'

import { getDashboardData } from '@/lib/actions/pagamentos'
import { proximosVencimentos } from '@/lib/domain/agenda'
import { saldoDoPlano } from '@/lib/domain/insights'
import { getCurrentMonthISO } from '@/lib/utils/date'

function datePartsInBahia(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bahia',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const value = (type: 'year' | 'month' | 'day') => parts.find((part) => part.type === type)?.value ?? '01'
  return `${value('year')}-${value('month')}-${value('day')}`
}

function greetingInBahia(date: Date) {
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bahia',
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(date))
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Collects the dashboard view model from the existing payment data and pure domain helpers. */
export async function getHojeData() {
  const data = await getDashboardData()
  if (!data) return null

  const now = new Date()
  const todayISO = datePartsInBahia(now)
  const today = new Date(`${todayISO}T12:00:00`)
  const monthISO = getCurrentMonthISO()
  const monthTitle = new Date(`${monthISO}T12:00:00`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
  const agenda = proximosVencimentos(data.membros, data.pagamentosMes, today, 45)
    .filter((item) => item.status !== 'pago')
    .slice(0, 3)
  const balance = data.custo.valorPlano === null
    ? null
    : saldoDoPlano({
        valorPlano: data.custo.valorPlano,
        previstoMes: data.summary.totalAReceber,
        arrecadadoMes: data.summary.totalPago,
      })

  return {
    ...data,
    agenda,
    balance,
    monthISO,
    monthTitle,
    todayISO,
    greeting: greetingInBahia(now),
  }
}
