'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/sharp-card'
import { Input } from '@/components/ui/sharp-input'
import { Button } from '@/components/ui/sharp-button'
import { TrendingUp, Flame, Sparkles, Search, ArrowRight, MessageSquare, MessageCircle, Activity, Share2 } from 'lucide-react'
import Link from 'next/link'

export default function TrendsPage() {
  const [trends, setTrends] = useState<any[]>([])
  const [nicheQuery, setNicheQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    fetchTrends()
  }, [])

  const fetchTrends = async (niche = '') => {
    if (niche) {
      setScanning(true)
    } else {
      setLoading(true)
    }
    
    try {
      const url = niche ? `/api/trends?niche=${encodeURIComponent(niche)}` : '/api/trends'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTrends(data)
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error)
    } finally {
      setLoading(false)
      setScanning(false)
    }
  }

  const handleNicheScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nicheQuery.trim()) return
    fetchTrends(nicheQuery)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <MessageCircle className="w-4 h-4 text-pink-500" />
      case 'tiktok':
        return <Activity className="w-4 h-4 text-cyan-400" />
      case 'pinterest':
        return <Share2 className="w-4 h-4 text-red-500" />
      default:
        return <TrendingUp className="w-4 h-4 text-primary" />
    }
  }

  const getPlatformClass = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'border-pink-500/20 bg-pink-500/5 text-pink-600 dark:text-pink-400'
      case 'tiktok':
        return 'border-cyan-500/20 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400'
      case 'pinterest':
        return 'border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400'
      default:
        return 'border-muted bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            AI Social Trend Scanner
          </h2>
          <p className="text-muted-foreground">
            Scans Instagram, TikTok, and Pinterest in real-time. Turn hot viral trends into profit instantly.
          </p>
        </div>
        
        {/* Niche Scanner Form */}
        <form onSubmit={handleNicheScan} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter niche (e.g. sneakers, skincare)..."
              value={nicheQuery}
              onChange={(e) => setNicheQuery(e.target.value)}
              className="pl-9 text-xs"
              disabled={scanning}
            />
          </div>
          <Button type="submit" disabled={scanning} className="text-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {scanning ? 'Scanning...' : 'Scan Niche'}
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground animate-pulse">AI is scanning Instagram, TikTok, and Pinterest API feeds... Please wait for 10 seconds.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {trends.map((trend, index) => {
            const sentimentColor = trend.sentimentScore > 85 ? 'bg-green-500' : 'bg-yellow-500'
            
            return (
              <Card key={trend.id || index} className="border border-border flex flex-col justify-between hover:border-primary/30 transition-colors">
                <CardHeader className="border-b border-border pb-4 flex flex-row items-start justify-between gap-2">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 border ${getPlatformClass(trend.platform)}`}>
                        {getPlatformIcon(trend.platform)}
                        {trend.platform}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                        {trend.category}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold mt-1.5 flex items-center gap-1.5">
                      {trend.trendTopic}
                      <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-green-500 block font-mono">{trend.mentionsChange}</span>
                    <span className="text-[9px] text-muted-foreground uppercase">Social Spike</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {trend.insight}
                    </p>

                    {/* Sentiment meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Sentiment Index</span>
                        <span className="font-mono font-bold text-foreground">{trend.sentimentScore}% Positive</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted">
                        <div className={`h-1.5 ${sentimentColor}`} style={{ width: `${trend.sentimentScore}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation and Prefill CTA */}
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="bg-muted/50 border border-border p-3 space-y-1.5">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Recommended Campaign Playbook</div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Target Segment:</span>
                        <span className="font-bold text-foreground">{trend.suggestedSegment}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Delivery Channel:</span>
                        <span className="font-bold text-foreground uppercase">{trend.suggestedChannel}</span>
                      </div>
                    </div>

                    <Link href={trend.prefillUrl}>
                      <Button className="w-full flex items-center justify-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-500 border-amber-600 mt-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Draft Trend Campaign</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
