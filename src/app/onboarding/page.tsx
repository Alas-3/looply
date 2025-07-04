"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/services/auth"
import { companyService } from "@/lib/services/company"
import type { User, Employee } from "@/lib/types"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const router = useRouter()

  const [companyData, setCompanyData] = useState({
    name: "",
    timezone: "America/New_York",
  })

  const [employeeData, setEmployeeData] = useState({
    name: "",
    email: "",
    position: "",
  })

  const [csvData, setCsvData] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        router.push("/auth")
        return
      }
      setUser(currentUser)
    }
    checkAuth()
  }, [router])

  const handleCompanySetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const company = await companyService.createCompany(companyData.name, companyData.timezone, user.id)

      // Update user with company ID
      const updatedUser = { ...user, companyId: company.id }
      await authService.setCurrentUser(updatedUser)
      setUser(updatedUser)

      setStep(2)
    } catch (error) {
      console.error("Failed to create company:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.companyId) return

    setLoading(true)
    try {
      const employee = await companyService.addEmployee(
        user.companyId,
        employeeData.name,
        employeeData.email,
        employeeData.position,
      )

      setEmployees([...employees, employee])
      setEmployeeData({ name: "", email: "", position: "" })
    } catch (error) {
      console.error("Failed to add employee:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCSVUpload = async () => {
    if (!user?.companyId || !csvData.trim()) return

    setLoading(true)
    try {
      const newEmployees = await companyService.addEmployeesFromCSV(user.companyId, csvData)
      setEmployees([...employees, ...newEmployees])
      setCsvData("")
    } catch (error) {
      console.error("Failed to upload CSV:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Company Setup</span>
            <span>Add Team</span>
          </div>
        </div>

        {step === 1 && (
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Set up your company</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanySetup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <Input
                    type="text"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                    placeholder="Acme Inc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select
                    value={companyData.timezone}
                    onChange={(e) => setCompanyData({ ...companyData, timezone: e.target.value })}
                    className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Add your team members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Manual add */}
              <div>
                <h3 className="font-medium mb-3">Add individual employee</h3>
                <form onSubmit={handleAddEmployee} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={employeeData.name}
                      onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Email (optional)"
                      value={employeeData.email}
                      onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                    />
                  </div>
                  <Input
                    type="text"
                    placeholder="Position (optional)"
                    value={employeeData.position}
                    onChange={(e) => setEmployeeData({ ...employeeData, position: e.target.value })}
                  />
                  <Button type="submit" disabled={loading}>
                    Add Employee
                  </Button>
                </form>
              </div>

              {/* CSV upload */}
              <div>
                <h3 className="font-medium mb-3">Or upload CSV</h3>
                <p className="text-sm text-gray-600 mb-3">Format: Name, Email, Position (one per line)</p>
                <textarea
                  className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder="John Doe, john@example.com, Developer&#10;Jane Smith, jane@example.com, Designer"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                />
                <Button onClick={handleCSVUpload} disabled={loading || !csvData.trim()}>
                  Upload CSV
                </Button>
              </div>

              {/* Employee list */}
              {employees.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Added employees ({employees.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {employees.map((employee) => (
                      <div key={employee.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-600">
                            Code: {employee.accessCode}
                            {employee.position && ` • ${employee.position}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleFinish}>{employees.length > 0 ? "Finish Setup" : "Skip for now"}</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
