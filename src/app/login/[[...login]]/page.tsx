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

        if (!identity.trim() || !password.trim()) {
            setError('Please enter your email or mobile number and password.')
            return
        }

        // Dummy fallback - check FIRST for instant redirect
        if (identity.trim().toLowerCase() === 'demo@atlas.com' && DEMO_PASSWORDS.has(password.trim())) {
            setTokens(DEMO_ACCESS_TOKEN, DEMO_REFRESH_TOKEN)
            router.replace('/dashboard')
            return
        }

        setLoading(true)

        try {
            const { data } = await api.post<LoginChallengeResponse>('/auth/login', {
                identifier: identity.trim(),
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
            setError(extractApiErrorMessage(err, 'Invalid credentials. Please check your email and password.'))
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
                                onChange={(event) => setIdentity(event.target.value)}
                                placeholder="you@example.com or +91 98765 43210"
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                autoComplete="username"
                                disabled={!!challengeId || loading}
                            />
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
                                    <button
                                        type="button"
                                        className="text-xs font-medium text-foreground/70 transition hover:text-foreground"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                            </div>
                        )}

                        {message ? <p className="text-sm text-foreground/75">{message}</p> : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-secondary"
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

                    {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

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
