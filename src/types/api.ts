// Standard backend response envelope: { data, message }
export interface ApiResponse<T> {
  data: T
  message: string
}

export interface ApiError {
  message: string
  status: number
}

// GET /admin/revenue response shape
export interface RevenueData {
  totalRevenue: number
  listingFeeRevenue: number
  contactRevealRevenue: number
  contactRevealsThisMonth: number
  paidListingsThisMonth: number
  activeAgentSubscriptions: number
  activeUserSubscriptions: number
}
