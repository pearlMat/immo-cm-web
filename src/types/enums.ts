export enum UserRole {
  PUBLIC_USER = "PUBLIC_USER",
  AGENT = "AGENT",
  ADMIN = "ADMIN",
}

export enum UserAccountType {
  AGENT = "AGENT",
  LANDLORD = "LANDLORD",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
}

export enum ListingType {
  RENT = "RENT",
  SALE = "SALE",
}

export enum PropertyType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
  STUDIO = "STUDIO",
  VILLA = "VILLA",
  LAND = "LAND",
  COMMERCIAL = "COMMERCIAL",
}

export enum ListingStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DELETED = "DELETED",
}

export enum PaymentPeriod {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  NEGOTIABLE = "NEGOTIABLE",
}

export enum PaymentMethod {
  MTN_MOMO = "MTN_MOMO",
  ORANGE_MONEY = "ORANGE_MONEY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

export enum RevealMethod {
  MTN_MOMO = "MTN_MOMO",
  ORANGE_MONEY = "ORANGE_MONEY",
  FREE = "FREE",
}

export enum NotificationType {
  LISTING_APPROVED = "LISTING_APPROVED",
  LISTING_REJECTED = "LISTING_REJECTED",
  NEW_PENDING_LISTING = "NEW_PENDING_LISTING",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  PAYMENT_EXPIRED = "PAYMENT_EXPIRED",
  CONTACT_REVEALED = "CONTACT_REVEALED",
}

export enum SubscriptionType {
  AGENT_PRO = "AGENT_PRO",
  USER_UNLIMITED_REVEALS = "USER_UNLIMITED_REVEALS",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}
