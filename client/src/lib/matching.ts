import { apiRequest } from "./queryClient";

export interface MatchResult {
  id: number;
  userId: number;
  projectId: number;
  status: 'pending' | 'matched' | 'passed';
  createdAt: string;
}

export async function matchWithProject(projectId: number, action: 'like' | 'pass'): Promise<MatchResult> {
  const response = await apiRequest("POST", "/api/matches", { projectId, action });
  return response.json();
}

export async function getSuggestedProjects(latitude: number, longitude: number) {
  const response = await apiRequest(
    "GET", 
    `/api/projects/suggestions?latitude=${latitude}&longitude=${longitude}`
  );
  return response.json();
}

export async function getUserMatches() {
  const response = await apiRequest("GET", "/api/matches");
  return response.json();
}
