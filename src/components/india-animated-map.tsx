"use client";

import { useEffect, useRef, useState } from "react";

type GeoPolygon = [number, number][];

type CityDef = [string, number, number, boolean, boolean, boolean];

type CityPoint = {
  name: string;
  pos: [number, number];
  isMajor: boolean;
  isCapital: boolean;
  isUserCity: boolean;
};

const CITIES: CityDef[] = [
  ["New Delhi ★", 77.21, 28.63, true, true, false],
  ["Mumbai", 72.88, 19.08, true, false, false],
  ["Kolkata", 88.36, 22.57, true, false, false],
  ["Chennai", 80.27, 13.08, true, false, false],
  ["Bengaluru", 77.60, 12.97, false, false, false],
  ["Hyderabad", 78.48, 17.38, false, false, false],
  ["Ahmedabad", 72.58, 23.03, false, false, false],
  ["Jaipur", 75.79, 26.91, false, false, false],
  ["Pune", 73.85, 18.52, false, false, false],
  ["Patna ◆", 85.14, 25.59, true, false, true],
];

const ROUTES: [number, number, string][] = [
  [0, 1, "#a78bfa"],
  [0, 2, "#f472b6"],
  [1, 3, "#34d399"],
];

const MIN_LON = 67.5;
const MAX_LON = 98.5;
const MIN_LAT = 7.5;
const MAX_LAT = 36.5;
const W = 680;
const H = 760;
const PAD = 50;

function project(lon: number, lat: number): [number, number] {
  const x = PAD + ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * (W - PAD * 2);
  const y = H - PAD - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * (H - PAD * 2);
  return [x, y];
}

