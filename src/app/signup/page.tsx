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
  const [usernameConflict, setUsernameConflict] = useState(false)
  const [emailConflict, setEmailConflict] = useState(false)
  const [usernameUpdated, setUsernameUpdated] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateUsername = (name: string): string | null => {
    if (!name) return null
    if (/\s/.test(name)) return 'Username must not contain spaces.'
    if (name.length < 3) return 'Username must be at least 3 characters.'
    if (name.length > 20) return 'Username cannot exceed 20 characters.'
    if (!/^[a-zA-Z0-9._]+$/.test(name)) return 'Only letters, numbers, underscores (_), and dots (.) are allowed.'
    if (/^[._]/.test(name)) return 'Username cannot start with a dot or underscore.'
    if (/[._]$/.test(name)) return 'Username cannot end with a dot or underscore.'
    if (/\.\.|__|\._|_\./.test(name)) return 'Username cannot contain consecutive dots or underscores.'
    return null
  }

  const getUsernameSuggestions = (name: string, fullNameStr: string): string[] => {
    const seed = (name || fullNameStr || '').toLowerCase().trim()
    if (!seed) return []
    const cleanSeed = seed.replace(/\s+/g, '_').replace(/[^a-z0-9_.]/g, '').replace(/^[._]+|[._]+$/g, '')
    const baseWord = seed.replace(/[^a-z0-9]/g, '')
    const list: string[] = []
    
    const randomNum = Math.floor(10 + Math.random() * 89)
    if (cleanSeed && cleanSeed.length >= 3 && cleanSeed.length <= 15) {
      list.push(`${cleanSeed}_${randomNum}`)
      list.push(`${cleanSeed}.pro`)
      list.push(`${cleanSeed}_trade`)
      list.push(`${cleanSeed}99`)
    }
    if (baseWord && baseWord.length >= 2) {
      list.push(`${baseWord.slice(0, 13)}_01`)
      list.push(`${baseWord.slice(0, 14)}ai`)
      list.push(`${baseWord.slice(0, 11)}_quant`)
    }
    return Array.from(new Set(list)).filter((s) => !validateUsername(s) && s !== name).slice(0, 4)
  }

  const handleSelectSuggestion = (suggested: string) => {
    setUsername(suggested)
    setUsernameConflict(false)
    setUsernameUpdated(true)
    setError('')
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
    setUsernameConflict(false)
    setEmailConflict(false)
    setUsernameUpdated(false)

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
      const rawMsg = extractErrorMessage(err)
      const lower = rawMsg.toLowerCase()

      if (
        lower.includes('username') ||
        lower.includes('user already exist') ||
        lower.includes('already taken') ||
        lower.includes('user with this username')
      ) {
        setUsernameConflict(true)
        setError(`Username "@${username}" is already taken. Please choose another username from the suggestions below.`)
      } else if (lower.includes('email already') || lower.includes('account with this email')) {
        setEmailConflict(true)
        setError(`An account with email "${email}" already exists. Please login instead.`)
      } else {
        setError(rawMsg)
      }
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
    setUsernameConflict(false)
    setEmailConflict(false)
    setUsernameUpdated(false)
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
              <div className="flex items-center justify-between">
                <label htmlFor="username" className="text-sm font-medium">Username</label>
                <span className="text-[11px] text-muted-foreground">3–20 chars (letters, numbers, _, .)</span>
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase())
                  if (usernameConflict) setUsernameConflict(false)
                  if (usernameUpdated) setUsernameUpdated(false)
                  if (error) setError('')
                }}
                placeholder="e.g. alex_trader or alex.99"
                className={`w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                  (username && usernameError) || usernameConflict
                    ? 'border-destructive focus:border-destructive focus:ring-destructive/30 bg-destructive/5'
                    : usernameUpdated
                    ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/30'
                    : username && !usernameError
                    ? 'border-purple-500/60 focus:border-purple-500 focus:ring-purple-500/30'
                    : 'border-border focus:border-primary focus:ring-primary/30'
                }`}
                autoComplete="username"
                maxLength={20}
                disabled={!!emailChallengeId && !otpVerified && !usernameConflict}
                required
              />
              {usernameConflict ? (
                <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs">
                  <p className="font-semibold text-destructive flex items-center gap-1.5">
                    <span>⚠️</span> Username &quot;@{username}&quot; is already taken!
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    Choose one of these available unique suggestions or type a different username:
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {getUsernameSuggestions(username, fullName).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleSelectSuggestion(sug)}
                        className="rounded-lg border border-purple-500/50 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-300 hover:bg-purple-500/30 active:scale-95 transition"
                      >
                        @{sug}
                      </button>
                    ))}
                  </div>
                </div>
              ) : usernameUpdated ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span>✓</span> Username set to @{username}. You can now complete signup!
                </p>
              ) : username && usernameError ? (
                <div className="space-y-1.5 pt-0.5">
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span>⚠️</span> {usernameError}
                  </p>
                  {getUsernameSuggestions(username, fullName).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                      <span className="text-muted-foreground text-[11px]">Suggestions:</span>
                      {getUsernameSuggestions(username, fullName).map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleSelectSuggestion(sug)}
                          className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-400 hover:bg-purple-500/20 active:scale-95 transition"
                        >
                          @{sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : username && !usernameError ? (
                <p className="text-xs text-purple-400 flex items-center gap-1 font-medium">
                  <span>✓</span> Valid username format
                </p>
              ) : null}
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
                    <p className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs text-purple-300">
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
                    <p className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs text-purple-300">
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
                    className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 text-white px-4 py-3 text-sm font-semibold transition-all duration-100 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </>
            ) : emailChallengeId && otpVerified ? (
              <>
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-300 font-medium">
                  OTP verified successfully!
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-2.5">
                  <div className="flex items-center justify-between font-semibold text-foreground/90 border-b border-border/60 pb-2">
                    <span>Terms & Policy Summary</span>
                    <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">Compliance</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] leading-relaxed list-disc list-inside">
                    <li><strong className="text-foreground/80">Trading Risk:</strong> Financial markets and algorithmic tools carry substantial risk of loss. Past returns do not guarantee future performance.</li>
                    <li><strong className="text-foreground/80">Service Scope:</strong> ATLAS Trading provides technological automation & intelligence for informational purposes and is not a financial advisor.</li>
                    <li><strong className="text-foreground/80">Data Protection:</strong> Your credentials and account information are encrypted and handled per our Privacy Policy.</li>
                    <li><strong className="text-foreground/80">Account Eligibility:</strong> You must be at least 18 years old and comply with your local regulatory laws.</li>
                  </ul>
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3.5 text-xs sm:text-sm text-foreground/80 hover:bg-background/80 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                  />
                  <span className="leading-snug">
                    I agree to the{' '}
                    <Link
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-2"
                    >
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-2"
                    >
                      Privacy Policy
                    </Link>.
                  </span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setOtpVerified(false)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted sm:w-auto"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !termsAccepted || !!usernameError}
                    className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 text-white px-4 py-3 text-sm font-semibold transition-all duration-100 disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </>
            ) : (
              <button
                type="submit"
                disabled={loading || !!passwordError || !!confirmError || !!usernameError}
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 text-white px-4 py-3 text-sm font-semibold transition-all duration-100 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            )}

            {emailConflict ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-foreground space-y-2.5">
                <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span>⚠️</span> An account with this email already exists.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    href="/login"
                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition"
                  >
                    Login to Existing Account
                  </Link>
                  <Link
                    href="/forgot-password"
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
                  >
                    Reset Password
                  </Link>
                </div>
              </div>
            ) : error && !usernameConflict ? (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            ) : null}
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