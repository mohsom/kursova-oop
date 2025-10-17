export interface User {
    id: string;
    name: string;
    email: string;
    subscription?: {
        planName: string;
        status: string;
        endDate: string;
    };
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    period: 'monthly' | 'yearly';
}

export interface Transaction {
    id: string;
    amount: number;
    email: string;
    subscriptionPlanId: string;
    date: string;
}

export interface PaymentSimulation {
    userEmail: string;
    subscriptionPlanId: string;
    amount: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface TransactionStats {
    totalTransactions: number;
    totalAmount: number;
    averageAmount: number;
    transactionsByMonth: Array<{
        month: string;
        count: number;
        amount: number;
    }>;
}
