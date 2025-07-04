import type { Company, Employee } from "../types"
import { storage } from "./storage"

export class CompanyService {
  private static instance: CompanyService

  static getInstance(): CompanyService {
    if (!CompanyService.instance) {
      CompanyService.instance = new CompanyService()
    }
    return CompanyService.instance
  }

  async createCompany(name: string, timezone: string, ownerId: string, logo?: string): Promise<Company> {
    const company: Company = {
      id: storage.generateId(),
      name,
      timezone,
      ownerId,
      logo,
      createdAt: new Date().toISOString(),
    }

    await storage.set(`company:${company.id}`, company)
    return company
  }

  async getCompany(id: string): Promise<Company | null> {
    return await storage.get<Company>(`company:${id}`)
  }

  async addEmployee(companyId: string, name: string, email?: string, position?: string): Promise<Employee> {
    const employee: Employee = {
      id: storage.generateId(),
      name,
      email,
      accessCode: storage.generateAccessCode(),
      companyId,
      position,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    await storage.set(`employee:${employee.id}`, employee)
    return employee
  }

  async getEmployees(companyId: string): Promise<Employee[]> {
    const allEmployees = await storage.getAll<Employee>("employee:")
    return allEmployees.filter((emp) => emp.companyId === companyId)
  }

  async addEmployeesFromCSV(companyId: string, csvData: string): Promise<Employee[]> {
    const lines = csvData.trim().split("\n")
    const employees: Employee[] = []

    for (let i = 1; i < lines.length; i++) {
      // Skip header
      const [name, email, position] = lines[i].split(",").map((s) => s.trim())
      if (name) {
        const employee = await this.addEmployee(companyId, name, email, position)
        employees.push(employee)
      }
    }

    return employees
  }

  async removeEmployee(employeeId: string): Promise<void> {
    await storage.remove(`employee:${employeeId}`)
  }
}

export const companyService = CompanyService.getInstance()
