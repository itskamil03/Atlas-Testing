'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

export default function LoginPage() {
    const [identity, setIdentity] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (!identity.trim() || !password.trim()) {
            setError('Please enter your email or mobile number and password.')
            return
        }

        setSuccess('Login form is ready. Connect this action to your API to complete authentication.')
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
                    <p className="mt-2 text-sm text-foreground/75">Use your email or mobile number and password.</p>

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
                            />
                        </div>

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
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-secondary"
                        >
                            Login to Account
                        </button>
                    </form>

                    {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
                    {success ? <p className="mt-4 text-sm text-foreground/80">{success}</p> : null}

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