import axios from 'axios';
import {
    User,
    CreateUserData,
    Subscription,
    CreateSubscriptionData,
    SubscriptionPlan,
    Transaction,
    CreateTransactionData,
    TransactionStats,
    ApiResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// User API
export const userApi = {
    getAllUsers: async (): Promise<User[]> => {
        const response = await api.get<ApiResponse<User[]>>('/users');
        return response.data.data || [];
    },

    getUserById: async (id: string): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data.data!;
    },

    createUser: async (userData: CreateUserData): Promise<User> => {
        const response = await api.post<ApiResponse<User>>('/users', userData);
        return response.data.data!;
    },

    updateUser: async (id: string, userData: Partial<CreateUserData>): Promise<User> => {
        const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
        return response.data.data!;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};

// Subscription Plan API
export const planApi = {
    getAllPlans: async (): Promise<SubscriptionPlan[]> => {
        const response = await api.get<ApiResponse<SubscriptionPlan[]>>('/plans');
        return response.data.data || [];
    },

    getPlanById: async (id: string): Promise<SubscriptionPlan> => {
        const response = await api.get<ApiResponse<SubscriptionPlan>>(`/plans/${id}`);
        return response.data.data!;
    },

    createPlan: async (planData: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> => {
        const response = await api.post<ApiResponse<SubscriptionPlan>>('/plans', planData);
        return response.data.data!;
    },

    updatePlan: async (id: string, planData: Partial<Omit<SubscriptionPlan, 'id'>>): Promise<SubscriptionPlan> => {
        const response = await api.put<ApiResponse<SubscriptionPlan>>(`/plans/${id}`, planData);
        return response.data.data!;
    },

    deletePlan: async (id: string): Promise<void> => {
        await api.delete(`/plans/${id}`);
    },
};

// Subscription API
export const subscriptionApi = {
    getAllSubscriptions: async (): Promise<Subscription[]> => {
        const response = await api.get<ApiResponse<Subscription[]>>('/subscriptions');
        return response.data.data || [];
    },

    getSubscriptionById: async (id: string): Promise<Subscription> => {
        const response = await api.get<ApiResponse<Subscription>>(`/subscriptions/${id}`);
        return response.data.data!;
    },

    getUserSubscriptions: async (userId: string): Promise<Subscription[]> => {
        const response = await api.get<ApiResponse<Subscription[]>>(`/users/${userId}/subscriptions`);
        return response.data.data || [];
    },

    getUserSubscriptionsByEmail: async (email: string): Promise<Subscription[]> => {
        const response = await api.get<ApiResponse<Subscription[]>>(`/payment/user/${email}/subscriptions`);
        return response.data.data || [];
    },

    createSubscription: async (subscriptionData: CreateSubscriptionData): Promise<Subscription> => {
        const response = await api.post<ApiResponse<Subscription>>('/subscriptions', subscriptionData);
        return response.data.data!;
    },

    cancelSubscription: async (id: string): Promise<Subscription> => {
        const response = await api.post<ApiResponse<Subscription>>(`/subscriptions/${id}/cancel`);
        return response.data.data!;
    },

    activateSubscription: async (id: string): Promise<Subscription> => {
        const response = await api.put<ApiResponse<Subscription>>(`/subscriptions/${id}`, {
            status: 'active'
        });
        return response.data.data!;
    },
};

// Transaction API
export const transactionApi = {
    getAllTransactions: async (): Promise<Transaction[]> => {
        const response = await api.get<ApiResponse<Transaction[]>>('/transactions');
        return response.data.data || [];
    },

    getUserTransactions: async (userId: string): Promise<Transaction[]> => {
        const response = await api.get<ApiResponse<Transaction[]>>(`/users/${userId}/transactions`);
        return response.data.data || [];
    },

    getSubscriptionTransactions: async (subscriptionId: string): Promise<Transaction[]> => {
        const response = await api.get<ApiResponse<Transaction[]>>(`/subscriptions/${subscriptionId}/transactions`);
        return response.data.data || [];
    },

    createTransaction: async (transactionData: CreateTransactionData): Promise<Transaction> => {
        const response = await api.post<ApiResponse<Transaction>>('/transactions', transactionData);
        return response.data.data!;
    },

    completeTransaction: async (id: string): Promise<Transaction> => {
        const response = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/complete`);
        return response.data.data!;
    },

    failTransaction: async (id: string): Promise<Transaction> => {
        const response = await api.post<ApiResponse<Transaction>>(`/transactions/${id}/fail`);
        return response.data.data!;
    },

    getTransactionStats: async (userId?: string, planId?: string): Promise<TransactionStats> => {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (planId) params.append('planId', planId);

        const response = await api.get<ApiResponse<TransactionStats>>(`/transactions/stats?${params.toString()}`);
        return response.data.data!;
    },
};

export default api;
