import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Code2,
  Clipboard,
  Database,
  ExternalLink,
  GitBranch,
  KeyRound,
  Layers3,
  Play,
  Radar,
  Server,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const repoUrl = "https://github.com/nhsiciliano/backend-stack-template";

const quickStart = [
  "git clone https://github.com/nhsiciliano/backend-stack-template.git",
  "cd backend-stack-template",
  "cp .env.example .env",
  "npm run setup:local",
  "npm run dev",
  "npm run dev:worker",
];

const stack = [
  {
    icon: Server,
    title: "API Fastify 5",
    copy: "Base HTTP rápida, tipada y lista para crecer sin reescribir el core.",
  },
  {
    icon: KeyRound,
    title: "Better Auth",
    copy: "Email/password, OAuth y verificación preparados para productos SaaS.",
  },
  {
    icon: Database,
    title: "PostgreSQL + Prisma",
    copy: "Modelo de datos, migraciones y capa de persistencia desde el primer día.",
  },
  {
    icon: Workflow,
    title: "Redis + BullMQ",
    copy: "Jobs, colas y workers separados para escalar procesos pesados.",
  },
  {
    icon: ShieldCheck,
    title: "Checklist de producción",
    copy: "Seguridad, variables, CI, tests y deploy documentados para evitar sorpresas.",
  },
  {
    icon: Radar,
    title: "OpenAPI Docs",
    copy: "Documentación de API navegable para integrar clientes y equipos rápido.",
  },
];

const proofPoints = [
  "API y Worker desplegables como procesos independientes",
  "Generador de módulos para mantener una arquitectura consistente",
  "Guías para local DX, seguridad SaaS y Railway deployment",
  "Vitest, ESLint, Prettier y GitHub Actions incluidos",
];

const buildFlow = ["Client", "Fastify API", "PostgreSQL", "Redis", "Worker"];

