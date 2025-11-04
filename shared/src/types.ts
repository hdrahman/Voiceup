// Shared types for VoiceUp

export enum Role {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN',
}

export enum Category {
  ROADS = 'ROADS',
  WASTE = 'WASTE',
  SAFETY = 'SAFETY',
  LIGHTING = 'LIGHTING',
  OTHER = 'OTHER',
}

export enum Status {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export interface User {
  id: string
  email: string
  role: Role
  isBanned?: boolean
  createdAt: Date | string
}

export interface Report {
  id: string
  title: string
  description: string
  category: Category
  status: Status
  lat: number
  lng: number
  address: string
  imageData?: string
  audioData?: string
  upvotes: number
  anonymous: boolean
  isArchived?: boolean
  createdAt: Date | string
  updatedAt: Date | string
  userId?: string
  user?: User
  comments?: Comment[]
  upvoteUsers?: Upvote[]
  hasUpvoted?: boolean
}

export interface Comment {
  id: string
  text: string
  createdAt: Date | string
  reportId: string
  userId: string
  user: User
}

export interface Upvote {
  id: string
  createdAt: Date | string
  reportId: string
  userId: string
}

// API Request/Response types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface CreateReportRequest {
  title: string
  description: string
  category: Category
  lat: number
  lng: number
  address: string
  imageData?: string
  audioData?: string
  anonymous?: boolean
}

export interface UpdateReportStatusRequest {
  status: Status
}

export interface CreateCommentRequest {
  text: string
}

export interface UpdateReportRequest {
  title?: string
  description?: string
  category?: Category
  status?: Status
}

export interface BulkReportActionRequest {
  reportIds: string[]
  action: 'delete' | 'archive' | 'unarchive'
}

export interface UpdateUserRoleRequest {
  role: Role
}

export interface UpdateUserBanRequest {
  isBanned: boolean
}

export interface ReportFilters {
  category?: Category
  status?: Status
  search?: string
  sortBy?: 'newest' | 'upvotes' | 'nearest'
  lat?: number
  lng?: number
}

export interface Stats {
  totalReports: number
  resolvedToday: number
  activeIssues: number
  avgResolutionTime: number
  byCategory: Record<Category, number>
  recentActivity: Report[]
}

// Category metadata
export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.ROADS]: 'Roads',
  [Category.WASTE]: 'Waste Management',
  [Category.SAFETY]: 'Public Safety',
  [Category.LIGHTING]: 'Street Lighting',
  [Category.OTHER]: 'Other',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.ROADS]: '#EF4444', // red
  [Category.WASTE]: '#10B981', // green
  [Category.SAFETY]: '#F59E0B', // amber
  [Category.LIGHTING]: '#3B82F6', // blue
  [Category.OTHER]: '#8B5CF6', // purple
}

export const STATUS_LABELS: Record<Status, string> = {
  [Status.NEW]: 'New',
  [Status.IN_PROGRESS]: 'In Progress',
  [Status.RESOLVED]: 'Resolved',
}

export const STATUS_COLORS: Record<Status, string> = {
  [Status.NEW]: '#EF4444', // red
  [Status.IN_PROGRESS]: '#F59E0B', // amber
  [Status.RESOLVED]: '#10B981', // green
}
