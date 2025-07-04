// Storage service abstraction - easily swappable for real backend
export class StorageService {
  private static instance: StorageService

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  // Generic storage methods
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value))
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async getAll<T>(prefix: string): Promise<T[]> {
    const items: T[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        const item = await this.get<T>(key)
        if (item) items.push(item)
      }
    }
    return items
  }

  // Generate unique IDs
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Generate access codes
  generateAccessCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase()
  }
}

export const storage = StorageService.getInstance()
