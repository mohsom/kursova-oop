/**
 * Клас користувача
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Дані для створення користувача
 */
export interface CreateUserData {
  email: string;
  name: string;
}

/**
 * Дані для оновлення користувача
 */
export interface UpdateUserData {
  email?: string;
  name?: string;
  isActive?: boolean;
}

/**
 * Клас для роботи з користувачами
 */
export class UserService {
  constructor(private userRepository: any) {}

  /**
   * Створити нового користувача
   */
  async createUser(userData: CreateUserData): Promise<User> {
    const now = new Date();
    const user: Omit<User, 'id'> = {
      ...userData,
      createdAt: now,
      updatedAt: now,
      isActive: true
    };

    return await this.userRepository.create(user);
  }

  /**
   * Отримати користувача за ID
   */
  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  /**
   * Отримати користувача за email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.userRepository.findBy({ email });
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Отримати всіх користувачів
   */
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  /**
   * Оновити користувача
   */
  async updateUser(id: string, updateData: UpdateUserData): Promise<User | null> {
    const updateDataWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    };
    return await this.userRepository.update(id, updateDataWithTimestamp);
  }

  /**
   * Видалити користувача
   */
  async deleteUser(id: string): Promise<boolean> {
    return await this.userRepository.delete(id);
  }

  /**
   * Деактивувати користувача
   */
  async deactivateUser(id: string): Promise<User | null> {
    return await this.updateUser(id, { isActive: false });
  }

  /**
   * Активувати користувача
   */
  async activateUser(id: string): Promise<User | null> {
    return await this.updateUser(id, { isActive: true });
  }
}
