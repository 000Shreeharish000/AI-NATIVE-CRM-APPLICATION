'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/sharp-card'
import { Button } from '@/components/ui/sharp-button'
import { Input } from '@/components/ui/sharp-input'
import { Bell, Lock, Users } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setName(parsed.name)
      setEmail(parsed.email)
    }
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updated = { ...user, name, email }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Profile Settings</span>
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={saving}
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>Security</span>
          </CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button variant="outline">Change Password</Button>
          <p className="text-sm text-muted-foreground mt-4">
            Last password change: Never
          </p>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>Control how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {[
            { label: 'Email Notifications', description: 'Receive updates via email' },
            { label: 'Campaign Alerts', description: 'Get notified about campaign performance' },
            { label: 'AI Recommendations', description: 'Receive AI suggestions and insights' },
          ].map((notification, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium text-sm">{notification.label}</p>
                <p className="text-xs text-muted-foreground">{notification.description}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 cursor-pointer"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Plan & Billing */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Plan & Billing</CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <p className="font-medium">Current Plan</p>
            <p className="text-lg font-bold">Free Plan</p>
            <p className="text-sm text-muted-foreground">
              You&apos;re using the free plan. Upgrade to unlock more features.
            </p>
          </div>
          <Button>Upgrade to Pro</Button>
        </CardContent>
      </Card>

      {/* Developer Sandbox Tools */}
      <Card className="border border-border border-yellow-500/30">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-yellow-600 dark:text-yellow-400">Developer Sandbox Tools</CardTitle>
          <CardDescription>Actions for evaluator testing and evaluation</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <p className="font-medium text-sm">Seed Database</p>
            <p className="text-xs text-muted-foreground">
              Clears existing segments/customers/orders and seeds fresh mock D2C data (VIPs, coffee-lovers, historical logs, etc.) so you can test segmentation and campaigns immediately.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-yellow-600 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
            onClick={async () => {
              const confirmSeed = confirm("Are you sure you want to seed? This will reset your dashboard data.")
              if (!confirmSeed) return
              const user = JSON.parse(localStorage.getItem('user') || '{}')
              if (!user.id) return alert("Please log in first")
              try {
                const res = await fetch('/api/seed', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user.id })
                })
                const data = await res.json()
                if (res.ok) {
                  alert(data.message || "Seeding complete!")
                } else {
                  alert("Error: " + data.error)
                }
              } catch (e) {
                console.error(e)
                alert("Failed to connect to seed endpoint")
              }
            }}
          >
            Seed Sandbox Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
