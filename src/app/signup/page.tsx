'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { setTokens } from '@/lib/auth'
import { useMounted } from '@/lib/useMounted'

export default function SignupPage() {
  const router = useRouter()
  const mounted = useMounted()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [emailChallengeId, setEmailChallengeId] = useState<string | null>(null)
  const [phoneChallengeId, setPhoneChallengeId] = useState<string | null>(null)
  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')
  const [debugEmailOtp, setDebugEmailOtp] = useState<string | null>(null)
  const [debugPhoneOtp, setDebugPhoneOtp] = useState<string | null>(null)
  const [otpVerified, setOtpVerified] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateUsername = (name: string): string | null => {
    if (!name) return null
    if (/\s/.test(name)) return 'Username must not contain spaces.'
    if (name.length < 4) return 'Username must be at least 4 characters.'
    const numDigits = (name.match(/\d/g) || []).length
    if (numDigits < 2) return 'Username must contain at least 2 numbers.'
    // if (!/[^\w\s]/.test(name)) return 'Username must contain at least 1 special character (!@#$%^&*).'
    return null
  }

  const validatePassword = (pwd: string): string | null => {
    if (!pwd) return null
    if (pwd.length < 8) return 'Password must be at least 8 characters.'
    if (!/[a-z]/.test(pwd)) return 'Password must include a lowercase letter.'
    if (!/[A-Z]/.test(pwd)) return 'Password must include an uppercase letter.'
    if (!/\d/.test(pwd)) return 'Password must include a number.'
    if (!/[^\w\s]/.test(pwd)) return 'Password must include a special character (!@#$%^&*).'
    return null
  }

  const usernameError = validateUsername(username)
  const passwordError = validatePassword(password)
  const confirmError = confirmPassword && confirmPassword !== password ? 'Passwords do not match.' : null

  const extractErrorMessage = (err: unknown): string => {
    if (typeof err === 'object' && err && 'code' in err) {
      const errorCode = (err as { code?: string }).code
      if (errorCode === 'ECONNABORTED') {
        return 'Request timeout. Server is taking too long to respond.'
      }
      if (errorCode === 'ENOTFOUND' || errorCode === 'ECONNREFUSED' || errorCode === 'ERR_NETWORK') {
        return `Cannot reach server. Check if the backend is running.`
      }
    }

    if (typeof err === 'object' && err && 'response' in err) {
      const response = (err as { response?: { data?: unknown; status?: number } }).response
      const data = response?.data

      if (response?.status === 0) {
        return 'Network error: Cannot connect to the server.'
      }

      // Handle 422 validation errors — show the full detail
      if (response?.status === 422 && data) {
        try {
          return JSON.stringify(data, null, 2)
        } catch {
          return String(data)
        }
      }

      if (typeof data === 'object' && data) {
        if ('detail' in data && typeof (data as { detail?: unknown }).detail === 'string') {
          return (data as { detail: string }).detail
        }
        if ('message' in data && typeof (data as { message?: unknown }).message === 'string') {
          return (data as { message: string }).message
        }
        if ('error' in data && typeof (data as { error?: unknown }).error === 'string') {
          return (data as { error: string }).error
        }
      }
    }

    if (err instanceof Error) {
      if (err.message.includes('Network')) {
        return `Network error: ${err.message}`
      }
      return err.message
    }

    return 'Registration failed. Please verify details and retry.'
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (usernameError) {
      setError(usernameError)
      return
    }
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (confirmError) {
      setError(confirmError)
      return
    }

    setLoading(true)

    try {
      if (!emailChallengeId || !phoneChallengeId) {
        const { data } = await api.post('/auth/signup/send-otp', { email, phone })
        setEmailChallengeId(data.email_challenge_id)
        setPhoneChallengeId(data.phone_challenge_id)
        setDebugEmailOtp(data.debug_email_otp ?? null)
        setDebugPhoneOtp(data.debug_phone_otp ?? null)
        return
      }

      if (!otpVerified) {
        await api.post('/auth/signup/verify-otp', {
          email,
          phone,
          email_challenge_id: emailChallengeId,
          email_otp: emailOtp,
          phone_challenge_id: phoneChallengeId,
          phone_otp: phoneOtp,
        })
        setOtpVerified(true)
        return
      }

      const { data } = await api.post('/auth/signup', {
        email,
        full_name: fullName,
        username,
        password,
        confirm_password: confirmPassword,
        phone,
        terms_accepted: termsAccepted,
        email_challenge_id: emailChallengeId,
        email_otp: emailOtp,
        phone_challenge_id: phoneChallengeId,
        phone_otp: phoneOtp,
      })
      setTokens(data.tokens.access_token, data.tokens.refresh_token)
      router.replace('/dashboard')
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const resetOtpFlow = () => {
    setEmailChallengeId(null)
    setPhoneChallengeId(null)
    setEmailOtp('')
    setPhoneOtp('')
    setDebugEmailOtp(null)
    setDebugPhoneOtp(null)
    setOtpVerified(false)
    setError('')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-30 top-6 h-88 w-88 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />
      </div>

      <main 
        style={{ zoom: 0.90 }}
        className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:px-10"
      >
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
          <h2 className="text-3xl font-semibold">
            {emailChallengeId ? 'Complete Signup' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-foreground/75">
            {emailChallengeId && !otpVerified
              ? 'Enter the OTPs sent to your email and phone.'
              : emailChallengeId && otpVerified
              ? 'Finish creating your account.'
              : 'Build your account and verify contact details.'}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                autoComplete="name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Mobile Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                autoComplete="tel"
                required
                disabled={!!emailChallengeId}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Min 4 chars, 1 special char, 2 numbers"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Create Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 chars, uppercase, number, special char"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                autoComplete="new-password"
                minLength={8}
                required
              />
              {passwordError && password ? (
                <p className="text-xs text-destructive">{passwordError}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                autoComplete="new-password"
                minLength={8}
                required
              />
              {confirmError ? (
                <p className="text-xs text-destructive">{confirmError}</p>
              ) : null}
            </div>

            {emailChallengeId && !otpVerified ? (
              <>
                <div className="rounded-xl border border-border bg-background/60 p-3 text-xs text-foreground/70">
                  OTP sent to {email} and {phone}.
                </div>

                <div className="space-y-2">
                  <label htmlFor="emailOtp" className="text-sm font-medium">Email OTP</label>
                  <input
                    id="emailOtp"
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    placeholder="Enter 6-digit email OTP"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                  {debugEmailOtp ? (
                    <p className="rounded-lg border border-[#9BFF00]/30 bg-[#9BFF00]/10 px-3 py-2 text-xs text-[#9BFF00]">
                      Dev email OTP: <span className="font-semibold">{debugEmailOtp}</span>
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phoneOtp" className="text-sm font-medium">Mobile OTP</label>
                  <input
                    id="phoneOtp"
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter 6-digit mobile OTP"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                  {debugPhoneOtp ? (
                    <p className="rounded-lg border border-[#9BFF00]/30 bg-[#9BFF00]/10 px-3 py-2 text-xs text-[#9BFF00]">
                      Dev phone OTP: <span className="font-semibold">{debugPhoneOtp}</span>
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetOtpFlow}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted sm:w-auto"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 text-sm font-semibold transition-all duration-100 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </>
            ) : emailChallengeId && otpVerified ? (
              <>
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-400">
                  OTP verified successfully!
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground/80">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                  />
                  <span>I agree to the Terms & Conditions and Privacy Policy.</span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !termsAccepted}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 text-sm font-semibold transition-all duration-100 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={loading || !!passwordError || !!confirmError}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 text-sm font-semibold transition-all duration-100 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            )}

            {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
          </form>

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