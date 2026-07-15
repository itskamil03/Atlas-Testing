"use client"

import React from 'react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

type LineWavesProps = {
    speed?: number
    innerLineCount?: number
    outerLineCount?: number
    warpIntensity?: number
    rotation?: number
    edgeFadeWidth?: number
    colorCycleSpeed?: number
    brightness?: number
    color1?: string
    color2?: string
    color3?: string
    enableMouseInteraction?: boolean
    mouseInfluence?: number
    className?: string
}

type Color = {
    r: number
    g: number
    b: number
}

type MouseState = {
    x: number
    y: number
    active: boolean
}

const defaultColors = {
    light: ['#0d9e6e', '#16c47f', '#a7f3d0'],  // vivid mid-greens + mint highlight
    dark:  ['#1a6c51', '#0c7b57', '#ffffff'],
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount

const parseHexColor = (hex: string): Color => {
    const normalized = hex.replace('#', '')
    const value = normalized.length === 3
        ? normalized.split('').map((c) => c + c).join('')
        : normalized
    const intValue = Number.parseInt(value, 16)
    return {
        r: (intValue >> 16) & 255,
        g: (intValue >> 8) & 255,
        b: intValue & 255,
    }
}

const colorToRgba = (color: Color, alpha: number) =>
    `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`

const mixColor = (first: Color, second: Color, amount: number): Color => ({
    r: Math.round(lerp(first.r, second.r, amount)),
    g: Math.round(lerp(first.g, second.g, amount)),
    b: Math.round(lerp(first.b, second.b, amount)),
})

const samplePalette = (colors: Color[], amount: number) => {
    if (colors.length === 0) return { r: 255, g: 255, b: 255 }
    if (colors.length === 1) return colors[0]
    const normalized = ((amount % 1) + 1) % 1
    const scaled = normalized * colors.length
    const index = Math.floor(scaled)
    const nextIndex = (index + 1) % colors.length
    return mixColor(colors[index], colors[nextIndex], scaled - index)
}

export default function LineWaves({
    speed = 0.28,
    innerLineCount = 18,
    outerLineCount = 16,
    warpIntensity = 1,
    rotation = -45,
    edgeFadeWidth = 0.2,
    colorCycleSpeed = 1,
    brightness = 0.2,
    color1,
    color2,
    color3,
    enableMouseInteraction = false,
    mouseInfluence = 2,
    className,
}: LineWavesProps) {
    const containerRef = React.useRef<HTMLDivElement | null>(null)
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
    const requestRef = React.useRef<number | null>(null)
    const isVisibleRef = React.useRef(true)
    const mouseRef = React.useRef<MouseState>({ x: 0.5, y: 0.5, active: false })
    // Smoothed mouse — lerped each frame so warp eases in/out instead of snapping
    const smoothMouseRef = React.useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 })
    const { resolvedTheme, theme } = useTheme()

    const isDark = (resolvedTheme ?? theme ?? 'light') === 'dark'

    const palette = React.useMemo(() => {
        const defaults = isDark ? defaultColors.dark : defaultColors.light
        return [color1 ?? defaults[0], color2 ?? defaults[1], color3 ?? defaults[2]].map(parseHexColor)
    }, [color1, color2, color3, isDark])

    React.useEffect(() => {
        const container = containerRef.current
        const canvas = canvasRef.current
        if (!container || !canvas) return undefined

        const context = canvas.getContext('2d')
        if (!context) return undefined

        let width = 0
        let height = 0
        let lastFrameTime = 0

        const stopAnimation = () => {
            if (requestRef.current !== null) {
                window.cancelAnimationFrame(requestRef.current)
                requestRef.current = null
            }
        }

        const startAnimation = () => {
            if (requestRef.current === null && isVisibleRef.current) {
                requestRef.current = window.requestAnimationFrame(render)
            }
        }

        const resize = () => {
            const nextWidth = container.clientWidth
            const nextHeight = container.clientHeight
            if (!nextWidth || !nextHeight) return
            // DPR locked to 1 — no visible quality loss for a decorative background
            width = nextWidth
            height = nextHeight
            canvas.width = Math.floor(nextWidth)
            canvas.height = Math.floor(nextHeight)
            canvas.style.width = `${nextWidth}px`
            canvas.style.height = `${nextHeight}px`
            context.setTransform(1, 0, 0, 1, 0, 0)
        }

        const drawLineLayer = (
            lineCount: number,
            layerOpacity: number,
            lineWidth: number,
            time: number,
            layerAmplitude: number,
            lineSpeed: number,
            lineOffset: number,
        ) => {
            const usableLineCount = Math.max(1, lineCount)
            const lineSpacing = height / (usableLineCount + 1)
            const sampleStep = Math.max(18, width / 12)

            // Precompute mouse world position with rotation correction and radius² once per layer call
            const rawMouseX = smoothMouseRef.current.x * width
            const rawMouseY = smoothMouseRef.current.y * height
            const cx = width / 2
            const cy = height / 2
            const angleRad = (-rotation * Math.PI) / 180
            const cosA = Math.cos(angleRad)
            const sinA = Math.sin(angleRad)
            const mouseX = cx + (rawMouseX - cx) * cosA - (rawMouseY - cy) * sinA
            const mouseY = cy + (rawMouseX - cx) * sinA + (rawMouseY - cy) * cosA
            const influenceRadius = Math.max(width, height) * 0.6
            const radiusSq = influenceRadius * influenceRadius

            for (let index = 0; index < usableLineCount; index += 1) {
                const normalizedIndex = usableLineCount === 1 ? 0.5 : index / (usableLineCount - 1)
                const baseY = lineSpacing * (index + 1)
                const paletteColor = samplePalette(palette, normalizedIndex + time * colorCycleSpeed * 0.06)
                const edgeDistance = Math.min(baseY / height, 1 - baseY / height)
                const edgeFade = clamp(edgeDistance / Math.max(edgeFadeWidth, 0.01), 0, 1)

                context.beginPath()

                for (let x = -sampleStep; x <= width + sampleStep; x += sampleStep) {
                    const normalizedX = x / Math.max(width, 1)
                    const waveA = Math.sin(normalizedX * (2.8 + normalizedIndex * 0.8) + time * lineSpeed + lineOffset)
                    const waveB = Math.cos(normalizedX * (4.5 - normalizedIndex * 1.6) - time * (lineSpeed * 0.75) + lineOffset * 0.7)

                    let mouseWarp = 0
                    if (enableMouseInteraction) {
                        const dx = x - mouseX
                        const dy = baseY - mouseY
                        const distSq = dx * dx + dy * dy
                        // Only compute sqrt for points actually within influence radius
                        if (distSq < radiusSq) {
                            const dist = Math.sqrt(distSq)
                            const falloff = 1 - dist / influenceRadius
                            // falloff² gives a softer, more natural ripple edge
                            mouseWarp = Math.sin(dist * 0.02 - time * 2.5) * mouseInfluence * 14 * falloff * falloff
                        }
                    }

                    const y = baseY
                        + ((waveA * 0.65) + (waveB * 0.35)) * layerAmplitude * (0.45 + normalizedIndex * 0.55)
                        + mouseWarp * warpIntensity

                    if (x <= -sampleStep) {
                        context.moveTo(x, y)
                    } else {
                        context.lineTo(x, y)
                    }
                }

                context.strokeStyle = colorToRgba(paletteColor, layerOpacity * brightness * edgeFade)
                context.lineWidth = lineWidth
                // Shadow removed — forces expensive offscreen compositing pass per stroke
                context.shadowColor = 'transparent'
                context.shadowBlur = 0
                context.stroke()
            }
        }

        const render = (timeMs: number) => {
            if (!isVisibleRef.current) {
                requestRef.current = null
                return
            }

            // ~24fps cap — saves ~20% of frames, imperceptible for a background effect
            if (timeMs - lastFrameTime < 40) {
                requestRef.current = window.requestAnimationFrame(render)
                return
            }

            lastFrameTime = timeMs

            // Ease mouse position toward raw input — smooth warp, no jitter on fast moves
            smoothMouseRef.current.x = lerp(smoothMouseRef.current.x, mouseRef.current.x, 0.08)
            smoothMouseRef.current.y = lerp(smoothMouseRef.current.y, mouseRef.current.y, 0.08)

            const time = timeMs * 0.001 * speed

            context.clearRect(0, 0, width, height)

            const baseGradient = context.createRadialGradient(
                width * 0.5, height * (isDark ? 0.4 : 0.45), 0,
                width * 0.5, height * 0.45, Math.max(width, height),
            )
            baseGradient.addColorStop(0, isDark ? 'rgba(13, 78, 58, 0.22)' : 'rgba(190, 248, 214, 0.42)')
            baseGradient.addColorStop(0.45, isDark ? 'rgba(8, 24, 17, 0.18)' : 'rgba(255, 255, 255, 0.12)')
            baseGradient.addColorStop(1, isDark ? 'rgba(0, 0, 0, 0.96)' : 'rgba(247, 255, 250, 0.98)')
            context.fillStyle = baseGradient
            context.fillRect(0, 0, width, height)

            context.save()
            context.translate(width / 2, height / 2)
            context.rotate((rotation * Math.PI) / 180)
            context.translate(-width / 2, -height / 2)
            context.globalCompositeOperation = isDark ? 'screen' : 'source-over'

            // Inner layer: thick prominent lines — higher opacity for both modes
            drawLineLayer(innerLineCount, isDark ? 0.90 : 0.75, isDark ? 2.8 : 2.4, time, height * 0.055, 1.15, 0.25)
            // Outer layer: medium lines for depth
            drawLineLayer(outerLineCount, isDark ? 0.55 : 0.48, isDark ? 1.8 : 1.6, time * 0.9, height * 0.09, 0.8, -0.4)

            context.restore()

            requestRef.current = window.requestAnimationFrame(render)
        }

        resize()
        startAnimation()

        const resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(container)
        window.addEventListener('resize', resize)

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                isVisibleRef.current = Boolean(entry?.isIntersecting)
                if (isVisibleRef.current) startAnimation()
                else stopAnimation()
            },
            { threshold: 0.08 },
        )
        intersectionObserver.observe(container)

        const handlePointerMove = (event: PointerEvent) => {
            if (!enableMouseInteraction) return
            const bounds = container.getBoundingClientRect()
            if (!bounds.width || !bounds.height) return
            mouseRef.current = {
                x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
                y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
                active: true,
            }
        }

        const handlePointerLeave = () => {
            mouseRef.current = { ...mouseRef.current, active: false }
        }

        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerleave', handlePointerLeave)

        return () => {
            resizeObserver.disconnect()
            intersectionObserver.disconnect()
            window.removeEventListener('resize', resize)
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerleave', handlePointerLeave)
            stopAnimation()
        }
    }, [brightness, colorCycleSpeed, enableMouseInteraction, innerLineCount, isDark, mouseInfluence, outerLineCount, palette, rotation, speed, warpIntensity, edgeFadeWidth])

    return (
        <div ref={containerRef} aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
            <canvas
                ref={canvasRef}
                className='absolute inset-0 h-full w-full'
                style={{ willChange: 'transform' }}
            />
            <div className={cn(
                'absolute inset-0',
                isDark
                    ? 'bg-[radial-gradient(100%_80%_at_50%_10%,rgba(34,197,94,0.12)_0%,rgba(0,0,0,0)_58%)]'
                    : 'bg-[radial-gradient(100%_80%_at_50%_10%,rgba(16,185,129,0.14)_0%,rgba(255,255,255,0)_58%)]',
            )} />
        </div>
    )
}
