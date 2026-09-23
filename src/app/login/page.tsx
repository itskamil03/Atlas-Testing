'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { DEMO_ACCESS_TOKEN, DEMO_REFRESH_TOKEN, setTokens } from '@/lib/auth'
import { extractApiErrorMessage } from '@/lib/errors'

const DEMO_PASSWORDS = new Set(['demo123', 'password'])
const AUTH_REQUEST_TIMEOUT_MS = 120000

type LoginChallengeResponse = {
    challenge_id?: string
    challengeId?: string
    loginChallengeId?: string
    data?: LoginChallengeResponse
    otp?: string
    loginOtp?: string
    debug_otp?: string
    message?: string
}

type LoginVerifyResponse = {
    tokens?: {
        access_token?: string
        refresh_token?: string
    }
    access_token?: string
    refresh_token?: string
    data?: LoginVerifyResponse
}

function getChallengeId(data: LoginChallengeResponse): string | null {
    return data.challenge_id ?? data.challengeId ?? data.loginChallengeId ?? (data.data ? getChallengeId(data.data) : null)
}

function getDebugOtp(data: LoginChallengeResponse): string | null {
    return data.otp ?? data.loginOtp ?? data.debug_otp ?? (data.data ? getDebugOtp(data.data) : null)
}

function getTokens(data: LoginVerifyResponse): { accessToken: string; refreshToken: string } | null {
    const accessToken = data.tokens?.access_token ?? data.access_token
    const refreshToken = data.tokens?.refresh_token ?? data.refresh_token

    if ((!accessToken || !refreshToken) && data.data) {
        return getTokens(data.data)
    }

    if (!accessToken || !refreshToken) {
        return null
    }

    return { accessToken, refreshToken }
}

export function normalizeLoginIdentifier(raw: string): string {
    const trimmed = raw.trim()
    if (!trimmed) return trimmed

    // If it's an email (contains @), return clean lowercase
    if (trimmed.includes('@')) {
        return trimmed.toLowerCase()
    }

    // Strip spaces, dashes, brackets, dots
    const clean = trimmed.replace(/[\s\-().]/g, '')

    // If it starts with +: keep + and clean digits
    if (clean.startsWith('+')) {
        return '+' + clean.slice(1).replace(/\D/g, '')
    }

    // If it is purely numeric digits:
    if (/^\d+$/.test(clean)) {
        // 10 digits (Standard Indian mobile number) -> prepend +91
        if (clean.length === 10) {
            return '+91' + clean
        }
        // 11 digits starting with 0 -> e.g. 09876543210 -> +919876543210
        if (clean.length === 11 && clean.startsWith('0')) {
            return '+91' + clean.slice(1)
        }
        // 12 digits starting with 91 -> prepend +
        if (clean.length === 12 && clean.startsWith('91')) {
            return '+' + clean
        }
        // General international numbers
        if (clean.length >= 8 && clean.length <= 15) {
            return '+' + clean
        }
    }

    return clean
}

