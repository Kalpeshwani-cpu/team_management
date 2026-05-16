import { getCurrentUser } from '@/lib/auth'
import UserSettingsForm from '@/components/settings/user-form'

export default async function SettingsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">
          Manage your account settings and preferences
        </p>

        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          <UserSettingsForm user={currentUser} />
        </div>
      </div>
    </div>
  )
}
