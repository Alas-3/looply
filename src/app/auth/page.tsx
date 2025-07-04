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
  const [isAccessCode, setIsAccessCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [accessCode, setAccessCode] = useState("")

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await authService.signInWithAccessCode(accessCode)
      router.push("/employee")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      // Simulate Google sign-in for demo
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await authService.signUp("user@gmail.com", "password", "Demo User")
      router.push("/onboarding")
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
            <span className="font-semibold text-2xl">Loopy</span>
          </Link>
        </div>

        <Card className="glass-effect">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{isAccessCode ? "Employee Access" : "Welcome to Loopy"}</CardTitle>
            <p className="text-gray-600 text-sm mt-2">
              {isAccessCode ? "Enter your access code to continue" : "Sign in to your account"}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

            {isAccessCode ? (
              <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter your access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  className="text-center text-lg font-mono tracking-wider"
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Accessing..." : "Access Account"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  disabled={loading}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or try demo</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() => handleTestMode("employer")}
                disabled={loading}
                className="text-left p-4 h-auto bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Demo as Employer</div>
                    <div className="text-xs text-blue-700 mt-1">Full dashboard with team management and reports</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleTestMode("employee")}
                disabled={loading}
                className="text-left p-4 h-auto bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-green-900">Demo as Employee</div>
                    <div className="text-xs text-green-700 mt-1">Experience EOD reporting with sample data</div>
                  </div>
                </div>
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsAccessCode(!isAccessCode)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isAccessCode ? "Back to sign in" : "Employee? Use access code"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
