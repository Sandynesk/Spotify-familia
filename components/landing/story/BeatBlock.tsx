import { cn } from '@/lib/utils'
import type { Beat } from './beats'

/**
 * Bloco de texto de UM beat da narrativa. Altura EXATA de 100svh — é isso que mantém
 * o mapeamento progresso → beat correto (ver beats.ts). Não alterar a altura.
 * Layout: no desktop o texto ocupa a coluna esquerda (o celular fica à direita);
 * no mobile o texto fica no terço inferior, sobre um degradê, e o celular no topo.
 */
export function BeatBlock({
  beat,
  className,
  children,
  ...rest
}: { beat: Beat } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-beat={beat}
      className={cn(
        'relative flex h-[100svh] items-end px-6 pb-[12svh] md:items-center md:pb-0',
        className,
      )}
      {...rest}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="max-w-[520px] md:max-w-[46%]">{children}</div>
      </div>
    </div>
  )
}
