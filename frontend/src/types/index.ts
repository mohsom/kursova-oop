export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateUserData {
  email: string;
  name: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingInterval: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'payment_failed';
  startDate: string;
  endDate: string;
  subscriptionEndDate: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: string;
  autoRenew: boolean;
  billingInterval: 'monthly' | 'yearly';
  plan?: SubscriptionPlan;
}

export interface CreateSubscriptionData {
  userId: string;
  planId: string;
  paymentMethod?: string;
  autoRenew?: boolean;
}

export interface Transaction {
  id: string;
  subscriptionId: string;
  userId: string;
  planId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'payment' | 'refund';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  paymentMethod?: string;
  description?: string;
}

export interface CreateTransactionData {
  subscriptionId: string;
  userId: string;
  planId: string;
  amount: number;
  paymentMethod?: string;
  description?: string;
}

export interface TransactionStats {
  totalTransactions: number;
  totalRevenue: number;
  successfulTransactions: number;
  failedTransactions: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  planStats: Array<{
    planId: string;
    planName: string;
    subscriptions: number;
    revenue: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
