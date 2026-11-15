"use client";

import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Boxes,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const portfolio = {
  repositories: 41,
  ci: {
    runs: 135,
    workflows: 4,
    jobs: 7,
    successRate: 81.48,
    failureRate: 18.52,
  },
  projects: [
    {
      name: "Tozato AI-Core",
      description: "Assistente de IA e automação de desenvolvimento",
      href: "https://github.com/Rafael-TOZATO/tozato-ai-core",
    },
    {
      name: "H-Folio",
      description: "Portfólio de projetos",
      href: "https://github.com/Rafael-TOZATO/h-folio",
    },
  ],
};

const unavailableMetrics = [
  { label: "Pull requests do portfólio", value: "N/D" },
  { label: "Issues resolvidas", value: "N/D" },
  { label: "Cobertura de testes", value: "N/D" },
  { label: "Vulnerabilidades de segurança", value: "N/D" },
  { label: "Builds bem-sucedidos", value: "N/D" },
  { label: "Deploys bem-sucedidos", value: "N/D" },
  { label: "Dashboards Power BI", value: "N/D" },
];

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "blue",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
  accent?: "blue" | "violet" | "cyan" | "green";
}) {
  const accents = {
    blue: "bg-blue-500/10 text-blue-300 ring-blue-400/20",
    violet: "bg-violet-500/10 text-violet-300 ring-violet-400/20",
    cyan: "bg-cyan-500/10 text-cyan-300 ring-cyan-400/20",
    green: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  };

  return (
    <article className="group rounded-2xl border border-white/[0.08] bg-[#101a2b] p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-[#132139] hover:shadow-xl hover:shadow-blue-950/30">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <span className={`rounded-xl p-2 ring-1 ${accents[accent]}`}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-white tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

export default function MetricsDashboard() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section
      aria-labelledby="developer-analytics-title"
      className="mx-auto mt-12 w-full max-w-6xl rounded-[28px] border border-slate-800 bg-[#080f1d] p-4 text-slate-100 shadow-2xl shadow-slate-950/20 sm:p-6 lg:p-8"
    >
      <div className="flex flex-col justify-between gap-5 border-b border-white/[0.08] pb-6 md:flex-row md:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-3 py-1 text-xs font-medium text-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Developer analytics
          </div>
          <h2 id="developer-analytics-title" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Visão geral de desenvolvimento
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Indicadores do perfil GitHub e da automação CI/CD do repositório Tozato AI-Core.
          </p>
        </div>
        <a
          href="https://github.com/Rafael-TOZATO"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-400/40 hover:bg-blue-400/10 hover:text-white"
        >
          Perfil GitHub <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Repositórios no perfil" value="41" detail="Portfólio GitHub" icon={Boxes} accent="blue" />
        <MetricCard label="Execuções CI/CD" value="135" detail="Repositório Tozato AI-Core" icon={Activity} accent="cyan" />
        <MetricCard label="Workflows" value="4" detail="Repositório Tozato AI-Core" icon={Workflow} accent="violet" />
        <MetricCard label="Jobs configurados" value="7" detail="Repositório Tozato AI-Core" icon={GitBranch} accent="green" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-white/[0.08] bg-[#101a2b] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">Confiabilidade de execução CI/CD</h3>
              <p className="mt-1 text-xs text-slate-500">Estimativa calculada para o repositório Tozato AI-Core</p>
            </div>
            <span className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">Dados do repositório</span>
          </div>
          <div className="mt-7 flex flex-col items-center gap-7 sm:flex-row sm:justify-around">
            <div
              role="img"
              aria-label="81,48 por cento de execuções sem falhas estimadas e 18,52 por cento com falhas estimadas"
              className="relative grid h-44 w-44 shrink-0 place-items-center rounded-full"
              style={{ background: "conic-gradient(#34d399 0% 81.48%, #f97373 81.48% 100%)" }}
            >
              <div className="grid h-32 w-32 place-items-center rounded-full bg-[#101a2b] text-center">
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-white tabular-nums">81,48%</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">Sem falhas</p>
                </div>
              </div>
            </div>
            <div className="w-full max-w-xs space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="text-sm text-slate-300">Execuções sem falhas</span>
                </div>
                <strong className="text-sm text-white tabular-nums">81,48%</strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: "81.48%" }} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="text-sm text-slate-300">Execuções com falhas</span>
                </div>
                <strong className="text-sm text-white tabular-nums">18,52%</strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-rose-400" style={{ width: "18.52%" }} />
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Percentuais estimados a partir do histórico consolidado de 135 execuções. Não representam qualidade de código nem o desempenho dos 41 repositórios.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/[0.08] bg-[#101a2b] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-violet-400/10 p-2.5 text-violet-300"><GitCommitHorizontal size={19} /></span>
            <div>
              <h3 className="font-semibold text-white">Indicadores complementares</h3>
              <p className="mt-1 text-xs text-slate-500">Sem evidência consolidada disponível</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-white/[0.07]">
            {unavailableMetrics.slice(0, showAll ? unavailableMetrics.length : 5).map((metric) => (
              <div key={metric.label} className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm text-slate-400">{metric.label}</span>
                <span className="rounded-md border border-white/10 px-2 py-1 text-xs font-medium text-slate-500">{metric.value}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="mt-3 text-xs font-medium text-blue-300 transition hover:text-blue-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
          >
            {showAll ? "Mostrar menos" : "Ver todos os indicadores"}
          </button>
        </article>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/[0.08] bg-[#101a2b] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300"><Bot size={19} /></span>
            <div>
              <h3 className="font-semibold text-white">Projetos em destaque</h3>
              <p className="mt-1 text-xs text-slate-500">Repositórios públicos selecionados</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {portfolio.projects.map((project) => (
              <a
                key={project.name}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-blue-400/30 hover:bg-blue-400/[0.06]"
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">{project.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{project.description}</p>
                </div>
                <ArrowUpRight size={16} className="shrink-0 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-300" />
              </a>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/[0.08] bg-[#101a2b] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300"><ShieldCheck size={19} /></span>
            <div>
              <h3 className="font-semibold text-white">Escopo e rastreabilidade</h3>
              <p className="mt-1 text-xs text-slate-500">Origem e interpretação dos indicadores</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
            <p><strong className="font-medium text-slate-200">Perfil GitHub:</strong> 41 repositórios identificados na conta.</p>
            <p><strong className="font-medium text-slate-200">CI/CD:</strong> 135 execuções, 4 workflows e 7 jobs atribuídos exclusivamente ao Tozato AI-Core.</p>
            <p><strong className="font-medium text-slate-200">Critério:</strong> indicadores sem fonte verificável permanecem como N/D, sem estimativas artificiais.</p>
          </div>
        </article>
      </div>

      <footer className="mt-6 flex flex-col gap-2 border-t border-white/[0.08] pt-4 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Tozato AI-Core · Developer Analytics</span>
        <span>Indicadores do portfólio e do repositório apresentados em escopos separados.</span>
      </footer>
    </section>
  );
}
