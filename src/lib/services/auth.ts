import type { User, Company, AuthState, Employee } from "../types"
import { storage } from "./storage"

export class AuthService {
  private static instance: AuthService

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async signUp(
    email: string,
    password: string,
    name: string,
    role: "employer" | "employee" = "employer",
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await storage.get<User>(`user:${email}`)
    if (existingUser) {
      throw new Error("User already exists")
    }

    const user: User = {
      id: storage.generateId(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    }

    await storage.set(`user:${email}`, user)
    await this.setCurrentUser(user)

    return user
  }

  async signIn(email: string): Promise<User> {
    const user = await storage.get<User>(`user:${email}`)
    if (!user) {
      throw new Error("User not found")
    }

    await this.setCurrentUser(user)
    return user
  }

  async signInWithAccessCode(accessCode: string): Promise<User> {
    // Find employee by access code
    const employees = await storage.getAll<Employee>("employee:")
    const employee = employees.find((emp) => emp.accessCode === accessCode)

    if (!employee) {
      throw new Error("Invalid access code")
    }

    // Create or get user for this employee
    let user = await storage.get<User>(`user:employee:${employee.id}`)
    if (!user) {
      user = {
        id: employee.id,
        email: employee.email || "",
        name: employee.name,
        role: "employee",
        companyId: employee.companyId,
        accessCode: employee.accessCode,
        position: employee.position,
        avatar: employee.avatar,
        createdAt: employee.createdAt,
      }
      await storage.set(`user:employee:${employee.id}`, user)
    }

    await this.setCurrentUser(user)
    return user
  }

  async testMode(role: "employer" | "employee" = "employer"): Promise<User> {
    // First, clear all existing test employees
    const allItems = await storage.getAll("")
    for (const key of Object.keys(allItems)) {
      // Delete all test employees and their reports
      if (key.startsWith("employee:test-") || key.startsWith("eod:test-employee")) {
        await storage.remove(key)
      }
    }

    // Create test user and company (existing code)
    const user: User = {
      id: "test-user",
      name: role === "employer" ? "Amanda Thompson" : "John Developer",
      email: role === "employer" ? "amanda@example.com" : "john@example.com",
      role: role,
      companyId: "test-company",
      createdAt: new Date().toISOString(),
    }

    await storage.set(`user:${user.id}`, user)

    const company: Company = {
      id: "test-company",
      name: "Acme Inc",
      timezone: "America/New_York",
      ownerId: user.id,
      description: "A test company for demonstration purposes",
      logo: "https://ui-avatars.com/api/?name=Acme+Inc&background=0D8ABC&color=fff",
      createdAt: new Date().toISOString(),
    }

    await storage.set(`company:${company.id}`, company)

    // Create exactly 10 fixed test employees
    const testEmployees = [
      { name: "Sarah Johnson", position: "Frontend Developer", email: "sarah@example.com" },
      { name: "Emily Rodriguez", position: "UX Designer", email: "emily@example.com" },
      { name: "James Wilson", position: "Backend Developer", email: "james@example.com" },
      { name: "Michael Brown", position: "Project Manager", email: "michael@example.com" },
      { name: "Jessica Taylor", position: "QA Engineer", email: "jessica@example.com" },
      { name: "David Martinez", position: "DevOps Engineer", email: "david@example.com" },
      { name: "Jennifer Garcia", position: "Product Manager", email: "jennifer@example.com" },
      { name: "Robert Miller", position: "Data Scientist", email: "robert@example.com" },
      { name: "Lisa Anderson", position: "Marketing Specialist", email: "lisa@example.com" },
      { name: "Kevin Thomas", position: "Sales Representative", email: "kevin@example.com" },
    ]

    const employees: Employee[] = []

    // Create a fixed set of employees
    for (let i = 0; i < testEmployees.length; i++) {
      const employeeData = testEmployees[i]
      const employee: Employee = {
        id: `test-employee-${i + 1}`,
        name: employeeData.name,
        email: employeeData.email,
        position: employeeData.position,
        companyId: company.id,
        isActive: true,
        accessCode: `TEST${1000 + i}`,
        createdAt: new Date().toISOString(),
      }

      await storage.set(`employee:${employee.id}`, employee)
      employees.push(employee)
    }

    // Create sample EOD reports for the test employees
    const today = new Date()
    const eodReports = []

    // Create reports for the last 7 days for a few employees
    for (let i = 0; i < 7; i++) {
      const reportDate = new Date(today)
      reportDate.setDate(reportDate.getDate() - i)
      const dateString = reportDate.toISOString().split('T')[0]
      
      // Create reports for 3-4 random employees each day
      const numReports = 3 + Math.floor(Math.random() * 2) // 3 or 4 reports
      const randomEmployees = [...employees]
        .sort(() => Math.random() - 0.5)
        .slice(0, numReports)
      
      for (const employee of randomEmployees) {
        // Random shifts with different patterns
        const shifts = [
          {
            startTime: "08:00",
            endTime: "16:00",
            breakMinutes: 60,
            description: i % 2 === 0 ? "Early shift" : "Regular shift"
          }
        ]
        
        // Calculate hours from shifts
        const totalMinutes = 8 * 60 - 60 // 8 hours minus 1 hour break
        const totalHours = totalMinutes / 60
        
        // Random summaries based on job roles
        let summary = ""
        if (employee.position?.includes("Developer")) {
          summary = "Worked on implementing new features. Fixed bugs in the user interface. Participated in code review with the team."
        } else if (employee.position?.includes("Designer")) {
          summary = "Finished the wireframes for the mobile app redesign. Conducted user interviews and gathered valuable feedback. Created prototypes for the new onboarding flow."
        } else if (employee.position?.includes("Manager")) {
          summary = "Led team meeting and sprint planning. Coordinated with other departments on upcoming initiatives. Updated project timelines and resource allocation."
        } else {
          summary = "Completed assigned tasks for the current sprint. Participated in team meetings and provided updates. Collaborated with team members on ongoing projects."
        }
        
        // Create the report
        const report = {
          id: `${employee.id}-${dateString}`,
          employeeId: employee.id,
          companyId: employee.companyId,
          date: dateString,
          summary,
          shifts,
          hoursWorked: totalHours,
          totalHours: totalHours,
          status: "submitted",
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        await storage.set(`eod:${report.id}`, report)
        eodReports.push(report)
      }
    }

    // Add employee-specific reports when in employee mode
    if (role === "employee") {
      // Clear any existing reports for this test user
      const existingReports = await storage.getAll<Record<string, unknown>>("eod:")
      for (const key of Object.keys(existingReports)) {
        if (key.includes(user.id)) {
          await storage.remove(key)
        }
      }
      
      // Create past reports for this employee (14 days worth of data)
      for (let i = 1; i < 15; i++) {
        const reportDate = new Date(today)
        reportDate.setDate(reportDate.getDate() - i)
        const dateString = reportDate.toISOString().split('T')[0]
        
        // Vary the shifts patterns
        let shifts = []
        
        if (i % 4 === 0) {
          // Night shift
          shifts = [{
            startTime: "22:00",
            endTime: "06:00", 
            breakMinutes: 30,
            description: "Night shift"
          }]
        } else if (i % 3 === 0) {
          // Split shift
          shifts = [
            {
              startTime: "09:00",
              endTime: "12:00",
              breakMinutes: 0,
              description: "Morning session"
            },
            {
              startTime: "14:00",
              endTime: "18:00",
              breakMinutes: 15,
              description: "Afternoon session"
            }
          ]
        } else {
          // Regular day shift
          shifts = [{
            startTime: "09:00",
            endTime: "17:30",
            breakMinutes: 45,
            description: "Regular day"
          }]
        }
        
        // Calculate total hours based on shifts
        let totalHours = 0
        for (const shift of shifts) {
          const [startHour, startMin] = shift.startTime.split(":").map(Number)
          const [endHour, endMin] = shift.endTime.split(":").map(Number)
          
          const startMinutes = startHour * 60 + startMin
          let endMinutes = endHour * 60 + endMin
          
          // Handle overnight shifts
          if (endMinutes < startMinutes) {
            endMinutes += 24 * 60
          }
          
          totalHours += (endMinutes - startMinutes - shift.breakMinutes) / 60
        }
        
        // Create varied summaries based on day of week
        const summaries = [
          "Worked on frontend components for the dashboard. Fixed responsive layout issues on mobile.",
          "Implemented API integration with backend services. Added error handling and loading states.",
          "Refactored CSS using Tailwind utilities. Improved button and form components.",
          "Created unit tests for core utilities. Fixed failing tests in CI pipeline.",
          "Participated in sprint planning and estimated upcoming tasks. Updated documentation.",
          "Collaborated with design team on new features. Built interactive prototypes.",
          "Code review and pair programming with junior devs. Knowledge sharing session."
        ]
        
        // Pick a summary based on the day
        const summary = summaries[i % summaries.length]
        
        // Create the employee report
        const report = {
          id: `${user.id}-${dateString}`,
          employeeId: user.id,
          companyId: user.companyId,
          date: dateString,
          summary,
          shifts,
          hoursWorked: totalHours,
          totalHours: totalHours,
          status: "submitted",
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        await storage.set(`eod:${report.id}`, report)
      }
      
      // Create a draft report for today
      const todayReport = {
        id: `${user.id}-${today.toISOString().split('T')[0]}`,
        employeeId: user.id,
        companyId: user.companyId,
        date: today.toISOString().split('T')[0],
        summary: "Started working on the new notification system. Currently implementing the UI components.",
        shifts: [
          {
            startTime: "09:00",
            endTime: "13:00", 
            breakMinutes: 15,
            description: "Morning session"
          }
        ],
        hoursWorked: 3.75,
        totalHours: 3.75,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      await storage.set(`eod:${todayReport.id}`, todayReport)
    }

    await this.setCurrentUser(user)
    return user
  }

  async getCurrentUser(): Promise<User | null> {
    return await storage.get<User>("currentUser")
  }

  async setCurrentUser(user: User): Promise<void> {
    await storage.set("currentUser", user)
  }

  async signOut(): Promise<void> {
    await storage.remove("currentUser")
  }

  async getAuthState(): Promise<AuthState> {
    const user = await this.getCurrentUser()
    let company: Company | undefined

    if (user?.companyId) {
      company = (await storage.get<Company>(`company:${user.companyId}`)) || undefined
    }

    return {
      user,
      isAuthenticated: !!user,
      company,
    }
  }
}

export const authService = AuthService.getInstance()
