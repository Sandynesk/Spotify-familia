import { AuthForm } from '@/components/public/AuthForm'
import { AuthShell } from '@/components/public/AuthShell'

export default function CadastroPage() {
  return (
    <AuthShell>
      <AuthForm mode="register" />
    </AuthShell>
  )
}
