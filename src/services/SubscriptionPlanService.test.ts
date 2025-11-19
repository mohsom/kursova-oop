import { SubscriptionPlanService } from './SubscriptionPlanService';
import { DatabaseService } from '../database/DatabaseInterface';
import { SubscriptionPlanData } from '../types/DatabaseTypes';
import { SubscriptionPlan } from '../models/SubscriptionPlan';

// Mock DatabaseService
const createMockDatabaseService = <T>(): jest.Mocked<DatabaseService<T>> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findBy: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('SubscriptionPlanService', () => {
  let planService: SubscriptionPlanService;
  let mockPlanRepository: jest.Mocked<DatabaseService<SubscriptionPlanData>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlanRepository = createMockDatabaseService<SubscriptionPlanData>();
    planService = new SubscriptionPlanService(mockPlanRepository);
  });

  describe('createPlan', () => {
    it('повинен створити місячний план підписки', async () => {
      const mockPlanData: SubscriptionPlanData = {
        id: '1',
        name: 'Basic Plan',
        price: 100,
        period: 'monthly',
      };

      mockPlanRepository.create.mockResolvedValue(mockPlanData);

      const plan = await planService.createPlan('Basic Plan', 100, 'monthly');

      expect(mockPlanRepository.create).toHaveBeenCalledWith({
        name: 'Basic Plan',
        price: 100,
        period: 'monthly',
      });
      expect(plan).toBeInstanceOf(SubscriptionPlan);
      expect(plan.name).toBe('Basic Plan');
      expect(plan.price).toBe(100);
      expect(plan.period).toBe('monthly');
    });

    it('повинен створити річний план підписки', async () => {
      const mockPlanData: SubscriptionPlanData = {
        id: '2',
        name: 'Premium Plan',
        price: 1200,
        period: 'yearly',
      };

      mockPlanRepository.create.mockResolvedValue(mockPlanData);

      const plan = await planService.createPlan('Premium Plan', 1200, 'yearly');

      expect(mockPlanRepository.create).toHaveBeenCalledWith({
        name: 'Premium Plan',
        price: 1200,
        period: 'yearly',
      });
      expect(plan.period).toBe('yearly');
    });
  });

  describe('getPlanById', () => {
    it('повинен отримати план за ID', async () => {
      const mockPlanData: SubscriptionPlanData = {
        id: '1',
        name: 'Basic Plan',
        price: 100,
        period: 'monthly',
      };

      mockPlanRepository.findById.mockResolvedValue(mockPlanData);

      const plan = await planService.getPlanById('1');

      expect(mockPlanRepository.findById).toHaveBeenCalledWith('1');
      expect(plan).toBeInstanceOf(SubscriptionPlan);
      expect(plan?.id).toBe('1');
      expect(plan?.name).toBe('Basic Plan');
    });

    it('повинен повернути null, якщо план не знайдений', async () => {
      mockPlanRepository.findById.mockResolvedValue(null);

      const plan = await planService.getPlanById('nonexistent');

      expect(plan).toBeNull();
    });
  });

  describe('getAllPlans', () => {
    it('повинен отримати всі плани', async () => {
      const mockPlansData: SubscriptionPlanData[] = [
        { id: '1', name: 'Basic Plan', price: 100, period: 'monthly' },
        { id: '2', name: 'Premium Plan', price: 1200, period: 'yearly' },
      ];

      mockPlanRepository.findAll.mockResolvedValue(mockPlansData);

      const plans = await planService.getAllPlans();

      expect(mockPlanRepository.findAll).toHaveBeenCalled();
      expect(plans).toHaveLength(2);
      expect(plans[0]).toBeInstanceOf(SubscriptionPlan);
      expect(plans[0].name).toBe('Basic Plan');
      expect(plans[1].name).toBe('Premium Plan');
    });

    it('повинен повернути порожній масив, якщо планів немає', async () => {
      mockPlanRepository.findAll.mockResolvedValue([]);

      const plans = await planService.getAllPlans();

      expect(plans).toEqual([]);
    });
  });

  describe('updatePlan', () => {
    it('повинен оновити назву плану', async () => {
      const mockUpdatedPlan: SubscriptionPlanData = {
        id: '1',
        name: 'Basic Plan Updated',
        price: 100,
        period: 'monthly',
      };

      mockPlanRepository.update.mockResolvedValue(mockUpdatedPlan);

      const plan = await planService.updatePlan('1', 'Basic Plan Updated', undefined, undefined);

      expect(mockPlanRepository.update).toHaveBeenCalledWith('1', { name: 'Basic Plan Updated' });
      expect(plan?.name).toBe('Basic Plan Updated');
    });

    it('повинен оновити ціну плану', async () => {
      const mockUpdatedPlan: SubscriptionPlanData = {
        id: '1',
        name: 'Basic Plan',
        price: 150,
        period: 'monthly',
      };

      mockPlanRepository.update.mockResolvedValue(mockUpdatedPlan);

      const plan = await planService.updatePlan('1', undefined, 150, undefined);

      expect(mockPlanRepository.update).toHaveBeenCalledWith('1', { price: 150 });
      expect(plan?.price).toBe(150);
    });

    it('повинен оновити період плану', async () => {
      const mockUpdatedPlan: SubscriptionPlanData = {
        id: '1',
        name: 'Basic Plan',
        price: 100,
        period: 'yearly',
      };

      mockPlanRepository.update.mockResolvedValue(mockUpdatedPlan);

      const plan = await planService.updatePlan('1', undefined, undefined, 'yearly');

      expect(mockPlanRepository.update).toHaveBeenCalledWith('1', { period: 'yearly' });
      expect(plan?.period).toBe('yearly');
    });

    it('повинен оновити всі поля плану одночасно', async () => {
      const mockUpdatedPlan: SubscriptionPlanData = {
        id: '1',
        name: 'Pro Plan',
        price: 500,
        period: 'yearly',
      };

      mockPlanRepository.update.mockResolvedValue(mockUpdatedPlan);

      const plan = await planService.updatePlan('1', 'Pro Plan', 500, 'yearly');

      expect(mockPlanRepository.update).toHaveBeenCalledWith('1', {
        name: 'Pro Plan',
        price: 500,
        period: 'yearly',
      });
      expect(plan?.name).toBe('Pro Plan');
      expect(plan?.price).toBe(500);
      expect(plan?.period).toBe('yearly');
    });

    it('повинен повернути null, якщо план не знайдений', async () => {
      mockPlanRepository.update.mockResolvedValue(null);

      const plan = await planService.updatePlan('nonexistent', 'Test', 100, 'monthly');

      expect(plan).toBeNull();
    });
  });

  describe('deletePlan', () => {
    it('повинен видалити план', async () => {
      mockPlanRepository.delete.mockResolvedValue(true);

      const result = await planService.deletePlan('1');

      expect(mockPlanRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('повинен повернути false, якщо план не знайдений', async () => {
      mockPlanRepository.delete.mockResolvedValue(false);

      const result = await planService.deletePlan('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getPlansByPeriod', () => {
    it('повинен отримати всі місячні плани', async () => {
      const mockMonthlyPlans: SubscriptionPlanData[] = [
        { id: '1', name: 'Basic Monthly', price: 100, period: 'monthly' },
        { id: '2', name: 'Pro Monthly', price: 500, period: 'monthly' },
      ];

      mockPlanRepository.findBy.mockResolvedValue(mockMonthlyPlans);

      const plans = await planService.getPlansByPeriod('monthly');

      expect(mockPlanRepository.findBy).toHaveBeenCalledWith({ period: 'monthly' });
      expect(plans).toHaveLength(2);
      expect(plans[0].period).toBe('monthly');
      expect(plans[1].period).toBe('monthly');
    });

    it('повинен отримати всі річні плани', async () => {
      const mockYearlyPlans: SubscriptionPlanData[] = [
        { id: '3', name: 'Basic Yearly', price: 1000, period: 'yearly' },
      ];

      mockPlanRepository.findBy.mockResolvedValue(mockYearlyPlans);

      const plans = await planService.getPlansByPeriod('yearly');

      expect(mockPlanRepository.findBy).toHaveBeenCalledWith({ period: 'yearly' });
      expect(plans).toHaveLength(1);
      expect(plans[0].period).toBe('yearly');
    });

    it('повинен повернути порожній масив, якщо планів з таким періодом немає', async () => {
      mockPlanRepository.findBy.mockResolvedValue([]);

      const plans = await planService.getPlansByPeriod('monthly');

      expect(plans).toEqual([]);
    });
  });
});
