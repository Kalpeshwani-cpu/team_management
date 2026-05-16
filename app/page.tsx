import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // If user is logged in, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Team Project Management System
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Streamline your team collaboration, manage projects, and track tasks efficiently
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="outline">Sign Up</Button>
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Project Management</h3>
            <p className="text-muted-foreground">Create and manage projects with full team collaboration capabilities</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Task Tracking</h3>
            <p className="text-muted-foreground">Track tasks, set priorities, and monitor progress in real-time</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Team Management</h3>
            <p className="text-muted-foreground">Organize teams by departments and assign qualified members</p>
          </div>
        </div>
      </div>
    </div>
  )
}
