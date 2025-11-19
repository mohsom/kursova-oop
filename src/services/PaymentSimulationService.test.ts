import { PaymentSimulationService } from './PaymentSimulationService';
import { DatabaseService } from '../database/DatabaseInterface';
import { UserSubscriptionData, TransactionData, SubscriptionPlanData } from '../types/DatabaseTypes';
import { UserSubscription } from '../models/UserSubscription';
import { Transaction } from '../models/Transaction';

// Mock DatabaseService
const createMockDatabaseService = <T>(): jest.Mocked<DatabaseService<T>> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findBy: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('PaymentSimulationService', () => {
  let paymentService: PaymentSimulationService;
  let mockSubscriptionRepository: jest.Mocked<DatabaseService<UserSubscriptionData>>;
  let mockTransactionRepository: jest.Mocked<DatabaseService<TransactionData>>;
  let mockPlanRepository: jest.Mocked<DatabaseService<SubscriptionPlanData>>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscriptionRepository = createMockDatabaseService<UserSubscriptionData>();
    mockTransactionRepository = createMockDatabaseService<TransactionData>();
    mockPlanRepository = createMockDatabaseService<SubscriptionPlanData>();

    paymentService = new PaymentSimulationService(
      mockSubscriptionRepository,
      mockTransactionRepository,
      mockPlanRepository
    );
  });

  describe('simulatePayment', () => {
    it('повинен симулювати оплату місячної підписки', async () => {
      const mockPlanData: SubscriptionPlanData = {
        id: 'plan1',
        name: 'Basic Plan',
        price: 100,
        period: 'monthly',
      };

      mockPlanRepository.findById.mockResolvedValue(mockPlanData);
      mockSubscriptionRepository.create.mockResolvedValue({
        id: 'sub1',
        email: 'ivan@example.com',
        subscriptionPlanId: 'plan1',
        subscriptionEndDate: new Date().toISOString(),
      });
      mockTransactionRepository.create.mockResolvedValue({
        id: 'trans1',
        amount: 100,
        email: 'ivan@example.com',
        subscriptionPlanId: 'plan1',
        date: new Date().toISOString(),
      });

      const result = await paymentService.simulatePayment('ivan@example.com', 'plan1', 100);

      expect(mockPlanRepository.findById).toHaveBeenCalledWith('plan1');
      expect(mockSubscriptionRepository.create).toHaveBeenCalled();
      expect(mockTransactionRepository.create).toHaveBeenCalled();
      expect(result.userSubscription).toBeInstanceOf(UserSubscription);
      expect(result.transaction).toBeInstanceOf(Transaction);
      expect(result.userSubscription.email).toBe('ivan@example.com');
      expect(result.transaction.amount).toBe(100);
    });

    it('повинен симулювати оплату річної підписки', async () => {
      const mockPlanData: SubscriptionPlanData = {
        id: 'plan2',
        name: 'Premium Plan',
        price: 1200,
        period: 'yearly',
      };

      mockPlanRepository.findById.mockResolvedValue(mockPlanData);
      mockSubscriptionRepository.create.mockResolvedValue({
        id: 'sub2',
        email: 'maria@example.com',
        subscriptionPlanId: 'plan2',
        subscriptionEndDate: new Date().toISOString(),
      });
      mockTransactionRepository.create.mockResolvedValue({
        id: 'trans2',
        amount: 1200,
        email: 'maria@example.com',
        subscriptionPlanId: 'plan2',
        date: new Date().toISOString(),
      });

      const result = await paymentService.simulatePayment('maria@example.com', 'plan2', 1200);

      expect(result.userSubscription.subscriptionPlanId).toBe('plan2');
      expect(result.transaction.amount).toBe(1200);
    });

    it('повинен правильно розрахувати дату закінчення місячної підписки', async () => {
      const mockPlanData: SubscriptionPlanData = {
        id: 'plan1',
        name: 'Basic Plan',
        price: 100,
        period: 'monthly',
      };

      mockPlanRepository.findById.mockResolvedValue(mockPlanData);
      mockSubscriptionRepository.create.mockResolvedValue({
        id: 'sub1',
        email: 'ivan@example.com',
        subscriptionPlanId: 'plan1',
        subscriptionEndDate: new Date().toISOString(),
      });
      mockTransactionRepository.create.mockResolvedValue({
        id: 'trans1',
        amount: 100,
        email: 'ivan@example.com',
        subscriptionPlanId: 'plan1',
        date: new Date().toISOString(),
      });

      const result = await paymentService.simulatePayment('ivan@example.com', 'plan1', 100);

      const expectedDate = new Date();
      expectedDate.setMonth(expectedDate.getMonth() + 1);

      // Перевіряємо, що дата закінчення приблизно через місяць
      const endDate = result.userSubscription.subscriptionEndDate;
      const diff = Math.abs(endDate.getTime() - expectedDate.getTime());
      expect(diff).toBeLessThan(1000); // Різниця менше 1 секунди
    });

    it('повинен правильно розрахувати дату закінчення річної підписки', async () => {
      const mockPlanData: SubscriptionPlanData = {
        id: 'plan2',
        name: 'Premium Plan',
        price: 1200,
        period: 'yearly',
      };

      mockPlanRepository.findById.mockResolvedValue(mockPlanData);
      mockSubscriptionRepository.create.mockResolvedValue({
        id: 'sub2',
        email: 'maria@example.com',
        subscriptionPlanId: 'plan2',
        subscriptionEndDate: new Date().toISOString(),
      });
      mockTransactionRepository.create.mockResolvedValue({
        id: 'trans2',
        amount: 1200,
        email: 'maria@example.com',
        subscriptionPlanId: 'plan2',
        date: new Date().toISOString(),
      });

      const result = await paymentService.simulatePayment('maria@example.com', 'plan2', 1200);

      const expectedDate = new Date();
      expectedDate.setFullYear(expectedDate.getFullYear() + 1);

      // Перевіряємо, що дата закінчення приблизно через рік
      const endDate = result.userSubscription.subscriptionEndDate;
      const diff = Math.abs(endDate.getTime() - expectedDate.getTime());
      expect(diff).toBeLessThan(1000); // Різниця менше 1 секунди
    });

    it('повинен викинути помилку, якщо план підписки не знайдений', async () => {
      mockPlanRepository.findById.mockResolvedValue(null);

      await expect(
        paymentService.simulatePayment('ivan@example.com', 'nonexistent', 100)
      ).rejects.toThrow('План підписки не знайдений');
    });

    it('повинен створити транзакцію з правильними даними', async () => {
      const mockPlanData: SubscriptionPlanData = {
        id: 'plan1',
        name: 'Basic Plan',
        price: 100,
        period: 'monthly',
      };

      const mockTransactionData: TransactionData = {
        id: 'trans1',
        amount: 100,
        email: 'ivan@example.com',
        subscriptionPlanId: 'plan1',
        date: new Date().toISOString(),
      };

      mockPlanRepository.findById.mockResolvedValue(mockPlanData);
      mockSubscriptionRepository.create.mockResolvedValue({
        id: 'sub1',
        email: 'ivan@example.com',
        subscriptionPlanId: 'plan1',
        subscriptionEndDate: new Date().toISOString(),
      });
      mockTransactionRepository.create.mockResolvedValue(mockTransactionData);

      const result = await paymentService.simulatePayment('ivan@example.com', 'plan1', 100);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100,
          email: 'ivan@example.com',
          subscriptionPlanId: 'plan1',
        })
      );
      expect(result.transaction.email).toBe('ivan@example.com');
      expect(result.transaction.subscriptionPlanId).toBe('plan1');
    });
  });

  describe('getTransactions', () => {
    it('повинен отримати всі транзакції', async () => {
      const mockTransactionsData: TransactionData[] = [
        {
          id: '1',
          amount: 100,
          email: 'ivan@example.com',
          subscriptionPlanId: 'plan1',
          date: '2025-11-12',
        },
        {
          id: '2',
          amount: 1200,
          email: 'maria@example.com',
          subscriptionPlanId: 'plan2',
          date: '2025-11-13',
        },
      ];

      mockTransactionRepository.findAll.mockResolvedValue(mockTransactionsData);

      const transactions = await paymentService.getTransactions();

      expect(mockTransactionRepository.findAll).toHaveBeenCalled();
      expect(transactions).toHaveLength(2);
      expect(transactions[0]).toBeInstanceOf(Transaction);
      expect(transactions[0].amount).toBe(100);
      expect(transactions[1].amount).toBe(1200);
    });

    it('повинен повернути порожній масив, якщо транзакцій немає', async () => {
      mockTransactionRepository.findAll.mockResolvedValue([]);

      const transactions = await paymentService.getTransactions();

      expect(transactions).toEqual([]);
    });

    it('повинен правильно маппити дані транзакцій', async () => {
      const mockTransactionsData: TransactionData[] = [
        {
          id: '1',
          amount: 500,
          email: 'test@example.com',
          subscriptionPlanId: 'plan3',
          date: '2025-11-15',
        },
      ];

      mockTransactionRepository.findAll.mockResolvedValue(mockTransactionsData);

      const transactions = await paymentService.getTransactions();

      expect(transactions[0].id).toBe('1');
      expect(transactions[0].amount).toBe(500);
      expect(transactions[0].email).toBe('test@example.com');
      expect(transactions[0].subscriptionPlanId).toBe('plan3');
      expect(transactions[0].date).toBe('2025-11-15');
    });
  });
});
