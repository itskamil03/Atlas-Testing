'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Cpu,
  Activity,
  Zap,
  ShieldCheck,
  Terminal as TerminalIcon,
  Layers,
  Sparkles,
  ArrowRight,
  Radio,
  CheckCircle2,
  TrendingUp,
  Flame,
  Globe2,
  Crosshair,
  Gauge
} from 'lucide-react';
import { useBookDemoStore } from '@/store/useBookDemoStore';

interface Chapter {
  id: string;
  title: string;
  shortTitle: string;
  tag: string;
  description: string;
  videoSrc: string;
  posterBg: string;
  metrics: {
    latency: string;
    confidence: string;
    riskScore: string;
    processedPerSec: string;
  };
  highlights: string[];
}

const chapters: Chapter[] = [
  {
    id: 'liquidity-sweep',
    title: 'Chapter 01: Neural Order Flow & Microstructure Scanning',
    shortTitle: '01. Liquidity Sweeps',
    tag: 'DEEP L2/L3 ORDER BOOK',
    description:
      'The ATLAS neural core continuously scans Level 2 and Level 3 order books across 40+ liquidity providers to detect institutional spoofing, iceberg orders, and high-probability liquidity sweep setups.',
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterBg: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.4) 0%, rgba(7, 3, 15, 0.95) 75%)',
    metrics: {
      latency: '7.8 ms',
      confidence: '98.4%',
      riskScore: 'Low (0.14)',
      processedPerSec: '420,000 tx/s',
    },
    highlights: [
      'Sub-millisecond iceberg order detection',
      'Real-time retail vs. institutional order flow clustering',
      'Predictive fair-value gap (FVG) and liquidity pool mapping',
    ],
  },
  {
    id: 'macro-nlp',
    title: 'Chapter 02: Multi-Timeframe Macro & NLP Sentiment Ingestion',
    shortTitle: '02. Macro & NLP Ingestion',
    tag: 'REAL-TIME SENTIMENT AGENT',
    description:
      'Synthesizing economic prints, central bank releases, and global financial telemetry within 11ms, translating macro shocks into actionable risk-adjusted trade vectors.',
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterBg: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.35) 0%, rgba(7, 3, 15, 0.95) 75%)',
    metrics: {
      latency: '11.2 ms',
      confidence: '96.8%',
      riskScore: 'Med-Low (0.22)',
      processedPerSec: '180,000 docs/s',
    },
    highlights: [
      'Zero-latency Fed / ECB / BOJ speech semantic parsing',
      'Cross-asset correlation matrix (Gold, US10Y, DXY, Equities)',
      'Algorithmic headline risk filtering to prevent false breakouts',
    ],
  },
  {
    id: 'risk-firewall',
    title: 'Chapter 03: Autonomous Risk Engine & Kelly Sizing Guard',
    shortTitle: '03. Dynamic Risk Firewall',
    tag: 'RISK MANAGEMENT CORE',
    description:
      'Dynamic fractional Kelly position sizing combined with real-time volatility dampening and automated trailing profit optimization for institutional capital preservation.',
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterBg: 'radial-gradient(ellipse at center, rgba(242, 181, 68, 0.35) 0%, rgba(7, 3, 15, 0.95) 75%)',
    metrics: {
      latency: '4.2 ms',
      confidence: '99.1%',
      riskScore: 'Protected (0.08)',
      processedPerSec: '500,000 checks/s',
    },
    highlights: [
      'Fractional Kelly criterion position sizing adaptation',
      'Real-time circuit breaker on unusual volatility spikes',
      'Dynamic risk-reward scaling with adaptive trailing stops',
    ],
  },
  {
    id: 'hft-execution',
    title: 'Chapter 04: Sub-Millisecond Execution & Liquidity Aggregation',
    shortTitle: '04. Ultra-Low Latency Execution',
    tag: 'SMART ROUTING ENGINE',
    description:
      'Smart Order Routing (SOR) directly interfaced with tier-1 prime brokers and ECN bridges to guarantee sub-millisecond execution with virtually zero slippage.',
    videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    posterBg: 'radial-gradient(ellipse at center, rgba(52, 211, 153, 0.35) 0%, rgba(7, 3, 15, 0.95) 75%)',
    metrics: {
      latency: '3.6 ms',
      confidence: '99.6%',
      riskScore: 'Optimal (0.05)',
      processedPerSec: '850,000 ops/s',
    },
    highlights: [
      'Direct FIX protocol connection to Tier-1 liquidity venues',
      'Anti-slippage intelligent order slicing',
      'Instant post-trade verification and telemetry recording',
    ],
  },
];

