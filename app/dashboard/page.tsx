'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/sharp-card'
import { Button } from '@/components/ui/sharp-button'
import { TrendingUp, Users, DollarSign, Activity, Flame, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState([])
  const [segments, setSegments] = useState([])
  const [segmentAnalytics, setSegmentAnalytics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`/api/campaigns?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setCampaigns(data)
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchSegments = async () => {
      try {
        const res = await fetch(`/api/segments?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setSegments(data)
        }
      } catch (error) {
        console.error('Failed to fetch segments:', error)
      }
    }

    const fetchSegmentAnalytics = async () => {
      try {
        const res = await fetch(`/api/segments/analytics?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setSegmentAnalytics(data)
        }
      } catch (error) {
        console.error('Failed to fetch segment analytics:', error)
      }
    }

    fetchCampaigns()
    fetchSegments()
    fetchSegmentAnalytics()
  }, [])

  const stats = [
    {
      icon: Activity,
      label: 'Active Campaigns',
      value: campaigns.filter((c: any) => c.status === 'active').length,
    },
    {
      icon: Users,
      label: 'Total Messages Sent',
      value: campaigns.reduce((acc: number, c: any) => acc + (c.metrics?.sent || 0), 0),
    },
    {
      icon: DollarSign,
      label: 'Campaign Revenue',
      value: `$${campaigns.reduce((acc: number, c: any) => acc + (c.metrics?.revenue || 0), 0).toFixed(2)}`,
    },
    {
      icon: TrendingUp,
      label: 'Total Conversions',
      value: campaigns.reduce((acc: number, c: any) => acc + (c.metrics?.conversions || 0), 0),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Social Media Trend Alert */}
      <Card className="border border-amber-500/25 bg-amber-500/5 dark:bg-amber-950/10">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3 items-start text-left">
            <div className="p-2 bg-amber-500/10 rounded-none border border-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                AI Social Trend Opportunity!
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </h4>
              <p className="text-sm text-muted-foreground">
                Mentions of <strong className="text-foreground">"Dark Roast Cold Brew"</strong> are spiking on Instagram (+180% in the last 24h). 
                We recommend targeting your <strong className="font-semibold text-foreground">Coffee Lovers</strong> segment with a special WhatsApp promo.
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/campaigns?prefill=trend&segmentName=Coffee%20Lovers&channel=whatsapp&title=Instagram%20Trend%3A%20Cold%20Brew%20Special&desc=Promote%20Dark%20Roast%20Cold%20Brew%20due%2520to%20viral%20Instagram%20mentions.&prompt=Make%2520it%2520very%2520exciting%252C%2520mention%2520discount%2520code%2520COLDBREW15%2520for%252015%2525%2520off.`}
          >
            <Button className="flex-shrink-0 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 border-amber-600">
              <span>Quick Launch Campaign</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-border">
            <CardContent className="p-6 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-primary opacity-50" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Metrics & Campaigns Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <div>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your latest marketing campaigns</CardDescription>
            </div>
            <Link href="/dashboard/campaigns">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground py-8">Loading campaigns...</p>
            ) : campaigns.length === 0 ? (
              <div className="py-8 text-center space-y-4">
                <p className="text-muted-foreground">No campaigns yet</p>
                <Link href="/dashboard/campaigns">
                  <Button>Create Your First Campaign</Button>
                </Link>
              </div>
            ) : (
              <div className="border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Campaign</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.slice(0, 5).map((campaign: any) => (
                      <tr
                        key={campaign._id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{campaign.title}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs uppercase">{campaign.type}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium border ${
                              campaign.status === 'active'
                                ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800/30'
                                : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-zinc-800/30 dark:text-zinc-400 dark:border-zinc-700/30'
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground font-mono">
                          {campaign.metrics?.clicked || 0} clicks
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Segment Performance Analytics */}
        <Card className="border border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <div>
              <CardTitle>Segment Performance Analytics</CardTitle>
              <CardDescription>Metrics aggregated by target audience segment</CardDescription>
            </div>
            <Link href="/dashboard/customers">
              <Button variant="outline" size="sm">
                Manage Segments
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground py-8">Loading segment metrics...</p>
            ) : segmentAnalytics.length === 0 ? (
              <div className="py-8 text-center space-y-4">
                <p className="text-muted-foreground">No segments tracked yet</p>
                <Link href="/dashboard/customers">
                  <Button variant="outline">View Shoppers</Button>
                </Link>
              </div>
            ) : (
              <div className="border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Segment</th>
                      <th className="px-4 py-3 text-center font-medium">Campaigns</th>
                      <th className="px-4 py-3 text-center font-medium">Sent</th>
                      <th className="px-4 py-3 text-center font-medium">CTR</th>
                      <th className="px-4 py-3 text-right font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentAnalytics.map((seg: any) => (
                      <tr
                        key={seg.segmentId}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-foreground text-left">{seg.name}</td>
                        <td className="px-4 py-3 text-center font-mono">{seg.campaignsCount}</td>
                        <td className="px-4 py-3 text-center font-mono">{seg.totalSent}</td>
                        <td className="px-4 py-3 text-center font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{seg.ctr}%</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-green-600 dark:text-green-400">
                          ${seg.totalRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
