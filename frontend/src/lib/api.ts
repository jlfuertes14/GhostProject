let baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
if (baseUrl && !baseUrl.endsWith('/api')) {
  baseUrl = baseUrl.replace(/\/+$/, '') + '/api';
}
const API_BASE_URL = baseUrl;

export interface Project {
  project_id: string;
  region: string;
  province: string;
  municipality: string;
  contract_cost: number;
  approved_budget: number;
  actual_start_date: string;
  target_completion_date: string;
  status: string;
}

export interface Analytics {
  total_projects: number;
  total_budget: number;
  avg_delay_days: number;
  regional_distribution: Record<string, number>;
}

export interface PredictionResult {
  delay_days: number;
  estimated_completion: string;
  projected_budget: number;
  cost_overrun_risk: boolean;
}

export async function fetchProjects(
  skip = 0, 
  limit = 50,
  search?: string,
  status?: string,
  region?: string,
  province?: string,
  municipality?: string,
  office?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      offset: skip.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append("search", search);
    if (status && status !== "all") params.append("status", status);
    if (region) params.append("region", region);
    if (province) params.append("province", province);
    if (municipality) params.append("municipality", municipality);
    if (office) params.append("office", office);
    if (sortBy) params.append("sort_by", sortBy);
    if (sortOrder) params.append("sort_order", sortOrder);

    const res = await fetch(`${API_BASE_URL}/projects?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch projects, status:", res.status);
      return [];
    }
    const data = await res.json();
    return data.projects || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function fetchAnalytics(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Failed to fetch analytics, status:", res.status);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return null;
  }
}

export async function fetchFilterOptions(region?: string, province?: string, municipality?: string) {
  try {
    const params = new URLSearchParams();
    if (region) params.append("region", region);
    if (province) params.append("province", province);
    if (municipality) params.append("municipality", municipality);

    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/options${qs}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch options: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return { regions: [], provinces: [], municipalities: [], offices: [] };
  }
}

export async function predictProject(data: any): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to run prediction");
  return res.json();
}

export async function retrainModel(file: File): Promise<{ status: string, message: string, records_processed: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/retrain`, {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to retrain pipeline");
  }
  
  return res.json();
}