export default function IndiaAnimatedMap() {
  const [geoPolygons, setGeoPolygons] = useState<GeoPolygon[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;

    fetch("/india-composite.geojson")
      .then((res) => res.json())
      .then((data) => {
        const polygons: GeoPolygon[] = [];
        (data.features ?? []).forEach((feature: any) => {
          const geom = feature.geometry;
          if (!geom) return;
          if (geom.type === "Polygon") {
            geom.coordinates.forEach((ring: any) => {
              polygons.push(ring as GeoPolygon);
            });
          }
          if (geom.type === "MultiPolygon") {
            geom.coordinates.forEach((poly: any) => {
              poly.forEach((ring: any) => polygons.push(ring as GeoPolygon));
            });
          }
        });
        if (isMounted && polygons.length) {
          setGeoPolygons(polygons);
        }
      })
      .catch(() => {
        // Keep fallback geometry if geojson load fails.
      });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const cityPositions: CityPoint[] = CITIES.map(
      ([name, lon, lat, isMajor, isCapital, isUserCity]) => ({
        name,
        pos: project(lon, lat),
        isMajor,
        isCapital,
        isUserCity,
      })
    );

    let offset = 0;
    let pulse = 0;

    function drawPoly(
      pts: GeoPolygon,
      strokeColor: string,
      fillColor: string | null,
      lineWidth = 1.8
    ) {
      ctx.beginPath();
      pts.forEach(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    function drawRoute(fromIdx: number, toIdx: number, color: string, dashOff: number) {
      const [x1, y1] = cityPositions[fromIdx].pos;
      const [x2, y2] = cityPositions[toIdx].pos;
      const cx = (x1 + x2) / 2 + (y2 - y1) * 0.15;
      const cy = (y1 + y2) / 2 - (x2 - x1) * 0.15;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx, cy, x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([10, 6]);
      ctx.lineDashOffset = -dashOff;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
    }

    function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.shadowColor = "#4f46e544";
      ctx.shadowBlur = 28;
      if (geoPolygons.length) {
        geoPolygons.forEach((poly) => drawPoly(poly, "#8b80c8", "#161428", 2));
      } else {
        drawPoly(
          [
            [77.84, 35.49],
            [78.91, 34.32],
            [78.73, 31.52],
            [79.72, 30.88],
            [81.11, 30.18],
            [80.48, 29.73],
            [80.09, 28.83],
            [81.03, 27.93],
            [81.9, 27.31],
            [83.03, 27.46],
            [84.1, 27.24],
            [84.67, 27.04],
            [85.25, 26.74],
            [86.02, 26.63],
            [87.23, 26.4],
            [88.04, 26.42],
            [88.17, 26.81],
            [88.88, 27.1],
            [88.76, 27.83],
            [88.14, 28.08],
            [88.63, 28.08],
            [89.58, 28.31],
            [90.27, 28.07],
            [91.21, 27.77],
            [91.99, 27.47],
            [92.06, 26.88],
            [92.56, 27],
            [93.41, 26.87],
            [94.14, 27.4],
            [95.12, 27.86],
            [95.19, 26.58],
            [96.6, 27.35],
            [97.41, 27.09],
            [97.13, 26.08],
            [97.02, 24.82],
            [96.19, 23.9],
            [95.01, 23.26],
            [94.56, 22.09],
            [94.03, 22.5],
            [93.31, 23.62],
            [93.19, 24.08],
            [92.67, 24.36],
            [92.15, 23.64],
            [91.46, 22.83],
            [91.28, 24.08],
            [90.44, 21.97],
            [89.58, 22.06],
            [88.76, 21.91],
            [88.08, 21.67],
            [86.97, 21.5],
            [86.76, 20.26],
            [85.33, 19.48],
            [84.19, 18.35],
            [83.52, 17.99],
            [82.19, 17.01],
            [82.28, 16.56],
            [80.96, 15.89],
            [80.5, 15],
            [80.33, 13.83],
            [79.86, 10.36],
            [79.1, 9.11],
            [78.28, 8.67],
            [77.94, 8.25],
            [77.37, 8.23],
            [76.59, 8.9],
            [76.26, 10.36],
            [75.74, 11.31],
            [75.74, 12.2],
            [74.86, 13.12],
            [74.62, 14.46],
            [74.24, 15.21],
            [73.83, 15.31],
            [72.79, 15.95],
            [72.65, 17.34],
            [72.89, 18.76],
            [72.66, 20.24],
            [72.11, 21.07],
            [70.87, 21.6],
            [69.79, 21.97],
            [68.13, 23.65],
            [68.37, 24.98],
            [68.91, 25.8],
            [70.09, 25.4],
            [70.65, 25.42],
            [71, 26.06],
            [70.28, 26.91],
            [70.17, 27.97],
            [69.52, 27.99],
            [70.12, 29],
            [69.87, 29.56],
            [70.67, 29.74],
            [71.61, 29.59],
            [71.99, 30.25],
            [72.42, 31],
            [72.32, 32.05],
            [71.81, 32.76],
            [73.45, 33.84],
            [74.25, 34.44],
            [75.76, 35.35],
            [76.77, 35.66],
            [77.84, 35.49],
          ],
          "#8b80c8",
          "#161428",
          2
        );
      }
      ctx.restore();

      if (geoPolygons.length) {
        geoPolygons.forEach((poly) => drawPoly(poly, "#7c77a8", null, 1.8));
      } else {
        drawPoly(
          [
            [77.84, 35.49],
            [78.91, 34.32],
            [78.73, 31.52],
            [79.72, 30.88],
            [81.11, 30.18],
            [80.48, 29.73],
            [80.09, 28.83],
            [81.03, 27.93],
            [81.9, 27.31],
            [83.03, 27.46],
            [84.1, 27.24],
            [84.67, 27.04],
            [85.25, 26.74],
            [86.02, 26.63],
            [87.23, 26.4],
            [88.04, 26.42],
            [88.17, 26.81],
            [88.88, 27.1],
            [88.76, 27.83],
            [88.14, 28.08],
            [88.63, 28.08],
            [89.58, 28.31],
            [90.27, 28.07],
            [91.21, 27.77],
            [91.99, 27.47],
            [92.06, 26.88],
            [92.56, 27],
            [93.41, 26.87],
            [94.14, 27.4],
            [95.12, 27.86],
            [95.19, 26.58],
            [96.6, 27.35],
            [97.41, 27.09],
            [97.13, 26.08],
            [97.02, 24.82],
            [96.19, 23.9],
            [95.01, 23.26],
            [94.56, 22.09],
            [94.03, 22.5],
            [93.31, 23.62],
            [93.19, 24.08],
            [92.67, 24.36],
            [92.15, 23.64],
            [91.46, 22.83],
            [91.28, 24.08],
            [90.44, 21.97],
            [89.58, 22.06],
            [88.76, 21.91],
            [88.08, 21.67],
            [86.97, 21.5],
            [86.76, 20.26],
            [85.33, 19.48],
            [84.19, 18.35],
            [83.52, 17.99],
            [82.19, 17.01],
            [82.28, 16.56],
            [80.96, 15.89],
            [80.5, 15],
            [80.33, 13.83],
            [79.86, 10.36],
            [79.1, 9.11],
            [78.28, 8.67],
            [77.94, 8.25],
            [77.37, 8.23],
            [76.59, 8.9],
            [76.26, 10.36],
            [75.74, 11.31],
            [75.74, 12.2],
            [74.86, 13.12],
            [74.62, 14.46],
            [74.24, 15.21],
            [73.83, 15.31],
            [72.79, 15.95],
            [72.65, 17.34],
            [72.89, 18.76],
            [72.66, 20.24],
            [72.11, 21.07],
            [70.87, 21.6],
            [69.79, 21.97],
            [68.13, 23.65],
            [68.37, 24.98],
            [68.91, 25.8],
            [70.09, 25.4],
            [70.65, 25.42],
            [71, 26.06],
            [70.28, 26.91],
            [70.17, 27.97],
            [69.52, 27.99],
            [70.12, 29],
            [69.87, 29.56],
            [70.67, 29.74],
            [71.61, 29.59],
            [71.99, 30.25],
            [72.42, 31],
            [72.32, 32.05],
            [71.81, 32.76],
            [73.45, 33.84],
            [74.25, 34.44],
            [75.76, 35.35],
            [76.77, 35.66],
            [77.84, 35.49],
          ],
          "#7c77a8",
          null,
          1.8
        );
      }
      ctx.restore();

      const [slx, sly] = project(80.7, 8.0);
      ctx.beginPath();
      ctx.ellipse(slx, sly, 12, 18, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#7c77a8";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      [[93.0, 13.0], [93.1, 12.0], [93.2, 11.0]].forEach(([lon, lat], i) => {
        const [ax, ay] = project(lon, lat);
        ctx.beginPath();
        ctx.arc(ax, ay, 3 + i * 0.4, 0, Math.PI * 2);
        ctx.strokeStyle = "#7c77a8";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      ctx.save();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = "#2a2a40";
      ctx.lineWidth = 0.8;
      [
        [[72.5, 24.5], [74, 24], [76, 23.5], [78, 22.5]],
        [[78, 22.5], [82, 22], [84, 22.5], [86, 22]],
        [[78, 28], [80, 27], [82, 26.5], [84, 26], [86, 25.5]],
      ].forEach((line) => {
        ctx.beginPath();
        line.forEach(([lon, lat], i) => {
          const [x, y] = project(lon, lat);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
      ctx.restore();

      offset = (offset + 0.5) % 32;
      ROUTES.forEach(([f, t, c], i) => drawRoute(f, t, c, offset + i * 10));

      pulse = (pulse + 0.025) % 1;
      cityPositions.forEach(({ name, pos: [x, y], isMajor, isUserCity }) => {
        const color = isUserCity ? "#fbbf24" : isMajor ? "#a78bfa" : "#8b7fd4";
        const radius = isMajor ? 6 : 4.5;

        const pr = radius + pulse * 15;
        const pa = Math.max(0, 0.75 - pulse);
        ctx.beginPath();
        ctx.arc(x, y, pr, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = pa;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.font = `${isUserCity || isMajor ? "600" : "400"} ${isUserCity ? 13 : isMajor ? 12 : 11}px sans-serif`;
        ctx.fillStyle = isUserCity ? "#fbbf24" : "#ddd8f8";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 5;

        let lx = x + 10;
        let ly = y + 4;
        if (name.includes("Ahmedabad")) { lx = x - 88; }
        if (name.includes("Jaipur")) { lx = x - 58; }
        if (name.includes("Hyderabad")) { lx = x - 90; }
        if (name.includes("Bengaluru")) { lx = x + 10; }
        if (name.includes("Mumbai")) { lx = x - 72; }
        if (name.includes("Pune")) { lx = x - 46; }

        ctx.fillText(name, lx, ly);
        ctx.shadowBlur = 0;
      });

      ctx.fillStyle = "rgba(12,12,22,0.88)";
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 0.6;
      roundRect(ctx, 28, W * 0.88, 210, 138, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = "600 13px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText("Legend", 44, W * 0.88 + 22);

      const legendItems = [
        { color: "#a78bfa", label: "Major cities", dot: true },
        { color: "#fbbf24", label: "Your city (Patna) ◆", dot: true },
        { color: "#a78bfa", label: "Delhi → Mumbai", dot: false },
        { color: "#f472b6", label: "Delhi → Kolkata", dot: false },
        { color: "#34d399", label: "Mumbai → Chennai", dot: false },
      ];

      legendItems.forEach(({ color, label, dot }, i) => {
        const ly2 = W * 0.88 + 44 + i * 20;
        if (dot) {
          ctx.beginPath();
          ctx.arc(42, ly2 - 4, 5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        } else {
          ctx.save();
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(34, ly2 - 4);
          ctx.lineTo(56, ly2 - 4);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
        ctx.font = "400 11px sans-serif";
        ctx.fillStyle = "#aaa";
        ctx.fillText(label, 64, ly2);
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      const tip = tooltipRef.current;
      if (!tip) return;
      let found = false;
      cityPositions.forEach(({ name, pos: [cx, cy] }) => {
        if (Math.hypot(mx - cx, my - cy) < 18) {
          tip.style.display = "block";
          tip.style.left = e.clientX + 14 + "px";
          tip.style.top = e.clientY - 10 + "px";
          tip.textContent = name.replace(" ★", "").replace(" ◆", "");
          found = true;
        }
      });
      if (!found && tooltipRef.current) tip.style.display = "none";
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [geoPolygons]);

  return (
    <div className="bg-[#0a0a0a] flex justify-center items-start min-h-screen p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ width: "100%", maxWidth: W, display: "block" }}
        />
        <div
          ref={tooltipRef}
          style={{
            position: "fixed",
            display: "none",
            background: "rgba(18,18,30,0.95)",
            border: "1px solid #555",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            fontFamily: "sans-serif",
            pointerEvents: "none",
            zIndex: 50,
          }}
        />
      </div>
    </div>
  );
}
