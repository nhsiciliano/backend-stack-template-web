# Backend Stack Template Web

Landing web para presentar `backend-stack-template` como un servicio/producto: un repositorio base para crear, lanzar y escalar backends SaaS de manera rápida, consistente y production-ready.

La web está construida con React + Vite y comunica el valor del template backend: ahorrar setup repetitivo, partir de una arquitectura probada y acelerar la creación de APIs con infraestructura seria desde el primer commit.

## Relación con `backend-stack-template`

Esta app no contiene el backend. Su objetivo es vender, explicar y dirigir tráfico hacia el repositorio principal:

https://github.com/nhsiciliano/backend-stack-template

El repositorio ofrecido incluye una base para construir backends con:

- Fastify 5 + TypeScript
- PostgreSQL + Prisma
- Redis + BullMQ
- Better Auth
- OpenAPI / Swagger UI
- API y worker como procesos separados
- Docker Compose para desarrollo local
- Guías de DX, seguridad, CI y deployment

## Objetivo del sitio

La landing está pensada para founders, agencias y developers que necesitan validar o lanzar productos SaaS sin reconstruir siempre la misma infraestructura backend.

El mensaje central es:

> Empieza por tu dominio de negocio, no por el plumbing.

## Stack de esta web

- React
- Vite
- TypeScript
- Tailwind CSS
- Wouter
- Lucide React

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Levantar el servidor de desarrollo:

```bash
npm run dev
```

Generar build de producción:

```bash
npm run build
```

Previsualizar el build:

```bash
npm run preview
```

## Estructura principal

```text
src/
  App.tsx
  main.tsx
  index.css
  components/
    ErrorBoundary.tsx
  pages/
    Home.tsx
    NotFound.tsx
```

## Dirección UX/UI

La interfaz usa una estética de operations console: oscura, sobria y técnica, con acentos cian/verde para acciones y señales de sistema. La intención es conectar visualmente con infraestructura, despliegues, workers, bases de datos y APIs sin caer en una estética hacker genérica.

Principios aplicados:

- Jerarquía clara para entender el valor en pocos segundos.
- CTA directos hacia GitHub y documentación del template.
- Quick start visible para mostrar baja fricción.
- Arquitectura resumida en una línea de despliegue.
- Accesibilidad básica: foco visible, etiquetas ARIA y soporte para `prefers-reduced-motion`.

## Mantenimiento del contenido

Cuando el repositorio `backend-stack-template` cambie, revisar especialmente:

- Comandos de quick start en `src/pages/Home.tsx`.
- Features del stack.
- Enlaces a documentación en GitHub.
- Metadata SEO en `index.html`.

## Propósito comercial

Esta web funciona como la capa de presentación del servicio. El valor ofrecido no es solo el código del template, sino la capacidad de empezar nuevos backends con una base escalable, documentada y alineada con prácticas de producción.
