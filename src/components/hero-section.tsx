'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useBookDemoStore } from '@/store/useBookDemoStore';

interface TickerItem {
  sym: string;
  val: string;
  chg: string;
  isUp: boolean;
}

const tickerData: TickerItem[] = [
  { sym: 'GOLD', val: '2,183.40', chg: '+1.08%', isUp: true },
  { sym: 'USD/JPY', val: '151.45', chg: '+0.45%', isUp: true },
  { sym: 'AUD/USD', val: '0.6523', chg: '-0.18%', isUp: false },
  { sym: 'S&P 500', val: '5,234', chg: '+0.89%', isUp: true },
  { sym: 'NASDAQ', val: '16,428', chg: '+1.24%', isUp: true },
  { sym: 'OIL', val: '82.15', chg: '+2.25%', isUp: true },
  { sym: 'BTC/USD', val: '67,240', chg: '+3.10%', isUp: true },
  { sym: 'EUR/USD', val: '1.0842', chg: '-0.06%', isUp: false },
];

export default function HeroSection() {
  const openDemoModal = useBookDemoStore((s) => s.openDemoModal);

  // References for Canvas and SVG chart
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tiltWrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const linePathRef = useRef<SVGPathElement>(null);
  const areaPathRef = useRef<SVGPathElement>(null);
  const pulseDotRef = useRef<SVGCircleElement>(null);
  const hubSparkRef = useRef<SVGPathElement>(null);
  const deskCardsRef = useRef<HTMLDivElement>(null);

  // Dynamic live states
  const [confidence, setConfidence] = useState(0);
  const [sharpe, setSharpe] = useState(0);
  const [drawdown, setDrawdown] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [priceVal, setPriceVal] = useState('2,183.40');
  const [priceDelta, setPriceDelta] = useState('+0.42%');
  const [priceIsUp, setPriceIsUp] = useState(true);
  const [hubVal, setHubVal] = useState('$18,204');
  const [hubDelta, setHubDelta] = useState('+2.9% today');
  const [hubIsUp, setHubIsUp] = useState(true);

  // SVG Chart Static Data Generation
  const chartWidth = 560;
  const chartHeight = 240;
  const chartPad = 14;
  const numPoints = 26;

  const [chartData, setChartData] = useState<{
    nodes: [number, number][];
    connections: [number, number, number, number][];
    candles: {
      cx: number;
      yTop: number;
      yBot: number;
      yHi: number;
      yLo: number;
      isUp: boolean;
    }[];
    smoothD: string;
    areaD: string;
  }>({
    nodes: [],
    connections: [],
    candles: [],
    smoothD: '',
    areaD: '',
  });

  // 1. Ambient particles canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const pts: {
      x: number;
      y: number;
      r: number;
      vy: number;
      hue: string;
      o: number;
    }[] = [];

    for (let i = 0; i < 65; i++) {
      pts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        vy: -(Math.random() * 0.12 + 0.03),
        hue: Math.random() < 0.6 ? '155,120,255' : '242,181,68',
        o: Math.random() * 0.5 + 0.15,
      });
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.y += p.vy;
        if (p.y < -10) p.y = canvas.height + 10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue},${p.o})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 2. Chart geometry generator & animation
  useEffect(() => {
    const closes: number[] = [];
    let v = 120;
    for (let i = 0; i < numPoints; i++) {
      v += (Math.random() - 0.46) * 10;
      closes.push(v);
    }
    const minV = Math.min(...closes) - 8;
    const maxV = Math.max(...closes) + 8;

    const yOf = (val: number) =>
      chartHeight - chartPad - ((val - minV) / (maxV - minV)) * (chartHeight - chartPad * 2);
    const xOf = (i: number) => (i / (numPoints - 1)) * (chartWidth - 40) + 10;

    // Neural nodes
    const nodes: [number, number][] = [];
    for (let i = 0; i < numPoints; i += 2) {
      nodes.push([xOf(i), yOf(closes[i]) + (Math.random() * 40 - 20)]);
    }

    // Connections
    const connections: [number, number, number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < Math.min(i + 3, nodes.length); j++) {
        connections.push([nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1]]);
      }
    }

    // Candlesticks
    const candles = [];
    for (let i = 0; i < numPoints; i++) {
      const cx = xOf(i);
      const c = closes[i];
      const o = i === 0 ? c : closes[i - 1];
      const hi = Math.max(o, c) + Math.random() * 4;
      const lo = Math.min(o, c) - Math.random() * 4;
      const isUp = c >= o;
      candles.push({
        cx,
        yTop: yOf(Math.max(o, c)),
        yBot: yOf(Math.min(o, c)),
        yHi: yOf(hi),
        yLo: yOf(lo),
        isUp,
      });
    }

    // Smooth path
    const p = closes.map((c, i) => [xOf(i), yOf(c)]);
    let d = `M${p[0][0]},${p[0][1]}`;
    for (let i = 1; i < p.length; i++) {
      const midX = (p[i - 1][0] + p[i][0]) / 2;
      const midY = (p[i - 1][1] + p[i][1]) / 2;
      d += ` Q${p[i - 1][0]},${p[i - 1][1]} ${midX},${midY}`;
    }
    d += ` L${p[p.length - 1][0]},${p[p.length - 1][1]}`;

    const areaD = `${d} L${p[p.length - 1][0]},${chartHeight} L${p[0][0]},${chartHeight} Z`;

    setChartData({ nodes, connections, candles, smoothD: d, areaD });
  }, []);

  // 3. SVG Path drawing animation and pulse dot traveling
  useEffect(() => {
    const linePath = linePathRef.current;
    const areaPath = areaPathRef.current;
    const pulseDot = pulseDotRef.current;
    if (!linePath || !chartData.smoothD) return;

    const len = linePath.getTotalLength();
    linePath.style.strokeDasharray = `${len}`;
    linePath.style.strokeDashoffset = `${len}`;

    const frameId = requestAnimationFrame(() => {
      linePath.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.2,.7,.2,1)';
      linePath.style.strokeDashoffset = '0';
    });

    const areaTimer = setTimeout(() => {
      if (areaPath) {
        areaPath.style.transition = 'opacity 1s ease';
        areaPath.style.opacity = '1';
      }
    }, 900);

    let start: number | null = null;
    const DURATION = 3400;
    let pulseAnimId: number;

    const animatePulse = (ts: number) => {
      if (!start) start = ts;
      const t = ((ts - start) % DURATION) / DURATION;
      if (linePath && pulseDot) {
        const pt = linePath.getPointAtLength(t * len);
        pulseDot.setAttribute('cx', `${pt.x}`);
        pulseDot.setAttribute('cy', `${pt.y}`);
        pulseDot.setAttribute('opacity', '0.9');
      }
      pulseAnimId = requestAnimationFrame(animatePulse);
    };

    const pulseTimer = setTimeout(() => {
      pulseAnimId = requestAnimationFrame(animatePulse);
    }, 1900);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(areaTimer);
      clearTimeout(pulseTimer);
      cancelAnimationFrame(pulseAnimId);
    };
  }, [chartData]);

  // 4. Animated count-up for numbers
  useEffect(() => {
    const animateCount = (
      setter: (v: number) => void,
      target: number,
      duration: number
    ) => {
      let startT: number | null = null;
      const step = (ts: number) => {
        if (!startT) startT = ts;
        const p = Math.min(1, (ts - startT) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setter(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const timer = setTimeout(() => {
      animateCount(setConfidence, 94.7, 1400);
      animateCount(setSharpe, 2.31, 1200);
      animateCount(setDrawdown, 4.8, 1200);
      animateCount(setWinRate, 71, 1200);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 5. Live ticking price updates
  useEffect(() => {
    let base = 2183.4;
    let pct = 0.42;
    const interval = setInterval(() => {
      const move = (Math.random() - 0.5) * 0.9;
      base += move;
      pct += move / 10;
      setPriceVal(
        base.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
      setPriceDelta((pct >= 0 ? '+' : '') + pct.toFixed(2) + '%');
      setPriceIsUp(pct >= 0);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // 6. 3D tilt interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = tiltWrapRef.current;
    const panel = panelRef.current;
    if (!wrap || !panel) return;
    const r = wrap.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    panel.style.transform = `rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateZ(0)`;
  };

  const handleMouseLeave = () => {
    const panel = panelRef.current;
    if (panel) {
      panel.style.transform = 'rotateY(0deg) rotateX(0deg)';
    }
  };

  // 7. Trading Hub Card Sparkline & Live Ticker
  useEffect(() => {
    const hub = hubSparkRef.current;
    if (hub) {
      const vals: number[] = [];
      let hv = 30;
      for (let i = 0; i < 40; i++) {
        hv += (Math.random() - 0.42) * 6;
        vals.push(hv);
      }
      const hMin = Math.min(...vals);
      const hMax = Math.max(...vals);
      const d = vals
        .map((val, i) => {
          const x = (i / (vals.length - 1)) * 300;
          const y = 36 - ((val - hMin) / (hMax - hMin)) * 32;
          return (i === 0 ? 'M' : 'L') + x + ',' + y;
        })
        .join(' ');
      hub.setAttribute('d', d);
      const hl = hub.getTotalLength();
      hub.style.strokeDasharray = `${hl}`;
      hub.style.strokeDashoffset = `${hl}`;
      setTimeout(() => {
        if (hub) {
          hub.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.2,.7,.2,1)';
          hub.style.strokeDashoffset = '0';
        }
      }, 300);
    }

    let hBase = 18204;
    let hPct = 2.9;
    const hubTimer = setInterval(() => {
      const move = (Math.random() - 0.5) * 40;
      hBase += move;
      hPct += move / 400;
      setHubVal('$' + Math.round(hBase).toLocaleString('en-US'));
      setHubDelta((hPct >= 0 ? '+' : '') + hPct.toFixed(1) + '% today');
      setHubIsUp(hPct >= 0);
    }, 2600);

    return () => clearInterval(hubTimer);
  }, []);

  // 8. Intersection observer for cards reveal
  useEffect(() => {
    const cards = deskCardsRef.current?.querySelectorAll('.desk-card');
    if (!cards) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add('in-view');
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <div className="atlas-hero-root">
      <style jsx global>{`
        .atlas-hero-root {
          position: relative;
          background: #07030f;
          color: #f4f1ff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
        }

        .atlas-hero-root h1,
        .atlas-hero-root h2,
        .atlas-hero-root h3 {
          font-family: 'Bodoni Moda', 'Times New Roman', serif;
          font-weight: 500;
        }

        .mono-font {
          font-family: 'JetBrains Mono', monospace;
        }

        #atlasAmbient {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.55;
        }

        .atlas-field {
          position: relative;
          z-index: 1;
          background: radial-gradient(
              ellipse 900px 500px at 82% -10%,
              rgba(139, 92, 246, 0.28),
              transparent 60%
            ),
            radial-gradient(
              ellipse 700px 600px at -10% 40%,
              rgba(217, 70, 239, 0.14),
              transparent 60%
            );
        }

        .atlas-field::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            118deg,
            rgba(155, 120, 255, 0.05) 0 1px,
            transparent 1px 90px
          );
          pointer-events: none;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
          -webkit-mask-image: linear-gradient(to bottom, black, transparent 85%);
        }

        /* ---------- Ticker ---------- */
        .atlas-ticker-wrap {
          border-bottom: 1px solid rgba(155, 120, 255, 0.16);
          background: rgba(18, 10, 40, 0.65);
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          display: flex;
          align-items: center;
          height: 48px;
          min-height: 48px;
        }

        .atlas-ticker-wrap::before,
        .atlas-ticker-wrap::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 70px;
          z-index: 2;
          pointer-events: none;
        }

        .atlas-ticker-wrap::before {
          left: 0;
          background: linear-gradient(90deg, #07030f, transparent);
        }

        .atlas-ticker-wrap::after {
          right: 0;
          background: linear-gradient(-90deg, #07030f, transparent);
        }

        .atlas-ticker-track {
          display: inline-flex;
          align-items: center;
          gap: 52px;
          padding: 0;
          height: 100%;
          animation: atlasScroll 32s linear infinite;
        }

        .atlas-ticker-wrap:hover .atlas-ticker-track {
          animation-play-state: paused;
        }

        @keyframes atlasScroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .atlas-tick {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          height: 100%;
          vertical-align: middle;
        }

        .atlas-tick .sym {
          display: inline-flex;
          align-items: center;
          color: #b6afd6;
          font-weight: 600;
          letter-spacing: 0.02em;
          line-height: normal;
        }

        .atlas-tick .val {
          display: inline-flex;
          align-items: center;
          font-family: 'JetBrains Mono', monospace;
          color: #f4f1ff;
          line-height: normal;
        }

        .atlas-tick .chg {
          display: inline-flex;
          align-items: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: normal;
        }

        .atlas-tick .chg.up {
          color: #34d399;
        }

        .atlas-tick .chg.down {
          color: #f87171;
        }

        /* ---------- Hero ---------- */
        .atlas-hero {
          display: grid;
          grid-template-columns: minmax(340px, 560px) 1fr;
          gap: 52px;
          align-items: stretch;
          padding: clamp(32px, 4vw, 56px) clamp(24px, 4.5vw, 64px) clamp(36px, 4vw, 60px);
          max-width: 1440px;
          margin: 0 auto;
        }

        @media (max-width: 1024px) {
          .atlas-hero {
            grid-template-columns: 1fr;
            padding-top: 32px;
          }
        }

        .atlas-status {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          font-size: 14px;
          color: #b6afd6;
          border: 1px solid rgba(170, 130, 255, 0.32);
          border-radius: 100px;
          padding: 7px 16px 7px 12px;
          margin-bottom: 22px;
          background: rgba(139, 92, 246, 0.08);
          width: fit-content;
        }

        .atlas-status .dot {
          width: 8.5px;
          height: 8.5px;
          border-radius: 50%;
          background: #34d399;
          animation: atlasPing 2.2s ease-out infinite;
        }

        @keyframes atlasPing {
          0% {
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(52, 211, 153, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
          }
        }

        .atlas-hero h1 {
          font-size: clamp(34px, 4.2vw, 52px);
          line-height: 1.1;
          font-weight: 500;
          letter-spacing: -0.005em;
          margin: 0 0 18px;
          color: #f4f1ff;
        }

        .atlas-hero h1 .grad {
          background: linear-gradient(100deg, #cdb8ff, #f0c1ff 55%, #ffd699);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .atlas-hero p.lede {
          font-size: 17.5px;
          line-height: 1.6;
          color: #b6afd6;
          max-width: 48ch;
          margin: 0 0 28px;
        }

        .atlas-hero-cta {
          display: flex;
          align-items: center;
          gap: 28px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .atlas-btn-lg {
          padding: 14px 28px;
          font-size: 16.5px;
          border-radius: 13px;
          font-weight: 600;
        }

        .atlas-link-secondary {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          font-size: 16px;
          font-weight: 600;
          color: #f4f1ff;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-left: 2px;
        }

        .atlas-link-secondary .playdot {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(170, 130, 255, 0.32);
          display: grid;
          place-items: center;
          transition: border-color 0.2s, transform 0.2s;
        }

        .atlas-link-secondary:hover .playdot {
          border-color: #8b5cf6;
          transform: scale(1.08);
        }

        .atlas-trust-row {
          display: flex;
          gap: 36px;
          flex-wrap: wrap;
          border-top: 1px solid rgba(155, 120, 255, 0.16);
          padding-top: 22px;
        }

        .atlas-trust-item .num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px;
          font-weight: 600;
          color: #f4f1ff;
        }

        .atlas-trust-item .lbl {
          font-size: 14px;
          color: #7c7599;
          margin-top: 3px;
        }

        @media (max-width: 640px) {
          .atlas-hero {
            padding: 24px 16px 36px;
            gap: 36px;
          }

          .atlas-hero-cta {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            flex-wrap: nowrap;
            width: 100%;
          }

          .atlas-btn-lg {
            padding: 10px clamp(10px, 2.5vw, 15px);
            font-size: clamp(12px, 3.1vw, 13.5px);
            border-radius: 10px;
            white-space: nowrap;
            text-align: center;
          }

          .atlas-link-secondary {
            gap: 8px;
            font-size: clamp(12px, 3.1vw, 13.5px);
            white-space: nowrap;
            margin-left: 6px;
          }

          .atlas-link-secondary .playdot {
            width: 28px;
            height: 28px;
            min-width: 28px;
          }

          .atlas-link-secondary .playdot svg {
            width: 9px;
            height: 9px;
          }

          .atlas-trust-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            padding-top: 18px;
          }

          .atlas-trust-item .num {
            font-size: 18px;
          }

          .atlas-trust-item .lbl {
            font-size: 11px;
            line-height: 1.25;
            margin-top: 2px;
          }

          .atlas-engine {
            padding: 16px;
          }
        }

        /* ---------- Engine Panel ---------- */
        .atlas-engine-tilt {
          perspective: 1200px;
          display: flex;
          height: 100%;
          max-height: 480px;
        }

        .atlas-engine {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          border-radius: 24px;
          border: 1px solid rgba(170, 130, 255, 0.32);
          background: linear-gradient(
            180deg,
            rgba(23, 14, 51, 0.9),
            rgba(15, 8, 32, 0.9)
          );
          box-shadow: 0 30px 80px -30px rgba(90, 20, 160, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          padding: 22px 24px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transform-style: preserve-3d;
          transition: transform 0.25s ease-out;
          will-change: transform;
        }

        .atlas-engine-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .atlas-engine-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15.5px;
          color: #b6afd6;
        }

        .atlas-engine-title .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f2b544;
          box-shadow: 0 0 12px #f2b544;
        }

        .atlas-confidence {
          font-family: 'JetBrains Mono', monospace;
          font-size: 15.5px;
          color: #34d399;
        }

        .atlas-chart-wrap {
          position: relative;
          flex: 1;
          min-height: 160px;
          max-height: 250px;
          margin: 12px -4px 6px;
        }

        .atlas-chart-wrap svg {
          width: 100%;
          height: 100%;
          overflow: visible;
          display: block;
        }

        .atlas-price-float {
          position: absolute;
          top: 14px;
          right: 0;
          background: rgba(7, 3, 15, 0.88);
          border: 1px solid rgba(170, 130, 255, 0.32);
          border-radius: 12px;
          padding: 10px 15px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          text-align: right;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }

        .atlas-price-float .p {
          color: #f4f1ff;
          font-weight: 600;
        }

        .atlas-price-float .d {
          font-size: 13px;
        }

        .atlas-price-float .d.up {
          color: #34d399;
        }

        .atlas-price-float .d.down {
          color: #f87171;
        }

        .atlas-metrics-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(155, 120, 255, 0.16);
        }

        .atlas-metric .num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 19px;
          font-weight: 600;
          color: #f4f1ff;
        }

        .atlas-metric .lbl {
          font-size: 13px;
          color: #7c7599;
          margin-top: 3px;
        }

        .atlas-engine::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 26px;
          padding: 1px;
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.5),
            transparent 30%,
            transparent 70%,
            rgba(217, 70, 239, 0.4)
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* ---------- Desk Section & Bento Cards ---------- */
        .atlas-desk {
          position: relative;
          z-index: 1;
          max-width: 1440px;
          margin: 0 auto;
          padding: 16px clamp(24px, 4.5vw, 64px) 80px;
          border-top: 1px solid rgba(155, 120, 255, 0.16);
        }

        .atlas-desk-head {
          max-width: 720px;
          margin: 16px auto 44px;
          text-align: center;
        }

        .atlas-desk-head .rule {
          width: 56px;
          height: 2.5px;
          margin: 0 auto 24px;
          background: linear-gradient(133deg, #7c3aed 0%, #c026d3 100%);
          border-radius: 2px;
        }

        .atlas-desk-head h2 {
          font-style: italic;
          font-weight: 500;
          font-size: clamp(34px, 4.2vw, 46px);
          margin: 0 0 16px;
          letter-spacing: 0.002em;
          color: #f4f1ff;
        }

        .atlas-desk-head p {
          color: #b6afd6;
          font-size: 18px;
          line-height: 1.65;
          margin: 0 auto;
          max-width: 54ch;
        }

        .atlas-grid6 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 1fr;
          gap: 18px;
        }

        @media (max-width: 960px) {
          .atlas-grid6 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .atlas-grid6 {
            grid-template-columns: 1fr;
          }
        }

        .desk-card {
          position: relative;
          border-radius: 18px;
          border: 1px solid rgba(155, 120, 255, 0.16);
          background: linear-gradient(
            165deg,
            rgba(23, 14, 51, 0.65),
            rgba(11, 6, 24, 0.75)
          );
          padding: 24px 22px;
          overflow: hidden;
          cursor: pointer;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s cubic-bezier(0.2, 0.7, 0.2, 1),
            transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1), border-color 0.3s,
            box-shadow 0.3s;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-decoration: none;
        }

        .desk-card.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .desk-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 20px;
          right: 20px;
          height: 2.5px;
          background: var(--accent);
          border-radius: 2px;
          opacity: 0.55;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .desk-card:hover::before {
          transform: scaleX(1);
        }

        .desk-card:hover {
          border-color: color-mix(
            in srgb,
            var(--accent) 55%,
            rgba(170, 130, 255, 0.32)
          );
          box-shadow: 0 20px 48px -20px color-mix(
              in srgb,
              var(--accent) 55%,
              transparent
            );
        }

        .desk-card:hover .card-arrow {
          transform: translate(3px, -3px);
          color: var(--accent);
        }

        .desk-card:hover .desk-icon {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 18%, transparent);
        }

        .desk-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          border: 1px solid rgba(170, 130, 255, 0.32);
          background: var(--accent-soft);
          display: grid;
          place-items: center;
          margin-bottom: 15px;
          transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1),
            border-color 0.3s;
        }

        .desk-icon svg {
          width: 20px;
          height: 20px;
          stroke: var(--accent) !important;
        }

        .desk-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .desk-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 7px;
          color: #f4f1ff;
        }

        .desk-card p {
          font-size: 15px;
          line-height: 1.55;
          color: #b6afd6;
          margin: 0;
          max-width: 36ch;
        }

        .card-arrow {
          color: #7c7599;
          transition: transform 0.25s ease, color 0.25s ease;
          margin-top: 2px;
        }

        .desk-card-tag {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.03em;
          color: var(--accent);
          background: var(--accent-soft);
          border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
          border-radius: 7px;
          padding: 3px 9px;
          margin-top: 14px;
          width: fit-content;
        }

        /* Trading Hub card */
        .card--hub {
          background: linear-gradient(
            165deg,
            rgba(139, 92, 246, 0.16),
            rgba(11, 6, 24, 0.75)
          );
        }

        .card--hub .hub-readout {
          display: flex;
          align-items: baseline;
          gap: 9px;
          margin-top: 11px;
          font-family: 'JetBrains Mono', monospace;
        }

        .card--hub .hub-readout .v {
          font-size: 16.5px;
          font-weight: 600;
          color: #f4f1ff;
        }

        .card--hub .hub-readout .d {
          font-size: 13px;
        }

        .card--hub .hub-chart {
          height: 32px;
          margin-top: 8px;
        }

        .card--hub .hub-chart svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
      `}</style>

      {/* Ambient Canvas Background */}
      <canvas id="atlasAmbient" ref={canvasRef} />

      <div className="atlas-field">
        {/* Market Ticker Marquee */}
        <div className="atlas-ticker-wrap">
          <div className="atlas-ticker-track">
            {[...tickerData, ...tickerData].map((t, idx) => (
              <span className="atlas-tick" key={idx}>
                <span className="sym">{t.sym}</span>
                <span className="val">{t.val}</span>
                <span className={`chg ${t.isUp ? 'up' : 'down'}`}>{t.chg}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Hero Main Section */}
        <div className="atlas-hero">
          {/* Left Column: Heading, Lede, CTA, Trust */}
          <div className="flex flex-col justify-center">
            <span className="atlas-status">
              <span className="dot" />
              AI-powered algo trading is live for Forex &amp; Crypto
            </span>

            <h1>
              Institutional-style market research,{' '}
              <span className="grad">read by a machine that never sleeps</span>
            </h1>

            <p className="lede">
              ATLAS Research Desk fuses live gold, forex and macro data into a
              single AI engine — surfacing the signal institutions trade on, before
              it reaches the headlines.
            </p>

            <div className="atlas-hero-cta">
              <Link href="/pricing" className="atlas-btn atlas-btn-brand atlas-btn-lg">
                Start Trading Now
              </Link>
              <Link
                href="/engine"
                className="atlas-link-secondary group"
              >
                <span className="playdot group-hover:scale-110 transition-transform duration-300">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M6 4L20 12L6 20V4Z" fill="currentColor" />
                  </svg>
                </span>
                <span>See the engine think</span>
              </Link>
            </div>

            <div className="atlas-trust-row">
              <div className="atlas-trust-item">
                <div className="num">2.4M+</div>
                <div className="lbl">signals processed daily</div>
              </div>
              <div className="atlas-trust-item">
                <div className="num">11ms</div>
                <div className="lbl">median inference time</div>
              </div>
              <div className="atlas-trust-item">
                <div className="num">40+</div>
                <div className="lbl">markets covered</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Tilt AI Engine Panel */}
          <div
            className="atlas-engine-tilt"
            ref={tiltWrapRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="atlas-engine" ref={panelRef}>
              <div className="atlas-engine-head">
                <div className="atlas-engine-title">
                  <span className="dot" />
                  ATLAS Engine — XAU/USD live read
                </div>
                <div className="atlas-confidence">
                  {confidence.toFixed(1)}% confidence
                </div>
              </div>

              <div className="atlas-chart-wrap">
                <svg viewBox="0 0 560 240" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="heroLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="55%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#f2b544" />
                    </linearGradient>
                    <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                    <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3.2" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Neural Node Links */}
                  <g>
                    {chartData.connections.map(([x1, y1, x2, y2], idx) => (
                      <line
                        key={idx}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="rgba(155,120,255,0.18)"
                        strokeWidth="1"
                      />
                    ))}
                    {chartData.nodes.map(([cx, cy], idx) => (
                      <circle
                        key={idx}
                        cx={cx}
                        cy={cy}
                        r="2"
                        fill="rgba(196,160,255,0.5)"
                      />
                    ))}
                  </g>

                  {/* Candlesticks Layer */}
                  <g>
                    {chartData.candles.map((c, idx) => (
                      <React.Fragment key={idx}>
                        <line
                          x1={c.cx}
                          x2={c.cx}
                          y1={c.yHi}
                          y2={c.yLo}
                          stroke={
                            c.isUp
                              ? 'rgba(52,211,153,0.55)'
                              : 'rgba(248,113,113,0.55)'
                          }
                          strokeWidth="1"
                        />
                        <rect
                          x={c.cx - 2.6}
                          width={5.2}
                          y={c.yTop}
                          height={Math.max(2, c.yBot - c.yTop)}
                          rx={1}
                          fill={
                            c.isUp
                              ? 'rgba(52,211,153,0.35)'
                              : 'rgba(248,113,113,0.35)'
                          }
                        />
                      </React.Fragment>
                    ))}
                  </g>

                  {/* AI Prediction Curve + Area Fill */}
                  <path
                    ref={areaPathRef}
                    d={chartData.areaD}
                    fill="url(#heroAreaGrad)"
                    opacity="0"
                  />
                  <path
                    ref={linePathRef}
                    d={chartData.smoothD}
                    fill="none"
                    stroke="url(#heroLineGrad)"
                    strokeWidth="2.4"
                    filter="url(#heroGlow)"
                    strokeLinecap="round"
                  />
                  <circle
                    ref={pulseDotRef}
                    r="4.5"
                    fill="#ffffff"
                    opacity="0"
                  />
                </svg>

                {/* Floating Price Pill */}
                <div className="atlas-price-float">
                  <div className="p">{priceVal}</div>
                  <div className={`d ${priceIsUp ? 'up' : 'down'}`}>
                    {priceDelta}
                  </div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="atlas-metrics-row">
                <div className="atlas-metric">
                  <div className="num">{sharpe ? sharpe.toFixed(2) : '—'}</div>
                  <div className="lbl">model sharpe</div>
                </div>
                <div className="atlas-metric">
                  <div className="num">
                    {drawdown ? `${drawdown.toFixed(1)}%` : '—'}
                  </div>
                  <div className="lbl">max drawdown</div>
                </div>
                <div className="atlas-metric">
                  <div className="num">{winRate ? `${Math.round(winRate)}%` : '—'}</div>
                  <div className="lbl">win rate, 90d</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desk Bento 6-Cards Section */}
        <div className="atlas-desk">
          <div className="atlas-desk-head">
            <span className="rule" />
            <h2>One desk, six ways into ATLAS</h2>
            <p>
              Every part of the platform is one click away — the engine that
              generates the signal, the education behind it, and the people who
              built it.
            </p>
          </div>

          <div className="atlas-grid6" ref={deskCardsRef}>
            {/* 1. Features */}
            <Link
              href="/features"
              className="desk-card"
              style={
                {
                  '--accent': '#a78bfa',
                  '--accent-soft': 'rgba(167,139,250,0.12)',
                } as React.CSSProperties
              }
            >
              <div>
                <div className="desk-card-top">
                  <div className="desk-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 19V9m6 10V4m6 15v-7m6 7v-4"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <svg
                    className="card-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 17L17 7M17 7H9M17 7V15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>Features</h3>
                <p>
                  Explore the trading engine, analytics, risk controls, and
                  backtesting suite.
                </p>
              </div>
              <span className="desk-card-tag">ENGINE</span>
            </Link>

            {/* 2. Academy */}
            <Link
              href="/academy"
              className="desk-card"
              style={
                {
                  '--accent': '#f2b544',
                  '--accent-soft': 'rgba(242,181,68,0.12)',
                } as React.CSSProperties
              }
            >
              <div>
                <div className="desk-card-top">
                  <div className="desk-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 3L2 8l10 5 10-5-10-5Z"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>
                  <svg
                    className="card-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 17L17 7M17 7H9M17 7V15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>Academy</h3>
                <p>
                  Learn structured trading, automation workflows, and risk
                  management.
                </p>
              </div>
              <span className="desk-card-tag">LEARN</span>
            </Link>

            {/* 3. Pricing */}
            <Link
              href="/pricing"
              className="desk-card"
              style={
                {
                  '--accent': '#34d399',
                  '--accent-soft': 'rgba(52,211,153,0.12)',
                } as React.CSSProperties
              }
            >
              <div>
                <div className="desk-card-top">
                  <div className="desk-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 12l3-3 4 4 7-7 4 4"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 19h18"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <svg
                    className="card-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 17L17 7M17 7H9M17 7V15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>Pricing</h3>
                <p>Review the current and upcoming plans for your trading workflow.</p>
              </div>
              <span className="desk-card-tag">PLANS</span>
            </Link>

            {/* 4. About */}
            <Link
              href="/about"
              className="desk-card"
              style={
                {
                  '--accent': '#d946ef',
                  '--accent-soft': 'rgba(217,70,239,0.12)',
                } as React.CSSProperties
              }
            >
              <div>
                <div className="desk-card-top">
                  <div className="desk-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="3.4" strokeWidth="1.8" />
                      <path
                        d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <svg
                    className="card-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 17L17 7M17 7H9M17 7V15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>About</h3>
                <p>
                  Understand who ATLAS is and how we approach trading
                  technology.
                </p>
              </div>
              <span className="desk-card-tag">TEAM</span>
            </Link>

            {/* 5. Contact */}
            <Link
              href="/contact"
              className="desk-card"
              style={
                {
                  '--accent': '#60a5fa',
                  '--accent-soft': 'rgba(96,165,250,0.12)',
                } as React.CSSProperties
              }
            >
              <div>
                <div className="desk-card-top">
                  <div className="desk-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 6h16v12H4V6Z"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 7l8 6 8-6"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <svg
                    className="card-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 17L17 7M17 7H9M17 7V15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>Contact</h3>
                <p>Reach support and business teams for help or partnerships.</p>
              </div>
              <span className="desk-card-tag">SUPPORT</span>
            </Link>

            {/* 6. Trading Hub */}
            <Link
              href="/dashboard"
              className="desk-card card--hub"
              style={
                {
                  '--accent': '#8b5cf6',
                  '--accent-soft': 'rgba(139,92,246,0.14)',
                } as React.CSSProperties
              }
            >
              <div>
                <div className="desk-card-top">
                  <div className="desk-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 13l4-4 3 3 6-7 5 5"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <svg
                    className="card-arrow"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 17L17 7M17 7H9M17 7V15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3>Trading Hub</h3>
                <p>
                  Access live automated strategies, portfolio metrics, and broker
                  setups.
                </p>
                <div className="hub-readout">
                  <span className="v">{hubVal}</span>
                  <span
                    className="d"
                    style={{ color: hubIsUp ? '#34d399' : '#f87171' }}
                  >
                    {hubDelta}
                  </span>
                </div>
                <div className="hub-chart">
                  <svg viewBox="0 0 300 40" preserveAspectRatio="none">
                    <path
                      ref={hubSparkRef}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.8"
                      opacity="0.9"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}