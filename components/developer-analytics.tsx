"use client";

import { useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import styles from "./developer-analytics.module.css";

type DailyPoint = { d: string; commits: number; runs: number };
type Repo = { name: string; label: string; value: string };

// Série diária sem fonte consolidada: preencher com dados reais do GitHub quando disponíveis.
const DAILY: DailyPoint[] = [];

const REPOS: Repo[] = [
  { name: "tozato-ai-core", label: "Repositório principal", value: "Principal" },
  { name: "h-folio", label: "Portfólio e Retrospectiva", value: "Portfólio" },
  { name: "certificados-e-portifolio-executivo", label: "18 Certificações / 760h", value: "18 cert. · 760 h" },
];

const W = 600;
const H = 190;
const PAD = 14;

function smooth(pts: [number, number][]): string {
  let p = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i - 1] ?? pts[i];
    const b = pts[i];
    const c = pts[i + 1];
    const e = pts[i + 2] ?? c;
    p += ` C${b[0] + (c[0] - a[0]) / 6},${b[1] + (c[1] - a[1]) / 6} ${c[0] - (e[0] - b[0]) / 6},${c[1] - (e[1] - b[1]) / 6} ${c[0]},${c[1]}`;
  }
  return p;
}

export default function DeveloperAnalytics() {
  const [period, setPeriod] = useState(30);
  const [tip, setTip] = useState<{ x: number; text: string } | null>(null);
  const rows = DAILY.slice(-period);
  const hasData = rows.length >= 2;
  const max = hasData ? Math.max(...rows.map((r) => Math.max(r.commits, r.runs))) || 1 : 1;
  const points = (key: "commits" | "runs"): [number, number][] =>
    rows.map((r, i) => [PAD + (i * (W - 2 * PAD)) / (rows.length - 1), H - PAD - (r[key] / max) * (H - 2 * PAD)]);

  const onMove = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    if (!hasData) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const i = Math.max(0, Math.min(rows.length - 1, Math.round((x / rect.width) * (rows.length - 1))));
    const r = rows[i];
    setTip({ x: Math.min(x, rect.width - 190), text: `${r.d} · commits: ${r.commits} · execuções: ${r.runs}` });
  };

  return (
    <section className={styles.root} aria-label="Developer Analytics">
      <h2 className={styles.title}>Developer Analytics</h2>
      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.ch}`}>
          <p className={styles.dt}>
            <span>Atividade semanal</span>
            <select className={styles.sel} aria-label="Período" value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Último mês</option>
              <option value={90}>Últimos 3 meses</option>
            </select>
          </p>
          <div className={styles.mt}>
            <div><b>135</b><span>Execuções CI/CD</span></div>
            <div><b>4</b><span>Workflows ativos</span></div>
            <div><b>7</b><span>Jobs executados</span></div>
          </div>
          <div className={styles.lg}>
            <span><i style={{ background: "var(--ac2)" }} />Commits</span>
            <span><i style={{ background: "var(--ac)" }} />Execuções de CI/CD</span>
          </div>
          <div className={styles.plot} onMouseMove={onMove} onTouchStart={onMove} onTouchMove={onMove} onMouseLeave={() => setTip(null)}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Gráfico de atividade">
              {hasData && (
                <>
                  <path d={smooth(points("commits"))} fill="none" stroke="var(--ac2)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
                  <path d={smooth(points("runs"))} fill="none" stroke="var(--ac)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
                </>
              )}
            </svg>
            {!hasData && <div className={styles.empty}>Série semanal N/D — somente totais disponíveis</div>}
            {tip && <div className={styles.tip} style={{ left: tip.x }}>{tip.text}</div>}
          </div>
        </div>

        <div className={`${styles.card} ${styles.tp}`}>
          <p className={styles.dt}>Repositórios em destaque</p>
          {REPOS.map((r) => (
            <div className={styles.rw} key={r.name}>
              <a href={`https://github.com/Rafael-TOZATO/${r.name}`} target="_blank" rel="noopener noreferrer" title={r.label}>{r.name}</a>
              <b>{r.value}</b>
            </div>
          ))}
        </div>

        <div className={`${styles.card} ${styles.bs}`}>
          <p className={styles.dt}>Status de CI/CD <small className={styles.nd}>tozato-ai-core</small></p>
          <div className={styles.rw}><span>Execuções sem falhas (estim.)</span><b>81,48%</b></div>
          <div className={styles.pb}><i style={{ ["--w" as string]: "81.48%" }} /></div>
          <div className={styles.rw}><span>Execuções com falhas (estim.)</span><b>18,52%</b></div>
          <div className={styles.pb}><i style={{ ["--w" as string]: "18.52%" }} /></div>
          <div className={styles.src}>135 execuções · 4 workflows · 7 jobs</div>
        </div>

        <div className={`${styles.card} ${styles.cq}`}>
          <p className={styles.dt}>Code Quality Score</p>
          <div className={styles.big}>N/D</div>
          <div className={styles.src}>Sem fonte para cálculo (CodeQL/análise estática não consultados).</div>
        </div>

        <div className={`${styles.card} ${styles.ja}`}>
          <p className={styles.dt}>Governança e capacitação</p>
          <div className={styles.rw}><span>Certificações</span><b>18</b></div>
          <div className={styles.pb}><i style={{ ["--w" as string]: "100%" }} /></div>
          <div className={styles.rw}><span>Carga horária</span><b>760 h</b></div>
          <div className={styles.pb}><i style={{ ["--w" as string]: "100%" }} /></div>
        </div>

        <div className={`${styles.card} ${styles.dp}`}>
          <p className={styles.dt}>Deployments</p>
          <div className={styles.rw}><span>Deploys na Vercel</span><b className={styles.nd}>N/D</b></div>
          <div className={styles.pb}><i style={{ ["--w" as string]: "0%" }} /></div>
          <div className={styles.src}>Histórico de deploys não consultado.</div>
        </div>
      </div>
    </section>
  );
}
