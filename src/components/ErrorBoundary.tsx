import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--ops-ink)] px-5 text-[var(--ops-text)]">
          <section className="ops-card max-w-lg p-8 text-center sm:p-10" role="alert" aria-labelledby="error-title">
            <span className="icon-shell mx-auto">
              <AlertTriangle size={20} aria-hidden="true" />
            </span>
            <h1 id="error-title" className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--ops-title)]">
              Algo falló al cargar la página.
            </h1>
            <p className="mt-4 text-[var(--ops-text-soft)] leading-7">
              Recarga la página. Si el problema persiste, revisa la consola del navegador durante desarrollo.
            </p>
            <button className="button-primary mt-8" onClick={() => window.location.reload()} type="button">
              <RotateCcw size={17} aria-hidden="true" />
              Recargar
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
