import { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
}) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {hint && (
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  )
}
