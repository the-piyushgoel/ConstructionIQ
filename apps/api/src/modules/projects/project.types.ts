export interface CreateProjectInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
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
