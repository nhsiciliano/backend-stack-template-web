import { ArrowLeft, Code2 } from "lucide-react";
import { Link } from "wouter";

const repoUrl = "https://github.com/nhsiciliano/backend-stack-template";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--ops-ink)] px-5 text-[var(--ops-text)]">
      <section className="ops-card max-w-xl p-8 text-center sm:p-10" aria-labelledby="not-found-title">
        <p className="eyebrow">404</p>
        <h1 id="not-found-title" className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--ops-title)] sm:text-5xl">
          Esta ruta no está desplegada.
        </h1>
        <p className="mt-5 text-[var(--ops-text-soft)] leading-7">
          La landing sigue disponible en la raíz. También puedes abrir el repositorio para revisar el template backend.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link className="button-primary" href="/">
            <ArrowLeft size={17} aria-hidden="true" />
            Volver al inicio
          </Link>
          <a className="button-secondary" href={repoUrl} target="_blank" rel="noreferrer">
            <Code2 size={17} aria-hidden="true" />
            GitHub
          </a>
        </div>
      </section>
    </main>
  );
}
