"use client"

import { Button } from "@/components/ui/button"

interface TestModeBannerProps {
  userRole: "employer" | "employee"
  onSwitchMode: (role: "employer" | "employee") => void
}

export function TestModeBanner({ userRole, onSwitchMode }: TestModeBannerProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xs">🧪</span>
            </div>
            <div>
              <span className="font-medium">Test Mode Active</span>
              <span className="ml-2 text-sm opacity-90">
                You&apos;re testing as {userRole === "employer" ? "an Employer" : "an Employee"} with sample data
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSwitchMode(userRole === "employer" ? "employee" : "employer")}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Switch to {userRole === "employer" ? "Employee" : "Employer"} View
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
