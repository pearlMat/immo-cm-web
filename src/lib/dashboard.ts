import { UserRole } from "@/types/enums"

export const AGENT_DASHBOARD = "/agent/tableau-de-bord"
export const ADMIN_DASHBOARD = "/admin/tableau-de-bord"

export function dashboardFor(role: UserRole | null): string {
  return role === UserRole.ADMIN ? ADMIN_DASHBOARD : AGENT_DASHBOARD
}