interface LogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'SIGNAL' | 'ALERT' | 'EXEC';
  text: string;
  source: string;
}

const mockInitialLogs: LogEntry[] = [
  { id: '1', time: '14:20:01.104', level: 'INFO', source: 'L2_FEED', text: 'Ingested 14,280 depth levels on XAU/USD from 6 ECNs.' },
  { id: '2', time: '14:20:01.112', level: 'ALERT', source: 'SWEEP_DETECT', text: 'Detected iceberg accumulation of 185 lots @ $2,183.20.' },
  { id: '3', time: '14:20:01.118', level: 'INFO', source: 'NEURAL_CORE', text: 'Computing 50,000 Monte Carlo trajectory weights (v4.9 tensor engine).' },
  { id: '4', time: '14:20:01.124', level: 'SIGNAL', source: 'PREDICTION_AI', text: 'High-conviction BUY confirmed | Target: $2,192.50 | Invalidation: $2,179.80.' },
  { id: '5', time: '14:20:01.130', level: 'EXEC', source: 'ROUTER_FIX', text: 'Order dispatched to Prime Liquidity Pool #2. Fill latency: 5.4ms.' },
];

export default function EngineShowcase() {
  const openDemoModal = useBookDemoStore((s) => s.openDemoModal);

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [showHudOverlay, setShowHudOverlay] = useState(true);
  const [liveConfidence, setLiveConfidence] = useState(98.4);
  const [liveLatency, setLiveLatency] = useState(8.2);
  const [activeSignal, setActiveSignal] = useState('STRONG BUY');

  // Logs & Simulator State
  const [logs, setLogs] = useState<LogEntry[]>(mockInitialLogs);
  const [isLiveLogActive, setIsLiveLogActive] = useState(true);
  const [activeSimulatorEvent, setActiveSimulatorEvent] = useState<string | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Synaptic Canvas Ref
  const neuralCanvasRef = useRef<HTMLCanvasElement>(null);

  const currentChapter = chapters[activeChapterIndex];

  // 1. Synaptic Neural Canvas Animation
  useEffect(() => {
    const canvas = neuralCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 200;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodesCount = 28;
    const nodes: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulse: number;
      pulseSpeed: number;
      color: string;
    }[] = [];

    const colors = ['#a78bfa', '#818cf8', '#34d399', '#f2b544'];

    for (let i = 0; i < nodesCount; i++) {
      nodes.push({
        x: Math.random() * (canvas.width || 300),
        y: Math.random() * (canvas.height || 200),
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.5 + 2,
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.03 + Math.random() * 0.04,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.4;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Synaptic particle impulse along line
            if (Math.random() < 0.05) {
              const t = (Date.now() % 2000) / 2000;
              const px = nodes[i].x + (nodes[j].x - nodes[i].x) * t;
              const py = nodes[i].y + (nodes[j].y - nodes[i].y) * t;
              ctx.beginPath();
              ctx.fillStyle = '#34d399';
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw Nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += node.pulseSpeed;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        const currentRadius = node.radius + Math.sin(node.pulse) * 1.2;

        ctx.beginPath();
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8;
        ctx.arc(node.x, node.y, Math.max(1, currentRadius), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 2. Video Player Logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackSpeed;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) setDuration(video.duration);
    };

    const handleEnded = () => {
      // Advance chapter or loop
      if (activeChapterIndex < chapters.length - 1) {
        setActiveChapterIndex((prev) => prev + 1);
      } else {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeChapterIndex, playbackSpeed]);

  // Handle Chapter Switch
  const selectChapter = (index: number) => {
    setActiveChapterIndex(index);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const changeSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  // 3. Live Log Generator & Telemetry Ticking
  useEffect(() => {
    if (!isLiveLogActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      const timeStr = now.toTimeString().split(' ')[0] + '.' + ms;

      const randomEvents: { level: 'INFO' | 'SIGNAL' | 'ALERT' | 'EXEC'; source: string; text: string }[] = [
        { level: 'INFO', source: 'NEURAL_NODE_7', text: 'Synaptic weight recalculated: +0.48 correlation on XAU/DXY inversion.' },
        { level: 'SIGNAL', source: 'ORDER_FLOW', text: 'Liquidity imbalance detected (+68% aggressive buy delta on EUR/USD).' },
        { level: 'INFO', source: 'VOL_SCAN', text: 'Implied volatility compressed to 11.4th percentile; breakout imminent.' },
        { level: 'EXEC', source: 'ROUTER', text: 'Micro-hedging position size adjusted via fractional Kelly threshold.' },
        { level: 'ALERT', source: 'FIREWALL', text: 'High-frequency spread spike safely filtered (4.1 pips → rejected).' },
        { level: 'INFO', source: 'L3_INGEST', text: 'Aggregated 28,400 bid/ask ticks across Tier-1 ECNs.' },
      ];

      const chosen = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      const newEntry: LogEntry = {
        id: Math.random().toString(),
        time: timeStr,
        ...chosen,
      };

      setLogs((prev) => [...prev.slice(-40), newEntry]);

      // Dynamic metrics wiggle
      setLiveConfidence((prev) => +(98 + (Math.random() * 1.5 - 0.75)).toFixed(1));
      setLiveLatency((prev) => +(7.5 + (Math.random() * 1.6)).toFixed(1));

      // Auto scroll logs
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isLiveLogActive]);

  // 4. Interactive Simulator Event Handler
  const triggerSimulationEvent = (eventTitle: string) => {
    setActiveSimulatorEvent(eventTitle);
    const now = new Date();
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    const timeStr = now.toTimeString().split(' ')[0] + '.' + ms;

    const eventLogs: Record<string, LogEntry[]> = {
      'Fed Rate Decision Shock': [
        { id: Math.random().toString(), time: timeStr, level: 'ALERT', source: 'MACRO_NLP', text: '⚡ FED ANNOUNCEMENT INGESTED IN 6.8ms: 25bps cut matches model expectation.' },
        { id: Math.random().toString(), time: timeStr, level: 'SIGNAL', source: 'NEURAL_DECISION', text: 'Target Gold rally acceleration vector. Conviction: 99.4%.' },
        { id: Math.random().toString(), time: timeStr, level: 'EXEC', source: 'AUTO_EXEC', text: 'Dispatched automated multi-tranche buy order. Invalidation dynamically raised.' },
      ],
      'Whale Liquidity Cascade': [
        { id: Math.random().toString(), time: timeStr, level: 'ALERT', source: 'L3_ANOMALY', text: '🐋 WHALE LIQUIDITY DUMP DETECTED: 850 lots absorbed @ key institutional support.' },
        { id: Math.random().toString(), time: timeStr, level: 'INFO', source: 'RISK_GUARD', text: 'Rebalancing dynamic delta hedging. Slippage tolerance clamped to 0.1 pip.' },
        { id: Math.random().toString(), time: timeStr, level: 'SIGNAL', source: 'REVERSAL_AI', text: 'Mean-reversion spring confirmed. Sizing 2.2x Kelly factor.' },
      ],
      'Gold Flash Breakout': [
        { id: Math.random().toString(), time: timeStr, level: 'SIGNAL', source: 'MOMENTUM_CORE', text: '🔥 GOLD BROKE 4-HOUR RESISTANCE WITH 4.2x VOLUME CONVERGENCE.' },
        { id: Math.random().toString(), time: timeStr, level: 'EXEC', source: 'TRAILING_STOP', text: 'Activated algorithmic profit trailing engine (+48 pips secured).' },
      ],
    };

    const triggeredLogs = eventLogs[eventTitle] || [
      { id: Math.random().toString(), time: timeStr, level: 'SIGNAL', source: 'SIMULATOR', text: `Engine processed simulation scenario [${eventTitle}] in 8.1ms.` },
    ];

    setLogs((prev) => [...prev, ...triggeredLogs]);
    setActiveSignal(eventTitle.includes('Whale') ? 'ACCUMULATE' : eventTitle.includes('Gold') ? 'BUY ACCELERATION' : 'MACRO DIVERGENCE');

    setTimeout(() => {
      setActiveSimulatorEvent(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-[#07030f] text-[#f4f1ff] font-sans relative overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[650px] h-[650px] bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[180px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-24">
        {/* Top Status Indicator */}
        <div className="flex items-center justify-end mb-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wide shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE NEURAL CORE V4.9 ONLINE</span>
            <span className="text-purple-300/40">|</span>
            <span className="text-purple-200 font-semibold">{liveLatency}ms latency</span>
          </div>
        </div>

        {/* Hero Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Interactive AI Engine Demonstration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white mb-4">
            See the{' '}
            <span className="bg-gradient-to-r from-purple-300 via-fuchsia-200 to-amber-200 bg-clip-text text-transparent">
              Engine Think
            </span>{' '}
            in Real-Time
          </h1>

          <p className="text-base sm:text-lg text-purple-200/70 max-w-2xl mx-auto leading-relaxed">
            Watch our proprietary deep reinforcement neural model ingest multi-asset liquidity, calculate 50,000 Monte Carlo paths, and execute institutional signals in sub-11ms.
          </p>
        </div>

        {/* Chapter Selection Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
          {chapters.map((chap, idx) => {
            const isActive = activeChapterIndex === idx;
            return (
              <button
                key={chap.id}
                onClick={() => selectChapter(idx)}
                className={`group relative text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-purple-950/40 border-purple-500/60 shadow-[0_0_25px_rgba(139,92,246,0.25)]'
                    : 'bg-black/30 border-purple-500/15 hover:border-purple-500/35 hover:bg-purple-950/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-mono tracking-wider font-semibold ${isActive ? 'text-purple-300' : 'text-purple-400/60'}`}>
                    {chap.shortTitle}
                  </span>
                  {isActive ? (
                    <span className="flex h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
                  ) : (
                    <Play className="w-3 h-3 text-purple-400/40 group-hover:text-purple-300 transition-colors" />
                  )}
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/90 line-clamp-1 group-hover:text-white">
                  {chap.title.split(': ')[1] || chap.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN VIDEO PLAYER WITH HOLOGRAPHIC HUD FRAME */}
        <div
          ref={videoContainerRef}
          className="relative rounded-2xl border border-purple-500/30 bg-[#0d071e]/90 backdrop-blur-xl p-2 sm:p-4 shadow-[0_20px_60px_-15px_rgba(112,26,179,0.45)] mb-10 overflow-hidden"
        >
          {/* Outer Cyber Corner Accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-400 z-30 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-purple-400 z-30 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-400 z-30 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-purple-400 z-30 pointer-events-none" />

          {/* Video Display Container */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/80 flex items-center justify-center group">
            {/* Scanlines Overlay */}
            {scanlinesEnabled && (
              <div
                className="absolute inset-0 pointer-events-none z-20 opacity-25"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 2px, transparent 2px, transparent 4px)',
                }}
              />
            )}

            {/* Video Element */}
            <video
              ref={videoRef}
              src={currentChapter.videoSrc}
              muted={isMuted}
              autoPlay
              loop
              playsInline
              className="w-full h-full object-cover relative z-10"
              style={{ background: currentChapter.posterBg }}
            />

            {/* Simulated Live Laser Scanning HUD */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] z-20 animate-[scan_4s_linear_infinite] pointer-events-none" />

            {/* Top HUD Telemetry Watermark */}
            {showHudOverlay && (
              <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 z-25 flex items-start justify-between pointer-events-none">
                {/* Left Telemetry */}
                <div className="bg-black/65 backdrop-blur-md border border-purple-500/30 rounded-lg p-2 sm:p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-purple-200 font-semibold">
                      TELEMETRY FEED • {currentChapter.tag}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-purple-300/80">
                    LATENCY: <span className="text-emerald-400 font-bold">{liveLatency} ms</span> | DEPTH: <span className="text-purple-200">50K Trajectories</span>
                  </div>
                </div>

                {/* Right Signal Box */}
                <div className="bg-black/65 backdrop-blur-md border border-purple-500/30 rounded-lg p-2 sm:p-3 text-right">
                  <div className="text-[10px] font-mono text-purple-400/80 uppercase">AI Conviction Score</div>
                  <div className="text-sm sm:text-base font-mono font-bold text-emerald-400 flex items-center justify-end gap-1.5">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <span>{liveConfidence}%</span>
                  </div>
                  <div className="text-[10px] font-mono text-amber-300 font-semibold">
                    {activeSignal}
                  </div>
                </div>
              </div>
            )}

            {/* Center Play Button Overlay on Hover/Paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-purple-600/60 border border-purple-400/80 backdrop-blur-md flex items-center justify-center text-white shadow-[0_0_35px_rgba(168,85,247,0.6)] z-25 transition-transform hover:scale-110"
              >
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              </button>
            )}

            {/* Bottom HUD Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-25 flex flex-col gap-2">
              {/* Timeline Scrubber */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-purple-300/80 min-w-[36px]">
                  {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 60}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-purple-900/60 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
                <span className="text-[11px] font-mono text-purple-400/60 min-w-[36px]">
                  {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 sm:p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1.5 sm:p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Speed Selector */}
                  <button
                    onClick={changeSpeed}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-mono font-semibold transition-colors"
                    title="Playback Rate"
                  >
                    {playbackSpeed}x SPEED
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Scanlines Toggle */}
                  <button
                    onClick={() => setScanlinesEnabled(!scanlinesEnabled)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      scanlinesEnabled
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-purple-500/10 text-purple-400/60'
                    }`}
                    title="Toggle CRT Scanline HUD"
                  >
                    SCANLINES
                  </button>

                  {/* HUD Overlays Toggle */}
                  <button
                    onClick={() => setShowHudOverlay(!showHudOverlay)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      showHudOverlay
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                        : 'bg-purple-500/10 text-purple-400/60'
                    }`}
                    title="Toggle HUD Telemetry"
                  >
                    HUD {showHudOverlay ? 'ON' : 'OFF'}
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 sm:p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white transition-colors"
                    title="Toggle Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Current Chapter Info Strip */}
          <div className="mt-4 p-3 sm:p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  Active Module:
                </span>
                <span className="text-sm sm:text-base font-semibold text-white">
                  {currentChapter.title}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-200/70 max-w-3xl">
                {currentChapter.description}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-purple-500/20 pt-3 md:pt-0 md:pl-6 shrink-0">
              <div>
                <div className="text-[10px] font-mono text-purple-400 uppercase">Throughput</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-white">
                  {currentChapter.metrics.processedPerSec}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-purple-400 uppercase">Risk Level</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-emerald-400">
                  {currentChapter.metrics.riskScore}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-COLUMN LIVE ENGINE TELEMETRY DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Col 1: Synaptic Neural Network Matrix (4 Cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-purple-500/20 bg-[#0d071e]/80 backdrop-blur-md p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Synaptic Tensor Mesh</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  FIRING ACTIVE
                </span>
              </div>

              {/* Canvas Visualizer Container */}
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-black/40 border border-purple-500/15 mb-4">
                <canvas ref={neuralCanvasRef} className="w-full h-full block" />
                <div className="absolute bottom-2 left-2 text-[10px] font-mono text-purple-300/60 bg-black/70 px-1.5 py-0.5 rounded">
                  Layer 4: Attention Head #12
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-purple-200/80">
                <div className="flex justify-between items-center py-1 border-b border-purple-500/10">
                  <span className="text-purple-400">Parameter Capacity:</span>
                  <span className="font-mono font-semibold text-white">1.8 Billion Weights</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-purple-500/10">
                  <span className="text-purple-400">Inference Latency:</span>
                  <span className="font-mono font-semibold text-emerald-400">{liveLatency} ms median</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-purple-500/10">
                  <span className="text-purple-400">Monte Carlo Branches:</span>
                  <span className="font-mono font-semibold text-purple-200">50,000 sim/sec</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-purple-400">Overfit Protection:</span>
                  <span className="font-mono font-semibold text-emerald-400">Ensemble Regularized</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-500/20">
              <div className="text-[11px] text-purple-300/60 italic">
                Engine synchronizes weight adjustments every 60 seconds against live order flow.
              </div>
            </div>
          </div>

          {/* Col 2: Real-time Step-by-Step Reasoning Terminal (5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-purple-500/20 bg-[#0a0518]/90 backdrop-blur-md p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <TerminalIcon className="w-4 h-4 text-purple-400" />
                <span>AI Reasoning Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLiveLogActive(!isLiveLogActive)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                    isLiveLogActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-purple-500/10 text-purple-400/60'
                  }`}
                >
                  {isLiveLogActive ? 'STREAMING' : 'PAUSED'}
                </button>
                <button
                  onClick={() => setLogs([])}
                  className="text-[10px] font-mono text-purple-400/60 hover:text-purple-300 transition-colors"
                >
                  CLEAR
                </button>
              </div>
            </div>

            {/* Log Terminal Window */}
            <div
              ref={logContainerRef}
              className="flex-1 min-h-[260px] max-h-[300px] overflow-y-auto bg-black/60 rounded-xl p-3 border border-purple-500/15 font-mono text-xs space-y-2 scrollbar-thin scrollbar-thumb-purple-900"
            >
              {logs.map((log) => {
                let badgeColor = 'text-purple-300 bg-purple-500/10 border-purple-500/20';
                if (log.level === 'SIGNAL') badgeColor = 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
                if (log.level === 'ALERT') badgeColor = 'text-amber-300 bg-amber-500/10 border-amber-500/30';
                if (log.level === 'EXEC') badgeColor = 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30';

                return (
                  <div key={log.id} className="leading-tight animate-fade-in flex items-start gap-2">
                    <span className="text-[10px] text-purple-400/50 shrink-0 select-none">
                      {log.time}
                    </span>
                    <span className={`text-[9px] px-1 py-0.2 rounded border font-semibold shrink-0 ${badgeColor}`}>
                      {log.level}
                    </span>
                    <span className="text-purple-100/90 break-words">
                      <span className="text-purple-400/80 font-semibold">[{log.source}]</span> {log.text}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5 text-purple-400/60 text-[11px] pt-1">
                <span className="inline-block w-2 h-3.5 bg-purple-400 animate-pulse" />
                <span>Processing live order flow stream...</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-purple-400/70">
              <span>BUFFER: 40 EVENTS</span>
              <span>FILTER: ALL TIERS</span>
            </div>
          </div>

          {/* Col 3: Real-Time Order Flow Heatmap & Volatility Radar (3 Cols) */}
          <div className="lg:col-span-3 rounded-2xl border border-purple-500/20 bg-[#0d071e]/80 backdrop-blur-md p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Execution Gauge</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400">XAU/USD</span>
              </div>

              {/* Simulated Order Book Depth */}
              <div className="space-y-2 mb-4 font-mono text-xs">
                <div className="text-[10px] text-purple-400/70 uppercase">L2 Liquidity Imbalance</div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400">Bids: 64.2%</span>
                    <span className="text-red-400">Asks: 35.8%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-red-500/40 flex">
                    <div className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" style={{ width: '64.2%' }} />
                  </div>
                </div>
              </div>

              {/* Key Quantitative Stats */}
              <div className="space-y-3 pt-2 border-t border-purple-500/15">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300/70">Sharpe Ratio:</span>
                  <span className="font-mono font-bold text-white">2.84</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300/70">Profit Factor:</span>
                  <span className="font-mono font-bold text-emerald-400">3.12</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300/70">Historical Win Rate:</span>
                  <span className="font-mono font-bold text-purple-200">74.2%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300/70">Max Peak Drawdown:</span>
                  <span className="font-mono font-bold text-emerald-400">4.8%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-500/20">
              <button
                onClick={openDemoModal}
                className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Request Custom Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* INTERACTIVE STRESS-TEST SCENARIO SIMULATOR */}
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#130a2a]/90 via-[#0d071e]/90 to-[#07030f]/90 p-6 sm:p-8 backdrop-blur-xl mb-12 shadow-[0_15px_50px_rgba(139,92,246,0.15)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Interactive Stress-Test Sandbox</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Inject Market Volatility into the AI Model
              </h3>
              <p className="text-sm text-purple-200/70">
                Click any scenario below to trigger a live macroeconomic or liquidity event and watch how the ATLAS neural engine responds within 10 milliseconds.
              </p>
            </div>

            {activeSimulatorEvent && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-mono animate-pulse">
                <Radio className="w-4 h-4 text-amber-400 animate-spin" />
                <span>INJECTING: {activeSimulatorEvent}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => triggerSimulationEvent('Fed Rate Decision Shock')}
              className="p-4 rounded-xl bg-black/40 border border-purple-500/20 hover:border-purple-400/60 hover:bg-purple-950/30 text-left transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-purple-400 font-semibold">EVENT 01</span>
                <Globe2 className="w-4 h-4 text-purple-400 group-hover:text-purple-200 transition-colors" />
              </div>
              <div className="text-sm font-semibold text-white mb-1 group-hover:text-purple-200">
                Fed 50bps Unexpected Cut
              </div>
              <div className="text-xs text-purple-300/60 leading-relaxed">
                Test macro NLP parsing of surprise dovish policy statement & cross-asset repricing.
              </div>
            </button>

            <button
              onClick={() => triggerSimulationEvent('Whale Liquidity Cascade')}
              className="p-4 rounded-xl bg-black/40 border border-purple-500/20 hover:border-purple-400/60 hover:bg-purple-950/30 text-left transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-purple-400 font-semibold">EVENT 02</span>
                <Crosshair className="w-4 h-4 text-purple-400 group-hover:text-purple-200 transition-colors" />
              </div>
              <div className="text-sm font-semibold text-white mb-1 group-hover:text-purple-200">
                Whale 850 Lot Liquidation
              </div>
              <div className="text-xs text-purple-300/60 leading-relaxed">
                Observe anti-slippage order shielding and counter-trend absorption positioning.
              </div>
            </button>

            <button
              onClick={() => triggerSimulationEvent('Gold Flash Breakout')}
              className="p-4 rounded-xl bg-black/40 border border-purple-500/20 hover:border-purple-400/60 hover:bg-purple-950/30 text-left transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-purple-400 font-semibold">EVENT 03</span>
                <TrendingUp className="w-4 h-4 text-purple-400 group-hover:text-purple-200 transition-colors" />
              </div>
              <div className="text-sm font-semibold text-white mb-1 group-hover:text-purple-200">
                Gold 4H Resistance Breakout
              </div>
              <div className="text-xs text-purple-300/60 leading-relaxed">
                Watch dynamic Kelly sizing scale tranches into aggressive momentum continuation.
              </div>
            </button>
          </div>
        </div>

        {/* INSTITUTIONAL ARCHITECTURE SPECIFICATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          <div className="p-5 rounded-2xl border border-purple-500/20 bg-black/30 backdrop-blur-md">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Ultra-Low Latency</h4>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Equinix NY4 & LD4 co-located execution nodes ensuring sub-11ms signal dispatch.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-purple-500/20 bg-black/30 backdrop-blur-md">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Multi-Venue Aggregation</h4>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Consolidated liquidity from 40+ Tier-1 ECNs and institutional liquidity providers.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-purple-500/20 bg-black/30 backdrop-blur-md">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Autonomous Risk Guard</h4>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Hardcoded black-swan circuit breakers and automatic volatility dampening.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-purple-500/20 bg-black/30 backdrop-blur-md">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white mb-1">Audited Performance</h4>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Independently verified track record across Gold, Forex pairs, and macro indices.
            </p>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION BANNER */}
        <div className="relative rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/40 p-8 sm:p-12 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25)_0%,transparent_70%)]" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Ready to Trade with the Power of the ATLAS Engine?
            </h2>
            <p className="text-sm sm:text-base text-purple-200/80">
              Join elite traders and institutions capitalizing on institutional-grade AI signals and automated trade execution.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/pricing"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all transform hover:scale-105"
              >
                Start Trading Now
              </Link>
              <button
                type="button"
                onClick={openDemoModal}
                className="px-7 py-3.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 font-semibold text-sm transition-all"
              >
                Book Institutional Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
