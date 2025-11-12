import type { User, SubscriptionPlan, Transaction } from '../types';

// Mock axios module
jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockInstance),
    },
  };
});

// Імпортуємо після mock
import { usersApi, plansApi, paymentApi } from './api';
import axios from 'axios';

// Отримуємо mock instance для використання в тестах
const mockAxiosInstance = (axios.create as jest.Mock)();

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('usersApi', () => {
    describe('getAll', () => {
      it('повинен отримати всіх користувачів', async () => {
        const mockUsers: User[] = [
          { id: '1', name: 'Іван', email: 'ivan@example.com' },
          { id: '2', name: 'Марія', email: 'maria@example.com' },
        ];

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { success: true, data: mockUsers },
        });

        const result = await usersApi.getAll();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users');
        expect(result).toEqual(mockUsers);
      });

      it('повинен повернути порожній масив, якщо даних немає', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { success: true, data: null },
        });

        const result = await usersApi.getAll();

        expect(result).toEqual([]);
      });
    });

    describe('getById', () => {
      it('повинен отримати користувача за ID', async () => {
        const mockUser: User = {
          id: '1',
          name: 'Іван',
          email: 'ivan@example.com',
        };

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { success: true, data: mockUser },
        });

        const result = await usersApi.getById('1');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/1');
        expect(result).toEqual(mockUser);
      });
    });

    describe('create', () => {
      it('повинен створити нового користувача', async () => {
        const newUser = { name: 'Петро', email: 'petro@example.com' };
        const createdUser: User = { id: '3', ...newUser };

        mockAxiosInstance.post.mockResolvedValueOnce({
          data: { success: true, data: createdUser },
        });

        const result = await usersApi.create(newUser);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', newUser);
        expect(result).toEqual(createdUser);
      });
    });

    describe('update', () => {
      it('повинен оновити користувача', async () => {
        const updateData = { name: 'Іван Оновлений', email: 'ivan_new@example.com' };
        const updatedUser: User = { id: '1', ...updateData };

        mockAxiosInstance.put.mockResolvedValueOnce({
          data: { success: true, data: updatedUser },
        });

        const result = await usersApi.update('1', updateData);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', updateData);
        expect(result).toEqual(updatedUser);
      });
    });

    describe('delete', () => {
      it('повинен видалити користувача', async () => {
        mockAxiosInstance.delete.mockResolvedValueOnce({
          data: { success: true },
        });

        await usersApi.delete('1');

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1');
      });
    });
  });

  describe('plansApi', () => {
    describe('getAll', () => {
      it('повинен отримати всі плани підписок', async () => {
        const mockPlans: SubscriptionPlan[] = [
          { id: '1', name: 'Basic', price: 100, period: 'monthly' },
          { id: '2', name: 'Premium', price: 1000, period: 'yearly' },
        ];

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { success: true, data: mockPlans },
        });

        const result = await plansApi.getAll();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/plans');
        expect(result).toEqual(mockPlans);
      });
    });

    describe('create', () => {
      it('повинен створити новий план', async () => {
        const newPlan = { name: 'Pro', price: 500, period: 'monthly' as const };
        const createdPlan: SubscriptionPlan = { id: '3', ...newPlan };

        mockAxiosInstance.post.mockResolvedValueOnce({
          data: { success: true, data: createdPlan },
        });

        const result = await plansApi.create(newPlan);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/plans', newPlan);
        expect(result).toEqual(createdPlan);
      });
    });

    describe('update', () => {
      it('повинен оновити план', async () => {
        const updateData = { name: 'Pro Updated', price: 600, period: 'monthly' as const };
        const updatedPlan: SubscriptionPlan = { id: '1', ...updateData };

        mockAxiosInstance.put.mockResolvedValueOnce({
          data: { success: true, data: updatedPlan },
        });

        const result = await plansApi.update('1', updateData);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/plans/1', updateData);
        expect(result).toEqual(updatedPlan);
      });
    });

    describe('delete', () => {
      it('повинен видалити план', async () => {
        mockAxiosInstance.delete.mockResolvedValueOnce({
          data: { success: true },
        });

        await plansApi.delete('1');

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/plans/1');
      });
    });
  });

  describe('paymentApi', () => {
    describe('simulate', () => {
      it('повинен симулювати платіж', async () => {
        const paymentData = {
          userEmail: 'ivan@example.com',
          subscriptionPlanId: '1',
          amount: 100,
        };

        const mockResponse = {
          success: true,
          message: 'Оплата успішна',
        };

        mockAxiosInstance.post.mockResolvedValueOnce({
          data: { success: true, data: mockResponse },
        });

        const result = await paymentApi.simulate(paymentData);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payment/simulate', paymentData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getTransactions', () => {
      it('повинен отримати всі транзакції', async () => {
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            amount: 100,
            email: 'ivan@example.com',
            subscriptionPlanId: '1',
            date: '2025-11-12',
          },
        ];

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { success: true, data: mockTransactions },
        });

        const result = await paymentApi.getTransactions();

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/payment/transactions');
        expect(result).toEqual(mockTransactions);
      });

      it('повинен повернути порожній масив, якщо транзакцій немає', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { success: true, data: null },
        });

        const result = await paymentApi.getTransactions();

        expect(result).toEqual([]);
      });
    });

    describe('getUserTransactions', () => {
      it('повинен отримати транзакції користувача', async () => {
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            amount: 100,
            email: 'ivan@example.com',
            subscriptionPlanId: '1',
            date: '2025-11-12',
          },
        ];

        mockAxiosInstance.get.mockResolvedValueOnce({
          data: { success: true, data: mockTransactions },
        });

        const result = await paymentApi.getUserTransactions('ivan@example.com');

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/payment/user/ivan@example.com/transactions'
        );
        expect(result).toEqual(mockTransactions);
      });
    });
  });
});
