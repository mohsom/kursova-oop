/**
 * Типи для роботи з базою даних
 */

export interface UserData {
    id: string;
    name: string;
    email: string;
}

export interface SubscriptionPlanData {
    id: string;
    name: string;
    price: number;
    period: 'monthly' | 'yearly';
}

export interface UserSubscriptionData {
    id: string;
    email: string;
    planId: string;
    status: string;
    startDate: string;
    endDate: string;
    subscriptionEndDate: string;
    price: number;
    createdAt: string;
    updatedAt: string;
    autoRenew: boolean;
    billingInterval: string;
}

export interface TransactionData {
    id: string;
    amount: number;
    email: string;
    subscriptionPlanId: string;
}
