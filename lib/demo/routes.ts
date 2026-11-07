export const DEMO_PROTECTED_ROUTES = [
  '/dashboard',
  '/membros',
  '/cobrar',
  '/visao-geral',
  '/insights',
  '/agenda',
  '/historico',
  '/retrospectiva',
  '/configuracoes',
  '/mais',
  '/boas-vindas',
  '/kit',
] as const

export function isDemoProtectedRoute(pathname: string) {
  return DEMO_PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
}
