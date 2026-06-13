export interface PlatformConfig {
  key: string
  value: string
}

export type PlatformConfigKey =
  | "monetization_enabled" // 'true' | 'false'
  | "contact_reveal_fee" // integer string, e.g. '500'
  | "listing_fee_type" // 'per_listing' | 'subscription'
  | "listing_fee_amount" // integer string
  | "listing_subscription_price" // integer string
  | "contact_subscription_price" // integer string
  | "agent_pro_fee" // integer string
  | "user_unlimited_reveals_fee" // integer string

export interface ParsedPlatformConfig {
  monetizationEnabled: boolean
  contactRevealFee: number
  listingFeeType: "per_listing" | "subscription"
  listingFeeAmount: number
  listingSubscriptionPrice: number
  contactSubscriptionPrice: number
  agentProFee: number
  userUnlimitedRevealsFee: number
}
