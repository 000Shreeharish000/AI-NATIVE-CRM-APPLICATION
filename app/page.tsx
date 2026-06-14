import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/sharp-button'
import { ArrowRight, Zap, BarChart3, Brain } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">XENO CRM</h1>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-sm hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="#docs" className="text-sm hover:text-primary transition-colors">
                Docs
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Your AI Marketing <span className="text-primary">Xeno CRM</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-md">
              Create, optimize, and manage marketing campaigns with AI-powered insights. Boost your ROI instantly.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/auth/register">
                <Button size="lg" className="flex items-center space-x-2">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-muted border border-border p-8 space-y-6">
            <div className="space-y-4">
              <div className="h-8 bg-border/50" />
              <div className="h-4 bg-border/50 w-3/4" />
              <div className="h-4 bg-border/50 w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-border/50" />
              <div className="h-20 bg-border/50" />
              <div className="h-20 bg-border/50" />
              <div className="h-20 bg-border/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted border-t border-border border-b py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-16">Core Capabilities</h3>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Trend Listening',
                description: 'Scans social channels (Instagram, TikTok, Pinterest) in real-time. Automatically pre-fills campaign settings and drafts channel-optimized retail copy.',
              },
              {
                icon: BarChart3,
                title: 'Omnichannel Callback Loop',
                description: 'Integrates WhatsApp, SMS, Email, and RCS messaging pipelines with asynchronous callback hooks tracking delivered, read, clicked, and conversion events.',
              },
              {
                icon: Zap,
                title: 'AI Ingestion & Segmentation',
                description: 'Segments customer bases and purchase histories dynamically. Supports AI natural language queries to resolve customer databases at scale.',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-card border border-border p-6 space-y-4">
                <feature.icon className="w-8 h-8 text-primary" />
                <h4 className="text-xl font-semibold">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-border">
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { label: 'Shoppers Activated', value: '150+' },
            { label: 'Target Segments', value: '6' },
            { label: 'Omnichannel Routing', value: '4' },
            { label: 'Ingestion Performance', value: '10K/s' },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground border-t border-primary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-4xl font-bold">Deploy Xeno CRM for D2C Retail</h3>
          <p className="text-lg opacity-90">
            Connect your customer database, execute AI-native campaigns across WhatsApp, SMS, and Email, and track purchase attribution live.
          </p>
          <Link href="/auth/register">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:opacity-90"
            >
              Access Console
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8 mb-8">
          {[
            {
              title: 'Product',
              links: ['Features', 'Pricing', 'Security'],
            },
            {
              title: 'Company',
              links: ['About', 'Blog', 'Careers'],
            },
            {
              title: 'Resources',
              links: ['Docs', 'API', 'Support'],
            },
            {
              title: 'Legal',
              links: ['Privacy', 'Terms', 'Contact'],
            },
          ].map((col, i) => (
            <div key={i} className="space-y-4">
              <h4 className="font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 Xeno CRM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
