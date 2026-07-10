'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { extractApiErrorMessage } from '@/lib/errors'

const AUTH_REQUEST_TIMEOUT_MS = 120000

type ForgotPasswordResponse = {
    email_challenge_id: string
    phone_challenge_id: string
    expires_in_seconds: number
    debug_email_otp?: string
    debug_phone_otp?: string
}

export default function ForgotPasswordPage() {
    const router = useRouter()

    const [step, setStep] = useState<1 | 2>(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // Step 1 fields
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')

    // Returned from step 1, needed for step 2
    const [emailChallengeId, setEmailChallengeId] = useState<string | null>(null)
    const [phoneChallengeId, setPhoneChallengeId] = useState<string | null>(null)
    const [debugEmailOtp, setDebugEmailOtp] = useState<string | null>(null)
    const [debugPhoneOtp, setDebugPhoneOtp] = useState<string | null>(null)

    // Step 2 fields
    const [emailOtp, setEmailOtp] = useState('')
    const [phoneOtp, setPhoneOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMessage('')

        if (!email.trim() || !phone.trim()) {
            setError('Please enter your registered email and mobile number.')
            return
        }

        setLoading(true)

        try {
            const { data } = await api.post<ForgotPasswordResponse>(
                '/auth/forgot-password',
                {
                    email: email.trim(),
                    phone: phone.trim(),
                },
                { timeout: AUTH_REQUEST_TIMEOUT_MS },
            )

            setEmailChallengeId(data.email_challenge_id)
            setPhoneChallengeId(data.phone_challenge_id)
            setDebugEmailOtp(data.debug_email_otp ?? null)
            setDebugPhoneOtp(data.debug_phone_otp ?? null)
            setMessage('OTP sent to your email and phone number.')
            setStep(2)
        } catch (err: unknown) {
            setError(extractApiErrorMessage(err, 'Could not find an account with that email and phone number.'))
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (!emailOtp.trim() || !phoneOtp.trim()) {
            setError('Please enter both OTPs.')
            return
        }

        if (!newPassword.trim() || !confirmPassword.trim()) {
            setError('Please enter and confirm your new password.')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }

        if (!emailChallengeId || !phoneChallengeId) {
            setError('Something went wrong. Please start again.')
            setStep(1)
            return
        }

        setLoading(true)

        try {
            await api.post(
                '/auth/reset-password',
                {
                    email: email.trim(),
                    phone: phone.trim(),
                    email_challenge_id: emailChallengeId,
                    email_otp: emailOtp.trim(),
                    phone_challenge_id: phoneChallengeId,
                    phone_otp: phoneOtp.trim(),
                    new_password: newPassword,
                },
                { timeout: AUTH_REQUEST_TIMEOUT_MS },
            )

            router.replace('/login')
        } catch (err: unknown) {
            setError(extractApiErrorMessage(err, 'Invalid OTP or reset failed. Please try again.'))
        } finally {
            setLoading(false)
        }
    }

    const resetFlow = () => {
        setStep(1)
        setEmailChallengeId(null)
        setPhoneChallengeId(null)
        setDebugEmailOtp(null)
        setDebugPhoneOtp(null)
        setEmailOtp('')
        setPhoneOtp('')
        setNewPassword('')
        setConfirmPassword('')
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
                        Reset your password securely.
                    </h1>
                    <p className="mt-4 max-w-md text-sm text-foreground/75">
                        We&apos;ll verify your identity with a one-time code sent to both your registered
                        email and mobile number before letting you set a new password.
                    </p>
                </section>

                <section className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-2xl backdrop-blur sm:p-8">
                    <h2 className="text-3xl font-semibold">
                        {step === 1 ? 'Forgot Password' : 'Verify & Reset'}
                    </h2>
                    <p className="mt-2 text-sm text-foreground/75">
                        {step === 1
                            ? 'Enter your registered email and mobile number.'
                            : 'Enter the OTPs sent to your email and phone, then set a new password.'}
                    </p>

                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="mt-7 space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Registered Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium">
                                    Registered Mobile Number
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-secondary disabled:opacity-50"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="mt-7 space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="emailOtp" className="text-sm font-medium">
                                    Email OTP
                                </label>
                                <input
                                    id="emailOtp"
                                    type="text"
                                    value={emailOtp}
                                    onChange={(e) => setEmailOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    disabled={loading}
                                />
                                {debugEmailOtp ? (
                                    <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-foreground/80">
                                        Dev OTP: <span className="font-semibold">{debugEmailOtp}</span>
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phoneOtp" className="text-sm font-medium">
                                    Phone OTP
                                </label>
                                <input
                                    id="phoneOtp"
                                    type="text"
                                    value={phoneOtp}
                                    onChange={(e) => setPhoneOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    disabled={loading}
                                />
                                {debugPhoneOtp ? (
                                    <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-foreground/80">
                                        Dev OTP: <span className="font-semibold">{debugPhoneOtp}</span>
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="newPassword" className="text-sm font-medium">
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    disabled={loading}
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
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    disabled={loading}
                                />
                            </div>

                            {message ? <p className="text-sm text-foreground/75">{message}</p> : null}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-secondary disabled:opacity-50"
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>

                            <button
                                type="button"
                                onClick={resetFlow}
                                disabled={loading}
                                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                            >
                                Change email or phone
                            </button>
                        </form>
                    )}

                    {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

                    <p className="mt-7 text-sm text-foreground/75">
                        Remembered your password?{' '}
                        <Link href="/login" className="font-semibold text-foreground hover:underline">
                            Back to Login
                        </Link>
                    </p>
                </section>
            </main>
        </div>
    )
}