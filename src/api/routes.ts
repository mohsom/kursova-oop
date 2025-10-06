import { Router, Request, Response } from 'express';
import { UserService, CreateUserData, UpdateUserData } from '../models/User';
import { SubscriptionService, CreateSubscriptionData, UpdateSubscriptionData } from '../models/Subscription';
import { SubscriptionPlanService, CreateSubscriptionPlanData, UpdateSubscriptionPlanData } from '../models/SubscriptionPlan';
import { TransactionService, CreateTransactionData, UpdateTransactionData, TransactionType, TransactionStatus } from '../models/Transaction';
import { WebhookHandler, WebhookEventType } from '../webhooks/WebhookHandler';

/**
 * Створення роутерів для API
 */
export function createRoutes(
  userService: UserService,
  subscriptionService: SubscriptionService,
  planService: SubscriptionPlanService,
  transactionService: TransactionService,
  webhookHandler: WebhookHandler
): Router {
  const router = Router();

  // ========== USER ROUTES ==========

  /**
   * GET /api/users - Отримати всіх користувачів
   */
  router.get('/users', async (req: Request, res: Response) => {
    try {
      const users = await userService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання користувачів',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * GET /api/users/:id - Отримати користувача за ID
   */
  router.get('/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Користувач не знайдений'
        });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання користувача',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * POST /api/users - Створити нового користувача
   */
  router.post('/users', async (req: Request, res: Response) => {
    try {
      const userData: CreateUserData = req.body;

      // Валідація обов'язкових полів
      if (!userData.email || !userData.name) {
        return res.status(400).json({
          success: false,
          message: 'Email та ім\'я є обов\'язковими полями'
        });
      }

      // Перевірка чи користувач з таким email вже існує
      const existingUser = await userService.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Користувач з таким email вже існує'
        });
      }

      const user = await userService.createUser(userData);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка створення користувача',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * PUT /api/users/:id - Оновити користувача
   */
  router.put('/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: UpdateUserData = req.body;

      const user = await userService.updateUser(id, updateData);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Користувач не знайдений'
        });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка оновлення користувача',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * DELETE /api/users/:id - Видалити користувача
   */
  router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await userService.deleteUser(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Користувач не знайдений'
        });
      }

      res.json({ success: true, message: 'Користувач успішно видалений' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка видалення користувача',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  // ========== SUBSCRIPTION PLAN ROUTES ==========

  /**
   * GET /api/plans - Отримати всі плани підписок
   */
  router.get('/plans', async (req: Request, res: Response) => {
    try {
      const plans = await planService.getAllPlans();
      res.json({ success: true, data: plans });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання планів',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });


  /**
   * GET /api/plans/:id - Отримати план за ID
   */
  router.get('/plans/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const plan = await planService.getPlanById(id);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'План не знайдений'
        });
      }

      res.json({ success: true, data: plan });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання плану',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * POST /api/plans - Створити новий план
   */
  router.post('/plans', async (req: Request, res: Response) => {
    try {
      const planData: CreateSubscriptionPlanData = req.body;

      // Валідація обов'язкових полів
      if (!planData.name || !planData.price || !planData.billingInterval) {
        return res.status(400).json({
          success: false,
          message: 'name, price та billingInterval є обов\'язковими полями'
        });
      }

      const plan = await planService.createPlan(planData);
      res.status(201).json({ success: true, data: plan });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка створення плану',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * PUT /api/plans/:id - Оновити план
   */
  router.put('/plans/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: UpdateSubscriptionPlanData = req.body;

      const plan = await planService.updatePlan(id, updateData);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'План не знайдений'
        });
      }

      res.json({ success: true, data: plan });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка оновлення плану',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });


  /**
   * DELETE /api/plans/:id - Видалити план
   */
  router.delete('/plans/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await planService.deletePlan(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'План не знайдений'
        });
      }

      res.json({ success: true, message: 'План успішно видалений' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка видалення плану',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  // ========== SUBSCRIPTION ROUTES ==========

  /**
   * GET /api/subscriptions - Отримати всі підписки
   */
  router.get('/subscriptions', async (req: Request, res: Response) => {
    try {
      const subscriptions = await subscriptionService.getAllSubscriptions();
      res.json({ success: true, data: subscriptions });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання підписок',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * GET /api/subscriptions/:id - Отримати підписку за ID
   */
  router.get('/subscriptions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const subscription = await subscriptionService.getSubscriptionById(id);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Підписка не знайдена'
        });
      }

      res.json({ success: true, data: subscription });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання підписки',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * GET /api/users/:userId/subscriptions - Отримати підписки користувача
   */
  router.get('/users/:userId/subscriptions', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const subscriptions = await subscriptionService.getUserSubscriptions(userId);
      res.json({ success: true, data: subscriptions });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання підписок користувача',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * POST /api/subscriptions - Створити нову підписку
   */
  router.post('/subscriptions', async (req: Request, res: Response) => {
    try {
      const subscriptionData: CreateSubscriptionData = req.body;

      // Валідація обов'язкових полів
      if (!subscriptionData.userId || !subscriptionData.planId) {
        return res.status(400).json({
          success: false,
          message: 'userId та planId є обов\'язковими полями'
        });
      }

      // Перевірка чи користувач існує
      const user = await userService.getUserById(subscriptionData.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Користувач не знайдений'
        });
      }

      // Перевірка чи план існує
      const plan = await planService.getPlanById(subscriptionData.planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'План підписки не знайдений'
        });
      }

      const subscription = await subscriptionService.createSubscription(subscriptionData);
      res.status(201).json({ success: true, data: subscription });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка створення підписки',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * PUT /api/subscriptions/:id - Оновити підписку
   */
  router.put('/subscriptions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: UpdateSubscriptionData = req.body;

      const subscription = await subscriptionService.updateSubscription(id, updateData);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Підписка не знайдена'
        });
      }

      res.json({ success: true, data: subscription });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка оновлення підписки',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * POST /api/subscriptions/:id/cancel - Скасувати підписку
   */
  router.post('/subscriptions/:id/cancel', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const subscription = await subscriptionService.cancelSubscription(id);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Підписка не знайдена'
        });
      }

      res.json({ success: true, data: subscription, message: 'Підписка успішно скасована' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка скасування підписки',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });


  // ========== TRANSACTION ROUTES ==========

  /**
   * GET /api/transactions - Отримати всі транзакції
   */
  router.get('/transactions', async (req: Request, res: Response) => {
    try {
      const transactions = await transactionService.getAllTransactions();
      res.json({ success: true, data: transactions });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання транзакцій',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * GET /api/transactions/:id - Отримати транзакцію за ID
   */
  router.get('/transactions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const transaction = await transactionService.getTransactionById(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Транзакція не знайдена'
        });
      }

      res.json({ success: true, data: transaction });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання транзакції',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * GET /api/users/:userId/transactions - Отримати транзакції користувача
   */
  router.get('/users/:userId/transactions', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const transactions = await transactionService.getUserTransactions(userId);
      res.json({ success: true, data: transactions });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання транзакцій користувача',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * GET /api/subscriptions/:subscriptionId/transactions - Отримати транзакції підписки
   */
  router.get('/subscriptions/:subscriptionId/transactions', async (req: Request, res: Response) => {
    try {
      const { subscriptionId } = req.params;
      const transactions = await transactionService.getSubscriptionTransactions(subscriptionId);
      res.json({ success: true, data: transactions });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання транзакцій підписки',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * POST /api/transactions - Створити нову транзакцію
   */
  router.post('/transactions', async (req: Request, res: Response) => {
    try {
      const transactionData: CreateTransactionData = req.body;

      // Валідація обов'язкових полів
      if (!transactionData.subscriptionId || !transactionData.userId || !transactionData.planId || !transactionData.amount) {
        return res.status(400).json({
          success: false,
          message: 'subscriptionId, userId, planId та amount є обов\'язковими полями'
        });
      }

      const transaction = await transactionService.createTransaction(transactionData);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка створення транзакції',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * PUT /api/transactions/:id - Оновити транзакцію
   */
  router.put('/transactions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData: UpdateTransactionData = req.body;

      const transaction = await transactionService.updateTransaction(id, updateData);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Транзакція не знайдена'
        });
      }

      res.json({ success: true, data: transaction });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка оновлення транзакції',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * POST /api/transactions/:id/complete - Позначити транзакцію як завершену
   */
  router.post('/transactions/:id/complete', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const transaction = await transactionService.completeTransaction(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Транзакція не знайдена'
        });
      }

      res.json({ success: true, data: transaction, message: 'Транзакція успішно завершена' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка завершення транзакції',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * POST /api/transactions/:id/fail - Позначити транзакцію як невдалу
   */
  router.post('/transactions/:id/fail', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const transaction = await transactionService.failTransaction(id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Транзакція не знайдена'
        });
      }

      res.json({ success: true, data: transaction, message: 'Транзакція позначена як невдала' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка оновлення статусу транзакції',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * GET /api/transactions/stats - Отримати статистику транзакцій
   */
  router.get('/transactions/stats', async (req: Request, res: Response) => {
    try {
      const { userId, planId } = req.query;
      const stats = await transactionService.getTransactionStats(
        userId as string,
        planId as string
      );
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання статистики',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  // ========== WEBHOOK ROUTES ==========

  /**
   * POST /api/webhooks - Обробити webhook
   */
  router.post('/webhooks', async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      // Валідація payload
      if (!webhookHandler.validateWebhookPayload(payload)) {
        return res.status(400).json({
          success: false,
          message: 'Невірний формат webhook payload'
        });
      }

      const result = await webhookHandler.handleWebhook(payload);

      if (result.success) {
        res.json({ success: true, message: result.message });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка обробки webhook',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  /**
   * POST /api/webhooks/test - Тестовий webhook для демонстрації
   */
  router.post('/webhooks/test', async (req: Request, res: Response) => {
    try {
      const { event, subscriptionId, userId } = req.body;

      if (!event || !subscriptionId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'event, subscriptionId та userId є обов\'язковими полями'
        });
      }

      const payload = webhookHandler.createTestWebhookPayload(
        event as WebhookEventType,
        subscriptionId,
        userId
      );

      const result = await webhookHandler.handleWebhook(payload);

      if (result.success) {
        res.json({ success: true, message: result.message, payload });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка обробки тестового webhook',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });

  return router;
}
