import type {
  PaymentMethod,
  PaymentStatus,
  RevealMethod,
  SubscriptionType,
  SubscriptionStatus,
} from "./enums"

export interface ListingPayment {
  id: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  externalRef: string | null
  initiatedAt: string
  completedAt: string | null
  listingId: string
  agentId: string
}

export interface ContactReveal {
  id: string
  amount: number
  method: RevealMethod
  externalRef: string | null
  createdAt: string
  listingId: string
  userId: string
}

export interface UserSubscription {
  id: string
  type: SubscriptionType
  status: SubscriptionStatus
  amount: number
  method: PaymentMethod
  startDate: string
  endDate: string
  renewedAt: string | null
  externalRef: string | null
  createdAt: string
  userId: string
}

// Shapes returned by the payment initiation endpoints
export interface InitiatePaymentResponse {
  externalRef: string
  amount: number
  method: PaymentMethod
}

export interface InitiateSubscriptionResponse {
  externalRef: string
  amount: number
  method: PaymentMethod
  type: SubscriptionType
}
