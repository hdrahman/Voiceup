import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CreateReportRequest,
  UpdateReportStatusRequest,
  UpdateReportRequest,
  BulkReportActionRequest,
  UpdateUserRoleRequest,
  UpdateUserBanRequest,
  CreateCommentRequest,
  Report,
  Comment,
  Stats,
  ReportFilters,
  User,
} from '@shared/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiClient {
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (includeAuth) {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  // Auth
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  // Reports
  async createReport(data: CreateReportRequest): Promise<Report> {
    const res = await fetch(`${API_URL}/api/reports/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async getReports(filters?: ReportFilters): Promise<Report[]> {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.lat) params.append('lat', filters.lat.toString())
    if (filters?.lng) params.append('lng', filters.lng.toString())

    const res = await fetch(`${API_URL}/api/reports?${params}`, {
      headers: this.getHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async getReport(id: string): Promise<Report> {
    const res = await fetch(`${API_URL}/api/reports/${id}`, {
      headers: this.getHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async upvoteReport(id: string): Promise<{ upvoted: boolean }> {
    const res = await fetch(`${API_URL}/api/reports/${id}/upvote`, {
      method: 'POST',
      headers: this.getHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async addComment(id: string, data: CreateCommentRequest): Promise<Comment> {
    const res = await fetch(`${API_URL}/api/reports/${id}/comment`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async updateReportStatus(id: string, data: UpdateReportStatusRequest): Promise<Report> {
    const res = await fetch(`${API_URL}/api/reports/${id}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async updateReport(id: string, data: UpdateReportRequest): Promise<Report> {
    const res = await fetch(`${API_URL}/api/reports/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async deleteReport(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_URL}/api/reports/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async archiveReport(id: string, isArchived: boolean): Promise<Report> {
    const res = await fetch(`${API_URL}/api/reports/${id}/archive`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ isArchived }),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async bulkReportAction(data: BulkReportActionRequest): Promise<{ success: boolean; count: number }> {
    const res = await fetch(`${API_URL}/api/reports/bulk-action`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_URL}/api/users`, {
      headers: this.getHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async updateUserRole(id: string, data: UpdateUserRoleRequest): Promise<User> {
    const res = await fetch(`${API_URL}/api/users/${id}/role`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async updateUserBan(id: string, data: UpdateUserBanRequest): Promise<User> {
    const res = await fetch(`${API_URL}/api/users/${id}/ban`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  // Stats
  async getStats(): Promise<Stats> {
    const res = await fetch(`${API_URL}/api/stats`, {
      headers: this.getHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }
}

export const api = new ApiClient()
