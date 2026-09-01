import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TechCard, type TechCardProps } from '@/components/ui/TechCard'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { Button } from '@/components/ui/button'
import { Cpu, Zap, Database, Globe, Lock, Server, ShieldCheck, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/app/router/routes'

export const TechnologyPage: React.FC = () => {
  const navigate = useNavigate()

  const techStack: TechCardProps[] = [
    {
      name: 'React 19 & TypeScript (Strict Mode)',
      category: 'Frontend Core',
      badge: 'Production Grade',
      description: 'Strict-mode type-safe frontend architecture with zero-latency state management via Zustand and TanStack Query v5.',
      whyChosen: 'Delivers 0ms instant UI rendering, modular code splitting, and 100% strict type safety across all API schema boundaries.',
      architectureRole: 'Client presentation, client-side encryption execution, & reactive real-time cache patching.',
      icon: Cpu,
    },
    {
      name: 'FastAPI & Pydantic v2',
      category: 'Backend Microservices',
      badge: 'Asynchronous Python',
      description: 'Asynchronous Python microservices handling REST API routing, rate limiting, and JWT authentication with sub-50ms latency.',
      whyChosen: 'Blazing fast async I/O throughput with automatic Pydantic v2 data serialization and OpenAPI documentation.',
      architectureRole: 'REST API gateway, JWT session authority, & microservice orchestration.',
      icon: Zap,
    },
    {
      name: 'Celery & Redis Distributed Queue',
      category: 'Background Workers',
      badge: 'Distributed',
      description: 'Asynchronous task queue dispatching background AI sentiment analysis, streak calculations, and notification jobs.',
      whyChosen: 'Decouples intensive LLM processing loops from HTTP request-response handlers, preventing web server blockages.',
      architectureRole: 'Asynchronous job queue & Pub/Sub broker channel.',
      icon: Database,
    },
    {
      name: 'WebSocket Realtime Bus',
      category: 'Real-Time Layer',
      badge: 'Persistent Sockets',
      description: 'Persistent WebSocket event channels pushing dynamic updates directly to client browsers.',
      whyChosen: 'Eliminates resource-heavy polling loops and updates TanStack Query cache in real-time.',
      architectureRole: 'Server-sent event broadcasting channel.',
      icon: Globe,
    },
    {
      name: 'AES-256 Fernet Cryptography Engine',
      category: 'Security Engine',
      badge: 'Zero-Knowledge',
      description: 'Symmetric Fernet key encryption processing journal payload text prior to database persistence.',
      whyChosen: 'Ensures absolute user data sovereignty where raw text is unreadable even in database storage dumps.',
      architectureRole: 'Client & payload data encryption authority.',
      icon: Lock,
    },
    {
      name: 'PostgreSQL & SQLAlchemy 2.0',
      category: 'Database Authority',
      badge: 'ACID Compliant',
      description: 'Relational database persistence with SQLAlchemy 2.0 async ORM and Alembic schema migrations.',
      whyChosen: 'ACID transactional reliability, row-level isolation, and index-optimized relational mapping.',
      architectureRole: 'Persistent data store & relational schema engine.',
      icon: Server,
    },
  ]

  return (
    <>
      <PageHero
        badgeText="Technical Stack Architecture"
        title="Engineered for Extreme Speed,"
        highlightedTitle="Security & Resilience"
        subtitle="Explore the modern microservice architecture, client-side cryptography, and real-time WebSockets powering Kintsugi."
        breadcrumbItems={[{ label: 'Technology' }]}
        icon={Cpu}
      />

      <PageContainer className="space-y-12 max-w-6xl mx-auto text-left">
        {/* Tech Stack Cards */}
        <section className="space-y-8">
          <SectionTitle
            category="Core Technology Stack"
            title="Modern Production Infrastructure"
            subtitle="Built using industry-standard tools, strict type boundaries, and async microservices."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech) => (
              <TechCard key={tech.name} {...tech} />
            ))}
          </div>
        </section>

        {/* Real-time Code Integration Showcase */}
        <section className="space-y-6">
          <SectionTitle
            category="Real-Time Integration"
            title="Surgical Cache Patching Protocol"
            subtitle="WebSocket event payloads update TanStack Query cache without network refetches or page reloads."
          />
          <CodeBlock
            language="typescript"
            code={`// Real-Time Socket Cache Patching Protocol
socket.subscribe('mood.entry_updated', (data: MoodUpdatePayload) => {
  queryClient.setQueryData(['mood', 'history', 'me'], (oldData: MoodEntry[] | undefined) => {
    if (!oldData) return [data.entry]
    return oldData.map((entry) => 
      entry.id === data.entry.id ? { ...entry, ...data.entry, ai_message: data.ai_message } : entry
    )
  })
})`}
          />
        </section>

        {/* CTA Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <Button
            onClick={() => navigate(ROUTES.PUBLIC.SAFETY)}
            variant="outline"
            className="w-full sm:w-auto text-xs gap-2 border-border bg-background text-foreground hover:bg-muted"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Read Safety Architecture</span>
          </Button>

          <Button
            onClick={() => navigate(ROUTES.AUTH.REGISTER)}
            className="w-full sm:w-auto text-xs gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl cursor-pointer"
          >
            <span>Build Your Safe Space</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </PageContainer>
    </>
  )
}

export default TechnologyPage
