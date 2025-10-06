/**
 * Типи транзакцій
 */
export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  CHARGEBACK = 'chargeback',
  ADJUSTMENT = 'adjustment'
}

/**
 * Статуси транзакцій
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Інтерфейс транзакції
 */
export interface Transaction {
  id: string;
  subscriptionId: string;
  userId: string;
  planId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  description: string;
  paymentMethod?: string;
  externalTransactionId?: string; // ID з зовнішньої платіжної системи
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  metadata?: Record<string, any>; // Додаткові дані для аналітики
}

/**
 * Дані для створення транзакції
 */
export interface CreateTransactionData {
  subscriptionId: string;
  userId: string;
  planId: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  description: string;
  paymentMethod?: string;
  externalTransactionId?: string;
  metadata?: Record<string, any>;
}

/**
 * Дані для оновлення транзакції
 */
export interface UpdateTransactionData {
  status?: TransactionStatus;
  description?: string;
  processedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Клас для роботи з транзакціями
 */
export class TransactionService {
  constructor(private transactionRepository: any) {}

  /**
   * Створити нову транзакцію
   */
  async createTransaction(transactionData: CreateTransactionData): Promise<Transaction> {
    const now = new Date();
    const transaction: Omit<Transaction, 'id'> = {
      subscriptionId: transactionData.subscriptionId,
      userId: transactionData.userId,
      planId: transactionData.planId,
      type: transactionData.type,
      status: TransactionStatus.PENDING,
      amount: transactionData.amount,
      currency: transactionData.currency || 'USD',
      description: transactionData.description,
      paymentMethod: transactionData.paymentMethod,
      externalTransactionId: transactionData.externalTransactionId,
      createdAt: now,
      updatedAt: now,
      metadata: transactionData.metadata
    };

    return await this.transactionRepository.create(transaction);
  }

  /**
   * Отримати транзакцію за ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    return await this.transactionRepository.findById(id);
  }

  /**
   * Отримати всі транзакції
   */
  async getAllTransactions(): Promise<Transaction[]> {
    return await this.transactionRepository.findAll();
  }

  /**
   * Отримати транзакції користувача
   */
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await this.transactionRepository.findBy({ userId });
  }

  /**
   * Отримати транзакції підписки
   */
  async getSubscriptionTransactions(subscriptionId: string): Promise<Transaction[]> {
    return await this.transactionRepository.findBy({ subscriptionId });
  }

  /**
   * Отримати транзакції за типом
   */
  async getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
    return await this.transactionRepository.findBy({ type });
  }

  /**
   * Отримати транзакції за статусом
   */
  async getTransactionsByStatus(status: TransactionStatus): Promise<Transaction[]> {
    return await this.transactionRepository.findBy({ status });
  }

  /**
   * Оновити транзакцію
   */
  async updateTransaction(id: string, updateData: UpdateTransactionData): Promise<Transaction | null> {
    const updateDataWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    };
    return await this.transactionRepository.update(id, updateDataWithTimestamp);
  }

  /**
   * Позначити транзакцію як завершену
   */
  async completeTransaction(id: string): Promise<Transaction | null> {
    return await this.updateTransaction(id, { 
      status: TransactionStatus.COMPLETED,
      processedAt: new Date()
    });
  }

  /**
   * Позначити транзакцію як невдалу
   */
  async failTransaction(id: string): Promise<Transaction | null> {
    return await this.updateTransaction(id, { 
      status: TransactionStatus.FAILED,
      processedAt: new Date()
    });
  }

  /**
   * Отримати статистику транзакцій
   */
  async getTransactionStats(userId?: string, planId?: string): Promise<{
    totalTransactions: number;
    totalAmount: number;
    successfulTransactions: number;
    failedTransactions: number;
    averageAmount: number;
  }> {
    let transactions = await this.transactionRepository.findAll();
    
    if (userId) {
      transactions = transactions.filter(t => t.userId === userId);
    }
    
    if (planId) {
      transactions = transactions.filter(t => t.planId === planId);
    }

    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const successfulTransactions = transactions.filter(t => t.status === TransactionStatus.COMPLETED).length;
    const failedTransactions = transactions.filter(t => t.status === TransactionStatus.FAILED).length;
    const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

    return {
      totalTransactions,
      totalAmount,
      successfulTransactions,
      failedTransactions,
      averageAmount
    };
  }

  /**
   * Отримати транзакції за період
   */
  async getTransactionsByPeriod(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const allTransactions = await this.transactionRepository.findAll();
    return allTransactions.filter(transaction => 
      transaction.createdAt >= startDate && transaction.createdAt <= endDate
    );
  }

  /**
   * Видалити транзакцію
   */
  async deleteTransaction(id: string): Promise<boolean> {
    return await this.transactionRepository.delete(id);
  }
}


