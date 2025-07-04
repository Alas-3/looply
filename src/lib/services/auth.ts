import type { User, Company, AuthState, WorkShift, Employee, EODReport } from "../types"
import { storage } from "./storage"
import { eodService } from "./eod"

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

  async signIn(email: string, password: string): Promise<User> {
    const user = await storage.get<User>(`user:${email}`)
    if (!user) {
      throw new Error("User not found")
    }
    
    // In a real app, you would verify the password here
    if (password.length < 6) {
      throw new Error("Invalid password")
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
    const user: User = {
      id: "test-user",
      email: "test@example.com",
      name: "Test User",
      role,
      createdAt: new Date().toISOString(),
    }

    if (role === "employer") {
      // Create test company
      const company: Company = {
        id: "test-company",
        name: "Acme Corporation",
        timezone: "America/New_York",
        ownerId: user.id,
        createdAt: new Date().toISOString(),
      }
      await storage.set("company:test-company", company)
      user.companyId = company.id

      // Create test employees with sample data
      const testEmployees = [
        { name: "Sarah Johnson", position: "Frontend Developer", email: "sarah@acme.com" },
        { name: "Mike Chen", position: "Backend Developer", email: "mike@acme.com" },
        { name: "Emily Rodriguez", position: "UI/UX Designer", email: "emily@acme.com" },
        { name: "David Kim", position: "Product Manager", email: "david@acme.com" },
        { name: "Lisa Thompson", position: "QA Engineer", email: "lisa@acme.com" },
      ]

      const employees = []
      for (const emp of testEmployees) {
        const employee = {
          id: storage.generateId(),
          name: emp.name,
          email: emp.email,
          accessCode: storage.generateAccessCode(),
          companyId: company.id,
          position: emp.position,
          isActive: true,
          createdAt: new Date().toISOString(),
        }
        await storage.set(`employee:${employee.id}`, employee)
        employees.push(employee)
      }

      // Create sample EOD reports for the past week with shifts
      const today = new Date()
      for (let i = 0; i < 7; i++) {
        const reportDate = new Date(today)
        reportDate.setDate(today.getDate() - i)
        const dateString = reportDate.toISOString().split("T")[0]

        // Create reports for some employees (not all, to show realistic data)
        const employeesToReport = employees.slice(0, Math.floor(Math.random() * employees.length) + 1)

        for (const employee of employeesToReport) {
          const sampleSummaries = [
            `Completed the user authentication module and fixed several bugs in the login flow. Started working on the password reset functionality. Had a productive meeting with the design team about the new dashboard layout.`,
            `Worked on API optimization and reduced response times by 30%. Reviewed pull requests from the team and provided feedback. Set up monitoring for the new microservice deployment.`,
            `Finished the wireframes for the mobile app redesign. Conducted user interviews and gathered valuable feedback. Created prototypes for the new onboarding flow.`,
            `Sprint planning session went well - we have clear goals for the next two weeks. Reviewed the product roadmap and prioritized features based on user feedback. Met with stakeholders about Q1 objectives.`,
            `Fixed critical bugs in the payment processing system. Wrote comprehensive tests for the new features. Deployed the hotfix to production and monitored for any issues.`,
            `Collaborated with the development team on implementing the new design system. Updated component library documentation. Worked on accessibility improvements across the platform.`,
          ]

          // Generate realistic shifts
          const shiftPatterns = [
            // Regular 9-5
            [{ startTime: "09:00", endTime: "17:00", breakMinutes: 60, description: "Regular shift" }],
            // Early shift
            [{ startTime: "08:00", endTime: "16:00", breakMinutes: 60, description: "Early shift" }],
            // Split shift
            [
              { startTime: "09:00", endTime: "13:00", breakMinutes: 0, description: "Morning shift" },
              { startTime: "18:00", endTime: "22:00", breakMinutes: 30, description: "Evening shift" },
            ],
            // Part-time
            [{ startTime: "10:00", endTime: "14:00", breakMinutes: 30, description: "Part-time shift" }],
          ]

          const selectedPattern = shiftPatterns[Math.floor(Math.random() * shiftPatterns.length)]
          const shifts: WorkShift[] = selectedPattern.map((shift, index) => ({
            id: `shift-${employee.id}-${dateString}-${index}`,
            ...shift,
          }))

          const totalHours = shifts.reduce((total, shift) => {
            const [startHour, startMin] = shift.startTime.split(":").map(Number)
            const [endHour, endMin] = shift.endTime.split(":").map(Number)

            const startMinutes = startHour * 60 + startMin
            let endMinutes = endHour * 60 + endMin

            if (endMinutes < startMinutes) {
              endMinutes += 24 * 60
            }

            const totalMinutes = endMinutes - startMinutes - (shift.breakMinutes || 0)
            return total + Math.max(0, totalMinutes / 60)
          }, 0)

          const report = {
            id: `${employee.id}-${dateString}`,
            employeeId: employee.id,
            companyId: company.id,
            date: dateString,
            summary: sampleSummaries[Math.floor(Math.random() * sampleSummaries.length)],
            shifts,
            totalHours,
            status: Math.random() > 0.2 ? "submitted" : "draft", // 80% submitted
            submittedAt: Math.random() > 0.2 ? reportDate.toISOString() : undefined,
            createdAt: reportDate.toISOString(),
            updatedAt: reportDate.toISOString(),
          }
          await storage.set(`eod:${report.id}`, report)
        }
      }

      // Recalculate hours for all test reports
      const reports = await storage.getAll<EODReport>("eod:")
      for (const report of reports) {
        if (report.shifts && report.shifts.length > 0) {
          // Use the eodService's calculation method instead of direct assignment
          report.hoursWorked = eodService.calculateTotalHours(report.shifts)
          await storage.set(`eod:${report.id}`, report)
        }
      }
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