export default function Home() {
  const [copied, setCopied] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function copyToClipboard(command: string, id: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(id);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--ops-ink)] text-[var(--ops-text)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(82,211,255,0.16),transparent_34rem),radial-gradient(circle_at_80%_10%,rgba(83,255,176,0.1),transparent_28rem)]" />
      <div className="pointer-events-none fixed inset-0 grid-noise opacity-[0.22]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between gap-4 border-b border-[var(--ops-border-soft)] pb-5" aria-label="Principal">
          <a href="/" className="flex items-center gap-3 focus-ring rounded-full">
            <span className="flex size-9 items-center justify-center rounded-full border border-[var(--ops-border)] bg-[var(--ops-panel)] text-[var(--ops-accent)]">
              <GitBranch size={17} aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-[-0.01em]">backend-stack-template</span>
          </a>

          <div className="flex items-center gap-2">
            <a className="nav-link hidden sm:inline-flex" href={`${repoUrl}/blob/main/README.md`} target="_blank" rel="noreferrer">
              Docs
            </a>
            <a className="nav-link" href={repoUrl} target="_blank" rel="noreferrer">
              <Code2 size={16} aria-hidden="true" />
              GitHub
            </a>
          </div>
        </nav>

        <section className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
          <div>
            <p className="eyebrow mb-5">Production-ready backend starter</p>
            <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-[-0.07em] text-[var(--ops-title)] sm:text-6xl lg:text-7xl">
              Lanza backends serios sin reconstruir la infraestructura base.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--ops-text-soft)]">
              Un template para crear APIs SaaS con Fastify, TypeScript, PostgreSQL, Redis, BullMQ, Better Auth y OpenAPI. Menos setup repetido, más producto validado.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a className="button-primary" href={repoUrl} target="_blank" rel="noreferrer">
                <Code2 size={18} aria-hidden="true" />
                Usar template
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button-secondary" href={`${repoUrl}/blob/main/docs/dx.md`} target="_blank" rel="noreferrer">
                Ver DX guide
                <ExternalLink size={17} aria-hidden="true" />
              </a>
            </div>

            <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <div className="metric-card">
                <dt>Stack</dt>
                <dd>6 capas</dd>
              </div>
              <div className="metric-card">
                <dt>Setup</dt>
                <dd>local-first</dd>
              </div>
              <div className="metric-card">
                <dt>Escala</dt>
                <dd>API + worker</dd>
              </div>
            </dl>
          </div>

          <div className="ops-card hero-console">
            <div className="console-topbar">
              <span />
              <span />
              <span />
              <p>deploy topology</p>
            </div>
            <div className="flow-line" aria-label="Arquitectura: Client, Fastify API, PostgreSQL, Redis y Worker">
              {buildFlow.map((step, index) => (
                <div className="flow-node" key={step}>
                  <span className="flow-index">0{index + 1}</span>
                  <strong>{step}</strong>
                  {index < buildFlow.length - 1 ? <i aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="signal-block">
                <span>ready signal</span>
                <strong>npm run check</strong>
              </div>
              <div className="signal-block">
                <span>runtime split</span>
                <strong>api / worker</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section-grid border-y border-[var(--ops-border-soft)] py-12" aria-labelledby="quick-start-title">
          <div>
            <p className="eyebrow">Quick start</p>
            <h2 id="quick-start-title" className="section-title">De repo a backend corriendo en minutos.</h2>
            <p className="section-copy">Los comandos están pensados para validar el stack completo: API, base de datos local y worker.</p>
          </div>

          <div className="ops-card p-2">
            {quickStart.map((command, index) => {
              const id = `command-${index}`;
              const isCopied = copied === id;

              return (
                <div className="command-row" key={command}>
                  <code><span>$</span> {command}</code>
                  <button
                    aria-label={`Copiar comando: ${command}`}
                    className="copy-button"
                    onClick={() => copyToClipboard(command, id)}
                    type="button"
                  >
                    {isCopied ? <Check size={16} aria-hidden="true" /> : <Clipboard size={16} aria-hidden="true" />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-16 sm:py-20" aria-labelledby="stack-title">
          <div className="mb-9 max-w-3xl">
            <p className="eyebrow">Stack operativo</p>
            <h2 id="stack-title" className="section-title">Lo que normalmente te toma días, ya viene conectado.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stack.map(item => {
              const Icon = item.icon;

              return (
                <article className="feature-card" key={item.title}>
                  <span className="icon-shell"><Icon size={20} aria-hidden="true" /></span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section-grid py-10 sm:py-16" aria-labelledby="fit-title">
          <div className="ops-card accent-card">
            <p className="eyebrow">Ideal para</p>
            <h2 id="fit-title" className="section-title">Founders, agencias y devs que necesitan backend base confiable.</h2>
            <p className="section-copy">No intenta ser un framework nuevo. Es una línea de salida organizada para construir producto, integrar clientes y desplegar con criterio.</p>
          </div>

          <div className="ops-card checklist-card">
            <div className="mb-5 flex items-center gap-3">
              <span className="icon-shell"><Layers3 size={20} aria-hidden="true" /></span>
              <h3>Incluye decisiones listas</h3>
            </div>
            <ul>
              {proofPoints.map(point => (
                <li key={point}>
                  <Check size={16} aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="cta-card my-16 sm:my-20" aria-labelledby="cta-title">
          <div>
            <p className="eyebrow">Siguiente paso</p>
            <h2 id="cta-title">Clona el template y empieza por tu dominio, no por el plumbing.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a className="button-primary" href={repoUrl} target="_blank" rel="noreferrer">
              <Play size={17} aria-hidden="true" />
              Abrir repositorio
            </a>
            <a className="button-secondary" href={`${repoUrl}/blob/main/docs/security-saas.md`} target="_blank" rel="noreferrer">
              Seguridad SaaS
            </a>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-[var(--ops-border-soft)] py-8 text-sm text-[var(--ops-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>Backend Stack Template. Fastify + TypeScript para backends que tienen que durar.</p>
          <a className="footer-link" href="https://github.com/nhsiciliano" target="_blank" rel="noreferrer">Creado por nhsiciliano</a>
        </footer>
      </div>
    </main>
  );
}
