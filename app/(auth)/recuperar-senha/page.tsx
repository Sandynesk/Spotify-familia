import { AuthShell } from '@/components/public/AuthShell'
import { PasswordRecoveryForm } from '@/components/public/PasswordRecoveryForm'

export default function RecuperarSenhaPage() {
  return (
    <AuthShell>
      <PasswordRecoveryForm />
    </AuthShell>
  )
}
