'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

type Step = 'details' | 'verify'

export default function SignupPage() {
    const [step, setStep] = useState<Step>('details')
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [mobile, setMobile] = useState('')
    const [emailOtp, setEmailOtp] = useState('')
    const [mobileOtp, setMobileOtp] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleContinue = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !mobile.trim()) {
            setError('Please complete all signup fields before continuing.')
            return
        }

        if (password !== confirmPassword) {
            setError('Password and confirm password do not match.')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.')
            return
        }

        setStep('verify')
    }

    const handleVerifyAndCreate = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setSuccess('')

        if (!emailOtp.trim() || !mobileOtp.trim()) {
            setError('Please enter OTP for both email and mobile.')
            return
        }

        setSuccess('Signup flow is ready. Connect this to your OTP verification and account API.')
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-30 top-6 h-88 w-88 rounded-full bg-primary/30 blur-3xl" />
                <div className="absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
                <div className="absolute -bottom-32 right-1/3 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />
            </div>

            <main className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:px-10">
                <section className="hidden rounded-3xl border border-border/60 bg-card/85 p-10 shadow-2xl backdrop-blur md:block">
                    <p className="inline-flex rounded-full border border-primary/40 bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80">
                        Join Atlas
                    </p>
                    <h1 className="mt-6 text-4xl font-semibold leading-tight">Create your account in two secure steps.</h1>
                    <p className="mt-4 max-w-md text-sm text-foreground/75">
                        Register with your details, verify OTP on email and mobile, and start tracking market
                        opportunities in real time.
                    </p>

                    <div className="mt-8 grid gap-4">
                        <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-foreground/65">Step 1</p>
                            <p className="mt-1 text-sm font-medium">Profile and security details</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-foreground/65">Step 2</p>
                            <p className="mt-1 text-sm font-medium">Email OTP and mobile OTP verification</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-2xl backdrop-blur sm:p-8">
                    <h2 className="text-3xl font-semibold">Signup</h2>
                    <p className="mt-2 text-sm text-foreground/75">Build your account and verify contact details.</p>

                    <div className="mt-5 flex items-center gap-3 text-xs">
                        <span
                            className={`rounded-full border px-3 py-1 font-medium ${
                                step === 'details'
                                    ? 'border-primary bg-primary/15 text-foreground'
                                    : 'border-border bg-background/60 text-foreground/70'
                            }`}
                        >
                            1. Details
                        </span>
                        <span
                            className={`rounded-full border px-3 py-1 font-medium ${
                                step === 'verify'
                                    ? 'border-primary bg-primary/15 text-foreground'
                                    : 'border-border bg-background/60 text-foreground/70'
                            }`}
                        >
                            2. OTP Verification
                        </span>
                    </div>

                    {step === 'details' ? (
                        <form onSubmit={handleContinue} className="mt-6 space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="fullName" className="text-sm font-medium">
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                    placeholder="Your full name"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    autoComplete="name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    autoComplete="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Create Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    placeholder="Re-enter password"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="mobile" className="text-sm font-medium">
                                    Mobile Number
                                </label>
                                <input
                                    id="mobile"
                                    type="tel"
                                    value={mobile}
                                    onChange={(event) => setMobile(event.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    autoComplete="tel"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-secondary"
                            >
                                Continue to OTP Verification
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyAndCreate} className="mt-6 space-y-4">
                            <div className="rounded-xl border border-border bg-background/60 p-3 text-xs text-foreground/70">
                                OTP sent to {email || 'your email'} and {mobile || 'your mobile number'}.
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="emailOtp" className="text-sm font-medium">
                                    Email OTP
                                </label>
                                <input
                                    id="emailOtp"
                                    type="text"
                                    value={emailOtp}
                                    onChange={(event) => setEmailOtp(event.target.value)}
                                    placeholder="Enter 6-digit email OTP"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    inputMode="numeric"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="mobileOtp" className="text-sm font-medium">
                                    Mobile OTP
                                </label>
                                <input
                                    id="mobileOtp"
                                    type="text"
                                    value={mobileOtp}
                                    onChange={(event) => setMobileOtp(event.target.value)}
                                    placeholder="Enter 6-digit mobile OTP"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    inputMode="numeric"
                                />
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setStep('details')}
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted sm:w-auto"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-secondary"
                                >
                                    Verify OTP and Create Account
                                </button>
                            </div>
                        </form>
                    )}

                    {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
                    {success ? <p className="mt-4 text-sm text-foreground/80">{success}</p> : null}

                    <p className="mt-7 text-sm text-foreground/75">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-foreground hover:underline">
                            Login
                        </Link>
                    </p>
                </section>
            </main>
        </div>
    )
}