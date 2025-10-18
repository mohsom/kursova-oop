import axios from 'axios';
import type { User, SubscriptionPlan, Transaction, PaymentSimulation, ApiResponse, TransactionStats } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Users API
export const usersApi = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<ApiResponse<User[]>>('/users');
        return response.data.data || [];
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data.data!;
    },

    create: async (user: { name: string; email: string }): Promise<User> => {
        const response = await api.post<ApiResponse<User>>('/users', user);
        return response.data.data!;
    },

    update: async (id: string, user: { name: string; email: string }): Promise<User> => {
        const response = await api.put<ApiResponse<User>>(`/users/${id}`, user);
        return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};

// Subscription Plans API
export const plansApi = {
    getAll: async (): Promise<SubscriptionPlan[]> => {
        const response = await api.get<ApiResponse<SubscriptionPlan[]>>('/plans');
        return response.data.data || [];
    },

    getById: async (id: string): Promise<SubscriptionPlan> => {
        const response = await api.get<ApiResponse<SubscriptionPlan>>(`/plans/${id}`);
        return response.data.data!;
    },

    create: async (plan: { name: string; price: number; period: 'monthly' | 'yearly' }): Promise<SubscriptionPlan> => {
        const response = await api.post<ApiResponse<SubscriptionPlan>>('/plans', plan);
        return response.data.data!;
    },

    update: async (id: string, plan: { name: string; price: number; period: 'monthly' | 'yearly' }): Promise<SubscriptionPlan> => {
        const response = await api.put<ApiResponse<SubscriptionPlan>>(`/plans/${id}`, plan);
        return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/plans/${id}`);
    },
};

// Payment API
export const paymentApi = {
    simulate: async (payment: PaymentSimulation): Promise<unknown> => {
        const response = await api.post<ApiResponse<unknown>>('/payment/simulate', payment);
        return response.data.data!;
    },

    getStats: async (): Promise<TransactionStats> => {
        const response = await api.get<ApiResponse<TransactionStats>>('/payment/stats');
        return response.data.data!;
    },

    getUserTransactions: async (email: string): Promise<Transaction[]> => {
        const response = await api.get<ApiResponse<Transaction[]>>(`/payment/user/${email}/transactions`);
        return response.data.data || [];
    },

    getTransactions: async (): Promise<Transaction[]> => {
        const response = await api.get<ApiResponse<Transaction[]>>('/payment/transactions');
        return response.data.data || [];
    },
};

export default api;
