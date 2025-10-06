import { useMemo, useEffect, useState, useCallback } from "react";
import {
  Gavel,
  FileWarning,
  Landmark,
  Percent,
  Banknote,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Facebook,
  Instagram,
  Linkedin,
  FileText,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

/**
 * LP — Execuções Fiscais / Penhoras / Arrestos / Impostos em Atraso
 * Primeira dobra profissional e orientada à conversão, com formulário compacto no hero,
 * sticky CTA mobile, scrollspy na subnav, smooth scroll e revelação progressiva.
 * Paleta: Grafite (slate) + Âmbar (amber) + Cinza (zinc).
 * OAB: conteúdo informativo, sem promessa de resultado; avisos e consentimento presentes.
 */

const NAV_LINKS = [
  { href: "#alertas", label: "Sinais de alerta" },
  { href: "#atuacoes", label: "Atuações" },
  { href: "#metodologia", label: "Como conduzimos" },
  { href: "#documentos", label: "Documentos" },
  { href: "#conteudo", label: "Conteúdo" },
  { href: "#locais", label: "Locais" },
  { href: "#faq", label: "FAQ" },
  { href: "#contato", label: "Contato" },
];

export default function ExecucoesFiscaisPage() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [activeId, setActiveId] = useState<string>("#alertas");
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Sanity checks leves (não dependem de import.meta.env)
  useEffect(() => {
    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    if (!isBrowser) return;
    try {
      const hrefs = NAV_LINKS.map((n) => n.href);
      console.assert(new Set(hrefs).size === hrefs.length, "[NAV] hrefs devem ser únicos");
      requestAnimationFrame(() => {
        const missing = NAV_LINKS.map((n) => n.href).filter((h) => !document.querySelector(h));
        if (missing.length) console.warn("[NAV] Seções ausentes:", missing);
      });
    } catch (e) {
      console.warn("[DEV checks] Ignorados:", e);
    }
  }, []);

  // Smooth scroll com offset do header
  const smoothScroll = useCallback((hash: string) => {
    const el = document.querySelector(hash) as HTMLElement | null;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  // Scroll position + direction + progress
  useEffect(() => {
    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    if (!isBrowser) return;

    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;
      setScrollY(currentY);
      const diff = currentY - lastY;
      if (Math.abs(diff) > 4) {
        setScrollDir(diff > 0 ? "down" : "up");
        lastY = currentY;
      }
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const nextProgress = scrollable > 0 ? currentY / scrollable : 0;
      const clamped = Math.min(Math.max(nextProgress, 0), 1);
      setScrollProgress(clamped);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    const onResize = () => {
      lastY = window.scrollY;
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Parallax helpers
  useEffect(() => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    if (!nodes.length) return;

    let ticking = false;

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    const apply = () => {
      const y = window.scrollY;
      nodes.forEach((node) => {
        const speedAttr = node.dataset.parallax;
        if (!speedAttr) return;
        const speed = Number(speedAttr);
        if (!Number.isFinite(speed)) return;
        const offset = clamp(y * speed, -120, 120);
        node.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(apply);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
  return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Scrollspy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = `#${(entry.target as HTMLElement).id}`;
            setActiveId(id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    NAV_LINKS.forEach((l) => {
      const el = document.querySelector(l.href);
      if (el) observer.observe(el);
    });
  return () => observer.disconnect();
  }, []);

  // Reveal on view
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("opacity-0", "translate-y-4");
            e.target.classList.add("opacity-100", "translate-y-0");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const headerClassName = useMemo(() => {
    const base = "border-b sticky top-0 z-50 transition-all duration-300 transform backdrop-blur supports-[backdrop-filter]:bg-white/70";
    const stateClass = scrollY > 24 ? "bg-white/95 shadow-sm supports-[backdrop-filter]:bg-white/80" : "bg-white/90";
    const directionClass = scrollDir === "down" && scrollY > 120 ? "-translate-y-2 opacity-95" : "translate-y-0 opacity-100";
    return [base, stateClass, directionClass].join(" ");
  }, [scrollDir, scrollY]);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-amber-200/60">
      <span
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-amber-500/60 origin-left transform transition-transform duration-200 ease-out"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />
      {/* HEADER */}
      <header className={headerClassName}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-2xl bg-slate-900/95 ring-1 ring-slate-200/40 flex items-center justify-center p-2"
                aria-label="Logotipo Marinho Mendes"
              >
                <img
                  src="/LogoBranca.png"
                  alt="Logotipo Marinho Mendes Sociedade de Advogados"
                  className="h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
              <div className="leading-tight">
                <p className="text-base font-semibold tracking-tight">Marinho Mendes Sociedade de Advogados</p>
                <p className="text-xs sm:text-sm text-slate-500">Execuções Fiscais • Penhoras • Arrestos • Tributos em Atraso</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-5 text-sm">
              <a href="tel:+551932090417" className="inline-flex items-center gap-2 hover:opacity-80">
                <Phone className="h-4 w-4" />Campinas: (19) 3209-0417
              </a>
              <a href="tel:+551938454946" className="inline-flex items-center gap-2 hover:opacity-80">
                <Phone className="h-4 w-4" />Hortolândia: (19) 3845-4946
              </a>
              <a
                href="https://wa.me/5519974100605"
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 hover:bg-slate-50"
                aria-label="WhatsApp"
              >
                <MessageSquare className="h-4 w-4" />WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden" data-testid="hero">
        <div
          data-parallax="-0.15"
          className="absolute inset-0 -z-10 will-change-transform bg-[radial-gradient(60rem_40rem_at_70%-10%,#fff7ed,transparent),radial-gradient(70rem_40rem_at-20%_-30%,#f8fafc,transparent)] transition-transform duration-700"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Copy */}
            <div>
              <p className="text-xs font-semibold tracking-widest text-amber-700 uppercase">
                Execução Fiscal — resposta coordenada
              </p>
              <h1 className="mt-2 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-3xl [text-wrap:balance]">
                Resposta imediata para travar bloqueios e proteger o caixa da sua empresa
              </h1>
              <p className="mt-4 text-lg text-slate-700 max-w-2xl">
                Atuação informativa em <strong>exceção de pré-executividade</strong>, <strong>embargos</strong> e{" "}
                <strong>medidas urgentes</strong>, além de <strong>transação/parcelamento</strong> quando cabível (LEF 6.830/80, CPC, CTN art. 151, Lei 13.988/2020).
              </p>

              {/* Trust points */}
              <ul className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl">
                {[
                  { icon: Landmark, t: "SISBAJUD/RENAJUD", d: "Mapeamento de bloqueios e bens essenciais." },
                  { icon: Gavel, t: "Via adequada", d: "EPE (prova pré-constituída) ou Embargos (após garantia)." },
                  { icon: ShieldCheck, t: "Medidas urgentes", d: "Substituição/sustação de penhora e preservação de caixa." },
                  { icon: Percent, t: "Transação", d: "Cenários e efeitos de suspensão (CTN, art. 151)." },
                ].map((i, idx) => {
                  const Icon = i.icon as any;
  return (
                    <li
                      key={idx}
                      className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-xl border bg-white p-4 ring-1 ring-slate-200"
                      data-reveal
                      style={{ transitionDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-800">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-medium">{i.t}</p>
                          <p className="text-sm text-slate-700">{i.d}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => smoothScroll("#contato")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-medium bg-amber-500 text-slate-900 shadow-sm hover:bg-amber-600"
                >
                  Conversa técnica imediata <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => smoothScroll("#documentos")}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-base font-medium border hover:bg-slate-50"
                >
                  Documentos para iniciar
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-500 max-w-xl">
                Conteúdo informativo (Provimento CFOAB nº 205/2021). O contato não cria relação advogado–cliente.
              </p>
            </div>

            {/* Form no hero */}
            <form
              className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl bg-white p-6 ring-1 ring-slate-200 lg:mt-6"
              data-reveal
              onSubmit={(e) => {
                e.preventDefault();
                alert("Mensagem enviada.");
              }}
            >
              <p className="text-sm font-semibold text-slate-700">Solicitar análise do caso</p>
              <p className="text-xs text-slate-500 mb-4">Retorno no horário de atendimento (seg–sex, 8h–18h).</p>
              <div className="grid gap-4">
                <input
                  required
                  placeholder="Nome completo"
                  className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="email"
                    required
                    placeholder="E-mail"
                    className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                  <input
                    required
                    placeholder="Telefone/WhatsApp"
                    className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
                <select className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600">
                  <option>Embargos / EPE</option>
                  <option>Penhora/bloqueio</option>
                  <option>Parcelamento/Transação</option>
                  <option>Defesa administrativa</option>
                  <option>Outro</option>
                </select>
                <textarea
                  rows={4}
                  required
                  placeholder="Contexto do caso (autos, prazos, bloqueios/penhoras)"
                  className="w-full rounded-2xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                <label className="flex items-start gap-3 text-xs text-slate-600">
                  <input type="checkbox" required className="mt-1" />
                  <span>
                    Li e concordo com a <a className="hover:opacity-80" href="#">Política de Privacidade</a> e autorizo o contato para fins de atendimento.
                  </span>
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-medium bg-amber-500 text-slate-900 hover:bg-amber-600"
                >
                  Enviar mensagem <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                O envio deste formulário não cria relação advogado–cliente. Não compartilhe informações sensíveis antes de orientações específicas.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* SUBNAV STICKY */}
      <div className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto md:overflow-visible py-2 text-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => smoothScroll(l.href)}
                className={[
                  "inline-flex items-center rounded-full border px-3 py-1.5",
                  activeId === l.href ? "bg-amber-50 border-amber-200 text-amber-900" : "hover:bg-slate-50",
                ].join(" ")}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* SINAIS DE ALERTA */}
      <section id="alertas" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Sinais de alerta (ação imediata aconselhável)</h2>
            <p className="mt-2 text-slate-700">
              Situações que exigem medidas urgentes para evitar paralisia e danos financeiros.
            </p>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Landmark, title: "Bloqueios SISBAJUD/RENAJUD", desc: "Conta-salário, insumos essenciais, veículos indispensáveis." },
              { icon: FileWarning, title: "Protesto de CDA", desc: "Impacto em crédito e fornecedores." },
              { icon: Banknote, title: "Penhora de faturamento", desc: "Atinge fluxo de caixa e continuidade." },
              { icon: Gavel, title: "Intimação para garantir o juízo", desc: "Risco de atos constritivos iminentes." },
              { icon: ShieldCheck, title: "Bens essenciais", desc: "Hipóteses de impenhorabilidade (CPC, art. 833)." },
              { icon: Percent, title: "Transação/parcelamento", desc: "Oportunidades e riscos (Lei 13.988/2020)." },
            ].map((c, i) => {
              const Icon = c.icon as any;
  return (
                <div
                  key={i}
                  className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border ring-1 ring-slate-200 bg-white p-6"
                  data-reveal
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-semibold">{c.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ATUAÇÕES */}
      <section id="atuacoes" className="py-16 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Atuações principais</h2>
            <p className="mt-2 text-slate-700">Seleção da via conforme prova, momento processual e risco.</p>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Gavel, title: "Embargos à execução", tag: "LEF, art. 16, §1º", desc: "Após garantia do juízo (depósito, penhora, seguro/fiança)." },
              { icon: FileWarning, title: "Exceção de pré-executividade", tag: "Jurisprudência", desc: "Matérias de ordem pública com prova pré-constituída, sem garantia." },
              { icon: Landmark, title: "Medidas urgentes", tag: "CPC/LEF", desc: "Sustação/substituição de penhora e liberação de valores essenciais." },
              { icon: Percent, title: "Transação/parcelamento", tag: "Lei 13.988/2020 / CTN 151", desc: "Cenários com suspensão da exigibilidade e impacto de caixa." },
              { icon: Banknote, title: "Negociação fiscal", tag: "PGFN/Receita", desc: "Tratativas e conformidade documental." },
              { icon: FileText, title: "Defesas administrativas", tag: "Processo adm. fiscal", desc: "Impugnações e recursos." },
            ].map((c, i) => {
              const Icon = c.icon as any;
  return (
                <div
                  key={i}
                  className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border ring-1 ring-slate-200 bg-white p-6"
                  data-reveal
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-800">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{c.title}</h3>
                      <p className="text-[11px] text-slate-500">{c.tag}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* METODOLOGIA */}
      <section id="metodologia" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <ol className="space-y-5">
              {[
                { t: "Diagnóstico fiscal", d: "Análise de autos, CDA, garantias e fluxo de caixa; mapeamento de riscos (penhoras/bloqueios)." },
                { t: "Estratégia de defesa", d: "Definição de vias processuais/administrativas, prioridades e hipóteses jurídicas." },
                { t: "Medidas urgentes", d: "Sustação/substituição de penhoras, liberação de valores essenciais e preservação de atividades." },
                { t: "Negociação/parcelamento", d: "Simulações de transação/parcelas e impactos financeiros." },
                { t: "Acompanhamento", d: "Prazos, publicações e relatórios de andamento, com governança fiscal." },
              ].map((s, i) => (
                <li
                  key={i}
                  className="reveal opacity-0 translate-y-4 transition-all duration-700 relative pl-9"
                  data-reveal
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <span className="absolute left-0 top-0 mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-semibold">
                    {i + 1}
                  </span>
                  <p className="font-medium">{s.t}</p>
                  <p className="text-sm text-slate-700">{s.d}</p>
                </li>
              ))}
            </ol>

            <figure className="relative w-full aspect-[16/10] rounded-2xl border bg-white ring-1 ring-slate-200 overflow-hidden">
              <img
                src="/metodologia.png"
                alt="Fluxo de trabalho em defesas fiscais"
                loading="lazy"
                decoding="async"
                width={1200}
                height={750}
                className="h-full w-full object-cover"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* DOCUMENTOS */}
      <section id="documentos" className="py-16 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Documentos para iniciar</h2>
            <p className="mt-2 text-slate-700">Organize o material essencial para análise inicial do caso.</p>
          </div>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border bg-white p-6 ring-1 ring-slate-200" data-reveal>
              <p className="font-semibold mb-2">Processo/Execução</p>
              <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                <li>Autos de infração, CDA e intimações.</li>
                <li>Extratos de bloqueio (SISBAJUD) / RENAJUD.</li>
                <li>Andamentos/publicações relevantes.</li>
              </ul>
            </div>
            <div className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border bg-white p-6 ring-1 ring-slate-200" data-reveal>
              <p className="font-semibold mb-2">Financeiro/Operacional</p>
              <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                <li>Fluxo de caixa e impacto de penhora.</li>
                <li>Contratos/Notas fiscais essenciais.</li>
                <li>Dados de garantias (imóveis, veículos, seguros, fiança).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section id="conteudo" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Conteúdo educativo</h2>
          <p className="mt-2 text-slate-700 max-w-3xl">
            Material para gestores sobre execução fiscal, garantias e programas de regularização.
          </p>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Embargos x EPE: quando usar",
                desc: "Prova necessária e principais riscos.",
                image: "/embargo.png",
                alt: "Ilustração sobre embargos à execução",
              },
              {
                title: "Penhora on-line: limites e defesa",
                desc: "Conta-salário, insumos e impenhorabilidades (CPC, art. 833).",
                image: "/penhora.png",
                alt: "Análise de bloqueios e penhora de ativos",
              },
              {
                title: "Transação tributária na prática",
                desc: "Lei 13.988/2020 – condições, descontos e planejamento de caixa.",
                image: "/transação.png",
                alt: "Planejamento de transação tributária",
              },
            ].map((art, i) => (
              <article
                key={i}
                className="reveal opacity-0 translate-y-4 transition-all duration-700 group rounded-2xl border ring-1 ring-slate-200 overflow-hidden bg-white"
                data-reveal
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <figure className="aspect-[4/3] bg-slate-50 border-b ring-1 ring-slate-200 overflow-hidden">
                  <img
                    src={art.image}
                    alt={art.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </figure>
                <div className="p-5">
                  <h3 className="font-semibold group-hover:text-slate-900">{art.title}</h3>
                  <p className="mt-1 text-sm text-slate-700">{art.desc}</p>
                  <a href="#contato" className="mt-3 inline-flex items-center gap-1 text-sm hover:opacity-80">
                    Solicitar material <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAIS */}
      <section id="locais" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Locais de atuação</h2>
          <p className="mt-2 text-slate-700">
            Atuação em todo o território nacional, com bases no interior de São Paulo.
          </p>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border ring-1 ring-slate-200 p-6 bg-white" data-reveal>
              <h3 className="font-semibold">Campinas/SP</h3>
              <p className="text-sm text-slate-700 mt-1">
                Av. José Rocha Bonfim, 214, Bloco J – Sala 228 – Ed. Milão, Praça Capital, Loteamento Center Santa Genebra, CEP 13080-650.
              </p>
              <p className="text-sm mt-2 inline-flex items-center gap-2">
                <Phone className="h-4 w-4" /> <a href="tel:+551932090417" className="hover:opacity-80">
                  (19) 3209-0417
                </a>
              </p>
            </div>
            <div className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-2xl border ring-1 ring-slate-200 p-6 bg-white" data-reveal>
              <h3 className="font-semibold">Hortolândia/SP</h3>
              <p className="text-sm text-slate-700 mt-1">Rua Antônio Nelson Barbosa, 93 – Jardim do Bosque, CEP 13186-231.</p>
              <p className="text-sm mt-2 inline-flex items-center gap-2">
                <Phone className="h-4 w-4" /> <a href="tel:+551938454946" className="hover:opacity-80">
                  (19) 3845-4946
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Perguntas frequentes</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {[
            {
              q: "Como priorizam medidas urgentes (bloqueios/penhoras)?",
              a: "Impacto no caixa e essencialidade do valor/bem; pedidos de substituição/liberação com base em provas e precedentes.",
            },
            {
              q: "Quando usam EPE x Embargos?",
              a: "EPE para matérias de ordem pública com prova pré-constituída; Embargos após garantia (LEF, art. 16, §1º).",
            },
            {
              q: "Como avaliam transação/parcelamento?",
              a: "Simulações de cenários (Lei 13.988/2020), efeito na exigibilidade (CTN, art. 151) e sustentabilidade do cronograma.",
            },
            {
              q: "Quais documentos pedem inicialmente?",
              a: "Autos/CDA/intimações, extratos de bloqueio, contratos essenciais e dados de garantia/fluxo de caixa.",
            },
            { q: "Atendem empresas e pessoas físicas?", a: "Sim; estratégias adequadas à materialidade e urgência do passivo." },
            {
              q: "Como reportam o andamento?",
              a: "Relatórios periódicos com prazos, publicações e marcos processuais em calendário de governança.",
            },
          ].map((item, i) => (
            <details key={i} className="reveal opacity-0 translate-y-4 transition-all duration-700 rounded-xl border p-4 bg-white" data-reveal>
              <summary className="cursor-pointer font-medium">{item.q}</summary>
              <p className="mt-2 text-sm text-slate-700">{item.a}</p>
            </details>
          ))}
        </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="py-16 bg-slate-900 text-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Conversa técnica sobre Execuções Fiscais</h2>
              <p className="mt-2 text-slate-300 max-w-2xl">
                Envie uma mensagem com o contexto. Retornamos no horário de atendimento (seg–sex, 8h–18h). O envio deste formulário não cria relação advogado–cliente.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a className="hover:opacity-80" href="mailto:adm@marinhomendes.adv.br">adm@marinhomendes.adv.br</a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <a className="hover:opacity-80" href="https://wa.me/5519974100605">+55 (19) 97410-0605</a>
                </li>
              </ul>

              {/* Espaço para imagem do escritório */}
              <figure className="mt-8 w-full aspect-[16/9] rounded-2xl border border-white/10 bg-white/5 ring-1 ring-white/10 overflow-hidden">
                <img
                  src="/Escritorio.jpg"
                  alt="Espaço interno do escritório Marinho Mendes"
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={720}
                  className="h-full w-full object-cover"
                />
              </figure>
            </div>

            <form
              className="bg-white text-slate-900 rounded-2xl p-6 ring-1 ring-white/10"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Mensagem enviada.");
              }}
            >
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="nome">Nome completo</label>
                  <input id="nome" name="nome" required className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600" placeholder="Seu nome" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" htmlFor="email">E-mail</label>
                    <input id="email" type="email" name="email" required className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600" placeholder="voce@empresa.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="telefone">Telefone/WhatsApp</label>
                    <input id="telefone" name="telefone" required className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600" placeholder="(19) 9xxxx-xxxx" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="empresa">Empresa (opcional)</label>
                  <input id="empresa" name="empresa" className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600" placeholder="Razão social" />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="assunto">Assunto</label>
                  <select id="assunto" name="assunto" className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600">
                    <option>Embargos / EPE</option>
                    <option>Penhora/bloqueio</option>
                    <option>Parcelamento/Transação</option>
                    <option>Defesa administrativa</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="mensagem">Contexto do caso</label>
                  <textarea id="mensagem" name="mensagem" rows={5} required className="mt-1 w-full rounded-2xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600" placeholder="Descreva autos, prazos e bloqueios/penhoras." />
                </div>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" required className="mt-1" />
                  <span>
                    Li e concordo com a <a className="hover:opacity-80" href="#">Política de Privacidade</a> e autorizo o contato para fins de atendimento.
                  </span>
                </label>
                <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-medium bg-amber-500 text-slate-900 hover:bg-amber-600">
                  Enviar mensagem <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                O envio deste formulário não cria relação advogado–cliente. Não compartilhe informações sensíveis antes de orientações específicas.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* CTA MOBILE FIXO */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-white/95 border-t backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between gap-2">
          <button
            onClick={() => (window.location.href = "https://wa.me/5519974100605")}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-600"
          >
            <MessageSquare className="h-4 w-4" /> WhatsApp
          </button>
          <a href="tel:+551932090417" className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border hover:bg-slate-50">
            <Phone className="h-4 w-4" /> Ligar
          </a>
        </div>
      </div>

      {/* RODAPÉ */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-6 gap-8 text-sm">
          <div className="md:col-span-3">
            <p className="font-semibold text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Unidades
            </p>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border ring-1 ring-slate-200 p-4">
                <p className="font-medium">Campinas/SP</p>
                <p className="text-slate-700 mt-1">
                  Av. José Rocha Bonfim, 214, Bloco J – Sala 228 – Ed. Milão, Praça Capital, Loteamento Center Santa Genebra, CEP 13080-650.
                </p>
                <p className="mt-2 inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" /> <a href="tel:+551932090417" className="hover:opacity-80">(19) 3209-0417</a>
                </p>
              </div>
              <div className="rounded-2xl border ring-1 ring-slate-200 p-4">
                <p className="font-medium">Hortolândia/SP</p>
                <p className="text-slate-700 mt-1">Rua Antônio Nelson Barbosa, 93 – Jardim do Bosque, CEP 13186-231.</p>
                <p className="mt-2 inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" /> <a href="tel:+551938454946" className="hover:opacity-80">(19) 3845-4946</a>
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="font-semibold">Marinho Mendes Sociedade de Advogados</p>
            <p className="mt-1 text-slate-700 max-w-lg">
              Conteúdo meramente informativo, sem promessa de resultado. Publicidade realizada em conformidade com o Código de Ética e
              Disciplina da OAB e Provimento CFOAB nº 205/2021.
            </p>
            <div className="mt-4 space-y-3">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> <a href="mailto:adm@marinhomendes.adv.br" className="hover:opacity-80">adm@marinhomendes.adv.br</a>
              </p>
              <p className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> <a href="https://wa.me/5519974100605" className="hover:opacity-80">+55 (19) 97410-0605</a>
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <a aria-label="Facebook" href="https://www.facebook.com/marinhomendesadv" className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-slate-50">
                <Facebook className="h-4 w-4" />
              </a>
              <a aria-label="Instagram" href="https://www.instagram.com/marinhomendesadv" className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-slate-50">
                <Instagram className="h-4 w-4" />
              </a>
              <a aria-label="LinkedIn" href="https://www.linkedin.com/company/14030512/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-slate-50">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-1">
            <p className="font-semibold">Links</p>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="https://marinhomendes.adv.br/" className="hover:opacity-80">Site</a>
              </li>
              <li>
                <a href="https://marinhomendes.adv.br/blog" className="hover:opacity-80">Blog</a>
              </li>
              <li>
                <a href="#" className="hover:opacity-80">Política de Privacidade</a>
              </li>
              <li>
                <a href="#" className="hover:opacity-80">Aviso de Cookies</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t py-6 text-xs text-slate-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p>© {year} Marinho Mendes Sociedade de Advogados. Atendimento: seg–sex, 8h–18h. Conteúdo informativo.</p>
          </div>
        </div>
      </footer>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LegalService",
            name: "Marinho Mendes Sociedade de Advogados",
            url: "https://marinhomendes.adv.br/",
            areaServed: "Brasil",
            serviceType: [
              "Defesa em Execuções Fiscais",
              "Medidas urgentes (penhoras/arrestos)",
              "Exceção de pré-executividade",
              "Embargos à execução",
              "Parcelamentos/Transação tributária",
              "Defesa administrativa",
            ],
            sameAs: [
              "https://www.facebook.com/marinhomendesadv",
              "https://www.instagram.com/marinhomendesadv",
              "https://www.linkedin.com/company/14030512/",
            ],
            openingHours: "Mo-Fr 08:00-18:00",
          }),
        }}
      />
    </div>
  );
}













