import { UserService } from './UserService';
import { UserSubscriptionService } from './UserSubscriptionService';
import { SubscriptionPlanService } from './SubscriptionPlanService';
import { DatabaseService } from '../database/DatabaseInterface';
import { UserData, UserSubscriptionData, SubscriptionPlanData } from '../types/DatabaseTypes';
import { User } from '../models/User';

// Mock DatabaseService
const createMockDatabaseService = <T>(): jest.Mocked<DatabaseService<T>> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findBy: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<DatabaseService<UserData>>;
  let mockSubscriptionRepository: jest.Mocked<DatabaseService<UserSubscriptionData>>;
  let mockPlanRepository: jest.Mocked<DatabaseService<SubscriptionPlanData>>;
  let userSubscriptionService: UserSubscriptionService;
  let planService: SubscriptionPlanService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = createMockDatabaseService<UserData>();
    mockSubscriptionRepository = createMockDatabaseService<UserSubscriptionData>();
    mockPlanRepository = createMockDatabaseService<SubscriptionPlanData>();

    userSubscriptionService = new UserSubscriptionService(mockSubscriptionRepository);
    planService = new SubscriptionPlanService(mockPlanRepository);
    userService = new UserService(mockUserRepository, userSubscriptionService, planService);
  });

  describe('createUser', () => {
    it('повинен створити нового користувача', async () => {
      const name = 'Іван Петренко';
      const email = 'ivan@example.com';

      mockUserRepository.create.mockResolvedValue({
        id: '1',
        name,
        email,
      });

      const user = await userService.createUser(name, email);

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name,
        email,
      });
      expect(user).toBeInstanceOf(User);
      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
    });

    it('повинен генерувати унікальний ID для користувача', async () => {
      const name = 'Марія Коваль';
      const email = 'maria@example.com';

      mockUserRepository.create.mockResolvedValue({
        id: '2',
        name,
        email,
      });

      const user = await userService.createUser(name, email);

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
    });
  });

  describe('getUserById', () => {
    it('повинен отримати користувача за ID', async () => {
      const mockUserData: UserData = {
        id: '1',
        name: 'Іван Петренко',
        email: 'ivan@example.com',
      };

      mockUserRepository.findById.mockResolvedValue(mockUserData);

      const user = await userService.getUserById('1');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(user).toBeInstanceOf(User);
      expect(user?.id).toBe('1');
      expect(user?.name).toBe('Іван Петренко');
      expect(user?.email).toBe('ivan@example.com');
    });

    it('повинен повернути null, якщо користувач не знайдений', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const user = await userService.getUserById('nonexistent');

      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('повинен отримати користувача за email', async () => {
      const mockUserData: UserData = {
        id: '1',
        name: 'Іван Петренко',
        email: 'ivan@example.com',
      };

      mockUserRepository.findBy.mockResolvedValue([mockUserData]);

      const user = await userService.getUserByEmail('ivan@example.com');

      expect(mockUserRepository.findBy).toHaveBeenCalledWith({ email: 'ivan@example.com' });
      expect(user).toBeInstanceOf(User);
      expect(user?.email).toBe('ivan@example.com');
    });

    it('повинен повернути null, якщо користувач з таким email не знайдений', async () => {
      mockUserRepository.findBy.mockResolvedValue([]);

      const user = await userService.getUserByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('повинен отримати всіх користувачів', async () => {
      const mockUsersData: UserData[] = [
        { id: '1', name: 'Іван Петренко', email: 'ivan@example.com' },
        { id: '2', name: 'Марія Коваль', email: 'maria@example.com' },
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsersData);

      const users = await userService.getAllUsers();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[0].name).toBe('Іван Петренко');
      expect(users[1].name).toBe('Марія Коваль');
    });

    it('повинен повернути порожній масив, якщо користувачів немає', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const users = await userService.getAllUsers();

      expect(users).toEqual([]);
    });
  });

  describe('getAllUsersWithSubscriptions', () => {
    it('повинен отримати користувачів з інформацією про підписки', async () => {
      const mockUsersData: UserData[] = [
        { id: '1', name: 'Іван Петренко', email: 'ivan@example.com' },
      ];

      const mockSubscriptionData: UserSubscriptionData = {
        id: 'sub1',
        email: 'ivan@example.com',
        subscriptionPlanId: 'plan1',
        subscriptionEndDate: '2025-12-31',
      };

      const mockPlanData: SubscriptionPlanData = {
        id: 'plan1',
        name: 'Basic Plan',
        price: 100,
        period: 'monthly',
      };

      mockUserRepository.findAll.mockResolvedValue(mockUsersData);
      mockSubscriptionRepository.findBy.mockResolvedValue([mockSubscriptionData]);
      mockPlanRepository.findById.mockResolvedValue(mockPlanData);

      const usersWithSubs = await userService.getAllUsersWithSubscriptions();

      expect(usersWithSubs).toHaveLength(1);
      expect(usersWithSubs[0].id).toBe('1');
      expect(usersWithSubs[0].subscription).toBeDefined();
      expect(usersWithSubs[0].plan).toBeDefined();
    });

    it('повинен повернути користувачів без підписок, якщо їх немає', async () => {
      const mockUsersData: UserData[] = [
        { id: '2', name: 'Марія Коваль', email: 'maria@example.com' },
      ];

      mockUserRepository.findAll.mockResolvedValue(mockUsersData);
      mockSubscriptionRepository.findBy.mockResolvedValue([]);

      const usersWithSubs = await userService.getAllUsersWithSubscriptions();

      expect(usersWithSubs).toHaveLength(1);
      expect(usersWithSubs[0].subscription).toBeNull();
      expect(usersWithSubs[0].plan).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('повинен оновити ім\'я користувача', async () => {
      const mockUpdatedUser: UserData = {
        id: '1',
        name: 'Іван Оновлений',
        email: 'ivan@example.com',
      };

      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      const user = await userService.updateUser('1', 'Іван Оновлений', undefined);

      expect(mockUserRepository.update).toHaveBeenCalledWith('1', { name: 'Іван Оновлений' });
      expect(user?.name).toBe('Іван Оновлений');
    });

    it('повинен оновити email користувача', async () => {
      const mockUpdatedUser: UserData = {
        id: '1',
        name: 'Іван Петренко',
        email: 'ivan_new@example.com',
      };

      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      const user = await userService.updateUser('1', undefined, 'ivan_new@example.com');

      expect(mockUserRepository.update).toHaveBeenCalledWith('1', { email: 'ivan_new@example.com' });
      expect(user?.email).toBe('ivan_new@example.com');
    });

    it('повинен оновити і ім\'я, і email одночасно', async () => {
      const mockUpdatedUser: UserData = {
        id: '1',
        name: 'Іван Оновлений',
        email: 'ivan_new@example.com',
      };

      mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

      const user = await userService.updateUser('1', 'Іван Оновлений', 'ivan_new@example.com');

      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        name: 'Іван Оновлений',
        email: 'ivan_new@example.com',
      });
      expect(user?.name).toBe('Іван Оновлений');
      expect(user?.email).toBe('ivan_new@example.com');
    });

    it('повинен повернути null, якщо користувач не знайдений', async () => {
      mockUserRepository.update.mockResolvedValue(null);

      const user = await userService.updateUser('nonexistent', 'Test', 'test@example.com');

      expect(user).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('повинен видалити користувача', async () => {
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser('1');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('повинен повернути false, якщо користувач не знайдений', async () => {
      mockUserRepository.delete.mockResolvedValue(false);

      const result = await userService.deleteUser('nonexistent');

      expect(result).toBe(false);
    });
  });
});
