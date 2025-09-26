import { Router, Request, Response } from 'express';
import { UserService, CreateUserData, UpdateUserData } from '../models/User';
import { SubscriptionService, CreateSubscriptionData, UpdateSubscriptionData, SubscriptionType } from '../models/Subscription';
import { WebhookHandler, WebhookEventType } from '../webhooks/WebhookHandler';

/**
 * Створення роутерів для API
 */
export function createRoutes(
  userService: UserService,
  subscriptionService: SubscriptionService,
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
      if (!subscriptionData.userId || !subscriptionData.type || !subscriptionData.price) {
        return res.status(400).json({ 
          success: false, 
          message: 'userId, type та price є обов\'язковими полями' 
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
