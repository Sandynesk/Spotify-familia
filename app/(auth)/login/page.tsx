import { AuthForm } from '@/components/public/AuthForm'
import { AuthShell } from '@/components/public/AuthShell'

interface LoginPageProps {
  searchParams: Promise<{ tab?: string | string[]; error?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const tab = Array.isArray(params.tab) ? params.tab[0] : params.tab
  const callbackError = Array.isArray(params.error) ? params.error[0] : params.error

  return (
    <AuthShell>
      <AuthForm
        mode={tab === 'register' ? 'register' : 'login'}
        initialError={callbackError === 'auth_callback_error'
          ? 'Não foi possível confirmar seu acesso. Tente entrar novamente ou solicite um novo link.'
          : undefined}
      />
    </AuthShell>
  )
}