export default function LoginPage() {
    const router = useRouter()
    const [identity, setIdentity] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [challengeId, setChallengeId] = useState<string | null>(null)
    const [debugOtp, setDebugOtp] = useState<string | null>(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMessage('')

        if (challengeId) {
            if (!otp.trim()) {
                setError('Please enter the OTP.')
                return
            }

            setLoading(true)

            try {
                const { data } = await api.post<LoginVerifyResponse>('/auth/login/verify-otp', {
                    challenge_id: challengeId,
                    otp: otp.trim(),
                }, { timeout: AUTH_REQUEST_TIMEOUT_MS })
                const tokens = getTokens(data)

                if (!tokens) {
                    throw new Error('Login verified, but the server did not return session tokens.')
                }

                setTokens(tokens.accessToken, tokens.refreshToken)
                router.replace('/dashboard')
            } catch (err: unknown) {
                setError(extractApiErrorMessage(err, 'Invalid OTP. Please try again.'))
            } finally {
                setLoading(false)
            }

            return
        }

        const rawIdentity = identity.trim()
        if (!rawIdentity || !password.trim()) {
            setError('Please enter your email or mobile number and password.')
            return
        }

        // Dummy fallback - check FIRST for instant redirect
        if (rawIdentity.toLowerCase() === 'demo@atlas.com' && DEMO_PASSWORDS.has(password.trim())) {
            setTokens(DEMO_ACCESS_TOKEN, DEMO_REFRESH_TOKEN)
            router.replace('/dashboard')
            return
        }

        // Check if user entered a username instead of email or mobile number
        const isEmailFormat = rawIdentity.includes('@')
        const isNumericPhone = /^[+\d\s\-().]+$/.test(rawIdentity) && rawIdentity.replace(/\D/g, '').length >= 7

        if (!isEmailFormat && !isNumericPhone) {
            setError('Login requires your registered Email address (e.g. you@example.com) or Mobile Number (e.g. +91 98765 43210). Please enter your email or phone to log in.')
            return
        }

        const normalizedIdentifier = normalizeLoginIdentifier(rawIdentity)

        setLoading(true)

        try {
            const { data } = await api.post<LoginChallengeResponse>('/auth/login', {
                identifier: normalizedIdentifier,
                password: password.trim(),
            }, { timeout: AUTH_REQUEST_TIMEOUT_MS })
            const nextChallengeId = getChallengeId(data)

            if (!nextChallengeId) {
                throw new Error('Login started, but the server did not return a challenge ID.')
            }

            setChallengeId(nextChallengeId)
            setDebugOtp(getDebugOtp(data))
            setMessage(data.message ?? 'OTP sent. Please enter it to continue.')
        } catch (err: unknown) {
            setError(extractApiErrorMessage(err, 'Invalid credentials. Please check your email/mobile number and password.'))
        } finally {
            setLoading(false)
        }
    }

    const resetChallenge = () => {
        setChallengeId(null)
        setOtp('')
        setDebugOtp(null)
        setMessage('')
        setError('')
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-28 top-10 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
                <div className="absolute -right-30 top-1/3 h-88 w-88 rounded-full bg-accent/40 blur-3xl" />
                <div className="absolute -bottom-30 left-1/3 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
            </div>

            <main className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:px-10">
                <section className="hidden rounded-3xl border border-border/60 bg-card/80 p-10 shadow-2xl backdrop-blur md:block">
                    <p className="inline-flex rounded-full border border-primary/40 bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80">
                        Atlas Access
                    </p>
                    <h1 className="mt-6 text-4xl font-semibold leading-tight">
                        Welcome back to your trading intelligence dashboard.
                    </h1>
                    <p className="mt-4 max-w-md text-sm text-foreground/75">
                        Continue with your email or mobile number and unlock live market signals, analytics,
                        and strategy insights in one secure place.
                    </p>
                    <div className="mt-8 grid gap-4 text-sm text-foreground/80">
                        <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                            Live market trend alerts
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                            Personalized performance tracking
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                            Fast and secure account access
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-2xl backdrop-blur sm:p-8">
                    <h2 className="text-3xl font-semibold">Login</h2>
                    <p className="mt-2 text-sm text-foreground/75">
                        {challengeId ? 'Enter the OTP sent to your account.' : 'Use your email or mobile number and password.'}
                    </p>

                    <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="identity" className="text-sm font-medium">
                                Email or Mobile Number
                            </label>
                            <input
                                id="identity"
                                type="text"
                                value={identity}
                                onChange={(event) => {
                                    setIdentity(event.target.value)
                                    if (error) setError('')
                                }}
                                placeholder="you@example.com or 98765 43210 / +91 98765 43210"
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                autoComplete="username"
                                disabled={!!challengeId || loading}
                                required
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Enter your registered email address or 10-digit mobile number.
                            </p>
                        </div>

                        {challengeId ? (
                            <div className="space-y-2">
                                <label htmlFor="otp" className="text-sm font-medium">
                                    OTP
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(event) => setOtp(event.target.value)}
                                    placeholder="Enter OTP"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    disabled={loading}
                                />
                                {debugOtp ? (
                                    <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-foreground/80">
                                        Dev OTP: <span className="font-semibold">{debugOtp}</span>
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </label>
                                   <Link
                                       href="/forgot-password"
                                      className="text-xs font-medium text-foreground/70 transition hover:text-foreground"
                                                      >
                                          Forgot password?
                                                   </Link>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value)
                                        if (error) setError('')
                                    }}
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        )}

                        {message ? <p className="text-sm text-foreground/75">{message}</p> : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 active:scale-[0.98] text-white px-4 py-3 text-sm font-semibold transition-all duration-100 disabled:opacity-50"
                        >
                            {loading ? 'Please wait...' : challengeId ? 'Verify OTP' : 'Login to Account'}
                        </button>

                        {challengeId ? (
                            <button
                                type="button"
                                onClick={resetChallenge}
                                disabled={loading}
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                            >
                                Change login details
                            </button>
                        ) : null}
                    </form>

                    {error ? (
                        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    ) : null}

                    <p className="mt-7 text-sm text-foreground/75">
                        New to Atlas?{' '}
                        <Link href="/signup" className="font-semibold text-foreground hover:underline">
                            Create your account
                        </Link>
                    </p>
                </section>
            </main>
        </div>
    )
}