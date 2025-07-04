export interface User {
  id: string
  email: string
  name: string
  role: "employer" | "employee"
  companyId?: string
  accessCode?: string
  avatar?: string
  position?: string
  createdAt: string
}

export interface Company {
  id: string
  name: string
  description?: string 
  logo?: string
  timezone: string
  ownerId: string
  createdAt: string
}

export interface Employee {
  id: string
  name: string
  email?: string
  accessCode: string
  companyId: string
  position?: string
  avatar?: string
  isActive: boolean
  createdAt: string
}

export interface WorkShift {
  id: string
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  breakMinutes?: number
  description?: string
}

export interface EODReport {
  id: string
  employeeId: string
  companyId: string
  date: string
  summary: string
  shifts: WorkShift[]
  totalHours: number
  attachments?: string[]
  status: "draft" | "submitted"
  submittedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  company?: Company
}

export interface DashboardStats {
  totalSubmissions: number
  pendingEODs: number
  activeEmployees: number
  averageHours: number
}
