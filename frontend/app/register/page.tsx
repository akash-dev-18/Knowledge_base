'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Brain, Loader2, CheckCircle2, Circle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'

interface PasswordRule {
  label: string
  met: boolean
}

function usePasswordStrength(password: string) {
  const rules: PasswordRule[] = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Contains number', met: /\d/.test(password) },
      { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password]
  )
  const score = rules.filter((r) => r.met).length
  const strength =
    score === 0 ? null :
    score <= 2 ? 'weak' :
    score <= 3 ? 'fair' :
    score <= 4 ? 'good' :
    'strong'
  return { rules, score, strength }
}

const strengthColors: Record<string, string> = {
  weak: 'bg-red-500',
  fair: 'bg-yellow-500',
  good: 'bg-blue-500',
  strong: 'bg-green-500',
}

const strengthLabels: Record<string, string> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
}

export default function RegisterPage() {
  const router = useRouter()
  const { setToken, setUser, setCompany } = useAuthStore()
  const [formData, setFormData] = useState({
    companyName: '',
    companyDescription: '',
    fullName: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated()) {
      router.replace('/dashboard')
    }
  }, [router])

  const { rules, score, strength } = usePasswordStrength(formData.password)

  function handleChange(field: keyof typeof formData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (score < 3) {
      toast.error('Please choose a stronger password')
      return
    }
    setLoading(true)
    try {
      const { token, user } = await api.register(formData)
      setToken(token)
      setUser(user)
      setCompany({ id: '', name: formData.companyName || 'My Company' })
      toast.success('Account created! Welcome aboard.')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.22_0.018_264)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.22_0.018_264)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">KnowledgeBase AI</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Chat with your documents intelligently
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your workspace in under a minute
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Company section */}
            <div className="pb-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Company Details
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="companyName" className="text-sm">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corp"
                    value={formData.companyName}
                    onChange={handleChange('companyName')}
                    className="bg-input border-border focus-visible:ring-primary"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="companyDescription" className="text-sm">
                    Company Description
                  </Label>
                  <Textarea
                    id="companyDescription"
                    placeholder="What does your company do?"
                    value={formData.companyDescription}
                    onChange={handleChange('companyDescription')}
                    className="bg-input border-border focus-visible:ring-primary resize-none"
                    rows={2}
                    required
                  />
                </div>
              </div>
            </div>

            {/* User section */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Your Details
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Alex Johnson"
                    value={formData.fullName}
                    onChange={handleChange('fullName')}
                    className="bg-input border-border focus-visible:ring-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    className="bg-input border-border focus-visible:ring-primary"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange('password')}
                      className="bg-input border-border focus-visible:ring-primary pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              strength && score >= i
                                ? strengthColors[strength]
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                        {strength && (
                          <span
                            className={`text-xs ml-1 font-medium ${
                              strength === 'weak' ? 'text-red-400' :
                              strength === 'fair' ? 'text-yellow-400' :
                              strength === 'good' ? 'text-blue-400' :
                              'text-green-400'
                            }`}
                          >
                            {strengthLabels[strength]}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {rules.map((rule) => (
                          <div key={rule.label} className="flex items-center gap-1.5">
                            {rule.met ? (
                              <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            )}
                            <span
                              className={`text-xs ${rule.met ? 'text-green-400' : 'text-muted-foreground'}`}
                            >
                              {rule.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
