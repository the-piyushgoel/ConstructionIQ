export interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export enum Role {
  ADMIN = "ADMIN",
  PM = "PM",
  ENGINEER = "ENGINEER",
  VIEWER = "VIEWER",
}

export enum ProjectStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string | Date;
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate: string | Date;
  endDate: string | Date;
  budget: number;
  actualCost: number;
  ownerId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  budget: number;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  budget?: number;
  actualCost?: number;
}

export interface ProjectQuery {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
