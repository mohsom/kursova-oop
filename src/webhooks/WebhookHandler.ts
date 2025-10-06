import { SubscriptionService, SubscriptionStatus } from '../models/Subscription';
import { TransactionService, TransactionType, TransactionStatus } from '../models/Transaction';

/**
 * Типи webhook подій
 */
export enum WebhookEventType {
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled'
}

/**
 * Інтерфейс webhook payload
 */
export interface WebhookPayload {
  event: WebhookEventType;
  subscriptionId: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Клас для обробки webhook подій
 */
export class WebhookHandler {
  constructor(
    private subscriptionService: SubscriptionService,
    private transactionService: TransactionService
  ) { }

  /**
   * Обробити webhook подію
   */
  async handleWebhook(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Обробка webhook події: ${payload.event} для підписки ${payload.subscriptionId}`);

      switch (payload.event) {
        case WebhookEventType.PAYMENT_PROCESSED:
          return await this.handlePaymentProcessed(payload);

        case WebhookEventType.PAYMENT_FAILED:
          return await this.handlePaymentFailed(payload);

        case WebhookEventType.SUBSCRIPTION_CANCELLED:
          return await this.handleSubscriptionCancelled(payload);

        default:
          return {
            success: false,
            message: `Невідомий тип події: ${payload.event}`
          };
      }
    } catch (error) {
      console.error('Помилка обробки webhook:', error);
      return {
        success: false,
        message: `Помилка обробки webhook: ${error instanceof Error ? error.message : 'Невідома помилка'}`
      };
    }
  }

  /**
   * Обробити успішну оплату
   */
  private async handlePaymentProcessed(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    const subscription = await this.subscriptionService.getSubscriptionById(payload.subscriptionId);

    if (!subscription) {
      return {
        success: false,
        message: `Підписка з ID ${payload.subscriptionId} не знайдена`
      };
    }

    if (subscription.userId !== payload.userId) {
      return {
        success: false,
        message: 'Користувач не має доступу до цієї підписки'
      };
    }

    // Створюємо транзакцію для успішної оплати
    try {
      await this.transactionService.createTransaction({
        subscriptionId: payload.subscriptionId,
        userId: payload.userId,
        planId: subscription.planId,
        type: TransactionType.PAYMENT,
        amount: subscription.price,
        currency: 'USD', // Можна зробити динамічним
        description: `Оплата підписки ${payload.subscriptionId}`,
        paymentMethod: subscription.paymentMethod,
        externalTransactionId: payload.metadata?.paymentId,
        metadata: {
          webhookEvent: payload.event,
          webhookTimestamp: payload.timestamp,
          ...payload.metadata
        }
      });

      // Позначаємо транзакцію як завершену
      const transactions = await this.transactionService.getSubscriptionTransactions(payload.subscriptionId);
      const latestTransaction = transactions[transactions.length - 1];
      if (latestTransaction) {
        await this.transactionService.completeTransaction(latestTransaction.id);
      }
    } catch (error) {
      console.error('Помилка створення транзакції:', error);
      // Продовжуємо виконання, навіть якщо транзакція не створилася
    }

    const updatedSubscription = await this.subscriptionService.activateSubscription(payload.subscriptionId);

    if (!updatedSubscription) {
      return {
        success: false,
        message: 'Не вдалося активувати підписку'
      };
    }

    console.log(`Підписка ${payload.subscriptionId} успішно активована після оплати`);

    return {
      success: true,
      message: 'Підписка успішно активована'
    };
  }

  /**
   * Обробити невдалу оплату
   */
  private async handlePaymentFailed(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    const subscription = await this.subscriptionService.getSubscriptionById(payload.subscriptionId);

    if (!subscription) {
      return {
        success: false,
        message: `Підписка з ID ${payload.subscriptionId} не знайдена`
      };
    }

    if (subscription.userId !== payload.userId) {
      return {
        success: false,
        message: 'Користувач не має доступу до цієї підписки'
      };
    }

    // Створюємо транзакцію для невдалої оплати
    try {
      await this.transactionService.createTransaction({
        subscriptionId: payload.subscriptionId,
        userId: payload.userId,
        planId: subscription.planId,
        type: TransactionType.PAYMENT,
        amount: subscription.price,
        currency: 'USD',
        description: `Невдала оплата підписки ${payload.subscriptionId}`,
        paymentMethod: subscription.paymentMethod,
        externalTransactionId: payload.metadata?.paymentId,
        metadata: {
          webhookEvent: payload.event,
          webhookTimestamp: payload.timestamp,
          failureReason: payload.metadata?.reason,
          ...payload.metadata
        }
      });

      // Позначаємо транзакцію як невдалу
      const transactions = await this.transactionService.getSubscriptionTransactions(payload.subscriptionId);
      const latestTransaction = transactions[transactions.length - 1];
      if (latestTransaction) {
        await this.transactionService.failTransaction(latestTransaction.id);
      }
    } catch (error) {
      console.error('Помилка створення транзакції:', error);
      // Продовжуємо виконання, навіть якщо транзакція не створилася
    }

    const updatedSubscription = await this.subscriptionService.markPaymentFailed(payload.subscriptionId);

    if (!updatedSubscription) {
      return {
        success: false,
        message: 'Не вдалося оновити статус підписки'
      };
    }

    console.log(`Підписка ${payload.subscriptionId} позначена як невдала оплата`);

    return {
      success: true,
      message: 'Статус підписки оновлено на невдала оплата'
    };
  }

  /**
   * Обробити скасування підписки
   */
  private async handleSubscriptionCancelled(payload: WebhookPayload): Promise<{ success: boolean; message: string }> {
    const subscription = await this.subscriptionService.getSubscriptionById(payload.subscriptionId);

    if (!subscription) {
      return {
        success: false,
        message: `Підписка з ID ${payload.subscriptionId} не знайдена`
      };
    }

    if (subscription.userId !== payload.userId) {
      return {
        success: false,
        message: 'Користувач не має доступу до цієї підписки'
      };
    }

    const updatedSubscription = await this.subscriptionService.cancelSubscription(payload.subscriptionId);

    if (!updatedSubscription) {
      return {
        success: false,
        message: 'Не вдалося скасувати підписку'
      };
    }

    console.log(`Підписка ${payload.subscriptionId} успішно скасована`);

    return {
      success: true,
      message: 'Підписка успішно скасована'
    };
  }

  /**
   * Валідація webhook payload
   */
  validateWebhookPayload(payload: any): payload is WebhookPayload {
    return (
      payload &&
      typeof payload.event === 'string' &&
      Object.values(WebhookEventType).includes(payload.event) &&
      typeof payload.subscriptionId === 'string' &&
      typeof payload.userId === 'string' &&
      payload.timestamp instanceof Date
    );
  }

  /**
   * Створити webhook payload для тестування
   */
  createTestWebhookPayload(
    event: WebhookEventType,
    subscriptionId: string,
    userId: string,
    metadata?: Record<string, any>
  ): WebhookPayload {
    return {
      event,
      subscriptionId,
      userId,
      timestamp: new Date(),
      metadata
    };
  }
}
