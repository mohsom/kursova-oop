import { UserSubscriptionService } from './UserSubscriptionService';
import { DatabaseService } from '../database/DatabaseInterface';
import { UserSubscriptionData } from '../types/DatabaseTypes';
import { UserSubscription } from '../models/UserSubscription';

// Mock DatabaseService
const createMockDatabaseService = <T>(): jest.Mocked<DatabaseService<T>> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findBy: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('UserSubscriptionService', () => {
  let subscriptionService: UserSubscriptionService;
  let mockSubscriptionRepository: jest.Mocked<DatabaseService<UserSubscriptionData>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscriptionRepository = createMockDatabaseService<UserSubscriptionData>();
    subscriptionService = new UserSubscriptionService(mockSubscriptionRepository);
  });

  describe('getUserSubscriptionsAsSubscription', () => {
    it('повинен отримати підписку користувача за email', async () => {
      const mockSubscriptionData: UserSubscriptionData = {
        id: 'sub1',
        email: 'ivan@example.com',
        subscriptionPlanId: 'plan1',
        subscriptionEndDate: '2025-12-31T00:00:00.000Z',
      };

      mockSubscriptionRepository.findBy.mockResolvedValue([mockSubscriptionData]);

      const subscription = await subscriptionService.getUserSubscriptionsAsSubscription('ivan@example.com');

      expect(mockSubscriptionRepository.findBy).toHaveBeenCalledWith({ email: 'ivan@example.com' });
      expect(subscription).toBeInstanceOf(UserSubscription);
      expect(subscription?.email).toBe('ivan@example.com');
      expect(subscription?.subscriptionPlanId).toBe('plan1');
    });

    it('повинен правильно конвертувати дату закінчення підписки', async () => {
      const mockSubscriptionData: UserSubscriptionData = {
        id: 'sub1',
        email: 'ivan@example.com',
        subscriptionPlanId: 'plan1',
        subscriptionEndDate: '2025-12-31T23:59:59.000Z',
      };

      mockSubscriptionRepository.findBy.mockResolvedValue([mockSubscriptionData]);

      const subscription = await subscriptionService.getUserSubscriptionsAsSubscription('ivan@example.com');

      expect(subscription?.subscriptionEndDate).toBeInstanceOf(Date);
      expect(subscription?.subscriptionEndDate.toISOString()).toBe('2025-12-31T23:59:59.000Z');
    });

    it('повинен повернути null, якщо підписка не знайдена', async () => {
      mockSubscriptionRepository.findBy.mockResolvedValue([]);

      const subscription = await subscriptionService.getUserSubscriptionsAsSubscription('nonexistent@example.com');

      expect(subscription).toBeNull();
    });

    it('повинен повернути першу підписку, якщо їх кілька', async () => {
      const mockSubscriptionsData: UserSubscriptionData[] = [
        {
          id: 'sub1',
          email: 'ivan@example.com',
          subscriptionPlanId: 'plan1',
          subscriptionEndDate: '2025-12-31T00:00:00.000Z',
        },
        {
          id: 'sub2',
          email: 'ivan@example.com',
          subscriptionPlanId: 'plan2',
          subscriptionEndDate: '2026-01-31T00:00:00.000Z',
        },
      ];

      mockSubscriptionRepository.findBy.mockResolvedValue(mockSubscriptionsData);

      const subscription = await subscriptionService.getUserSubscriptionsAsSubscription('ivan@example.com');

      expect(subscription?.subscriptionPlanId).toBe('plan1');
    });

    it('повинен працювати з різними форматами email', async () => {
      const mockSubscriptionData: UserSubscriptionData = {
        id: 'sub1',
        email: 'TEST@EXAMPLE.COM',
        subscriptionPlanId: 'plan1',
        subscriptionEndDate: '2025-12-31T00:00:00.000Z',
      };

      mockSubscriptionRepository.findBy.mockResolvedValue([mockSubscriptionData]);

      const subscription = await subscriptionService.getUserSubscriptionsAsSubscription('TEST@EXAMPLE.COM');

      expect(subscription?.email).toBe('TEST@EXAMPLE.COM');
    });

    it('повинен обробляти підписки з різними планами', async () => {
      const mockSubscriptionData: UserSubscriptionData = {
        id: 'sub1',
        email: 'maria@example.com',
        subscriptionPlanId: 'premium-plan-yearly',
        subscriptionEndDate: '2026-11-19T00:00:00.000Z',
      };

      mockSubscriptionRepository.findBy.mockResolvedValue([mockSubscriptionData]);

      const subscription = await subscriptionService.getUserSubscriptionsAsSubscription('maria@example.com');

      expect(subscription?.subscriptionPlanId).toBe('premium-plan-yearly');
    });
  });
});
