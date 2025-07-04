"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Employee } from "@/lib/types"

interface EmployeeManagementProps {
  employees: Employee[]
  onAddEmployee: (name: string, email: string, position: string) => Promise<void>
  onRemoveEmployee: (employeeId: string) => Promise<void>
}

export function EmployeeManagement({ employees, onAddEmployee, onRemoveEmployee }: EmployeeManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    position: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmployee.name.trim()) return

    setLoading(true)
    try {
      await onAddEmployee(newEmployee.name, newEmployee.email, newEmployee.position)
      setNewEmployee({ name: "", email: "", position: "" })
      setShowAddForm(false)
    } catch (error) {
      console.error("Failed to add employee:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // You could add a toast notification here
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Team Members ({employees.length})</CardTitle>
          <Button onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? "Cancel" : "Add Employee"}</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Employee Name *</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                    <Input
                      type="email"
                      placeholder="john@company.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Position (Optional)</label>
                  <Input
                    type="text"
                    placeholder="Software Developer"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading || !newEmployee.name.trim()}>
                    {loading ? "Creating..." : "Create Employee"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {employees.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-gray-600 mb-2">No team members yet</p>
            <p className="text-sm text-gray-500">Add your first employee to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{employee.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {employee.position && <span>{employee.position}</span>}
                        {employee.position && employee.email && <span>•</span>}
                        {employee.email && <span>{employee.email}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">Access Code</p>
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-white border rounded text-sm font-mono">{employee.accessCode}</code>
                      <button
                        onClick={() => copyAccessCode(employee.accessCode ?? "")}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy access code"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveEmployee(employee.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {employees.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-medium text-blue-900 mb-2">📋 How employees access their accounts:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Share the access code with your employee</li>
              <li>2. They visit the login page and click &quot;Employee? Use access code&quot;</li>
              <li>3. They enter their unique access code to access their EOD reporting</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
