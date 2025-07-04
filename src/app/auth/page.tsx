"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/services/auth"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isAccessCode, setIsAccessCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    accessCode: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isAccessCode) {
        await authService.signInWithAccessCode(formData.accessCode)
        router.push("/employee")
      } else if (isSignUp) {
        await authService.signUp(formData.email, formData.password, formData.name)
        router.push("/onboarding")
      } else {
        await authService.signIn(formData.email, formData.password)
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleTestMode = async (role: "employer" | "employee") => {
    setLoading(true)
    try {
      await authService.testMode(role)
      router.push(role === "employer" ? "/dashboard" : "/employee")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <span className="font-semibold text-2xl">Looply</span>
          </Link>
        </div>

        <Card className="glass-effect">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isAccessCode ? "Employee Access" : isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isAccessCode ? (
                <Input
                  type="text"
                  placeholder="Enter your access code"
                  value={formData.accessCode}
                  onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                  required
                />
              ) : (
                <>
                  {isSignUp && (
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  )}
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : isAccessCode ? "Access Account" : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Try a demo</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => handleTestMode("employer")}
                  className="group cursor-pointer relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                      🏢
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900 group-hover:text-blue-700">Employer Demo</h3>
                      <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-6 -mb-6 group-hover:bg-blue-500/10 transition-all duration-300"></div>
                </div>

                <div
                  onClick={() => handleTestMode("employee")}
                  className="group cursor-pointer relative overflow-hidden rounded-xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-5 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div>
                      <h3 className="font-medium text-purple-900 group-hover:text-purple-700">Employee Demo</h3>
                      <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full -mr-6 -mb-6 group-hover:bg-purple-500/10 transition-all duration-300"></div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              {!isAccessCode && (
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => setIsAccessCode(!isAccessCode)}
                  className="text-sm text-gray-600 hover:underline"
                >
                  {isAccessCode ? "Back to email sign in" : "Employee? Use access code"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
