import { Router, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { SubscriptionPlanService } from '../services/SubscriptionPlanService';
import { PaymentSimulationService } from '../services/PaymentSimulationService';
import { UserSubscriptionService } from '../services/UserSubscriptionService';

/**
 * Створення роутерів для API
 */
export function createRoutes(
  userService: UserService,
  planService: SubscriptionPlanService,
  paymentSimulationService: PaymentSimulationService,
  userSubscriptionService: UserSubscriptionService
): Router {
  const router = Router();

  // ========== USER ROUTES ==========

  /**
   * GET /api/users - Отримати всіх користувачів
   */
  router.get('/users', async (_req: Request, res: Response) => {
    try {
      const users = await userService.getAllUsersWithSubscriptions();
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
   * POST /api/users - Створити нового користувача
   */
  router.post('/users', async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;

      // Валідація обов'язкових полів
      if (!email || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email та ім\'я є обов\'язковими полями'
        });
      }

      // Перевірка чи користувач з таким email вже існує
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Користувач з таким email вже існує'
        });
      }

      const user = await userService.createUser(name, email);
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
      const { name, email } = req.body;

      const user = await userService.updateUser(id, name, email);

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
  router.get('/plans', async (_req: Request, res: Response) => {
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
      const { name, price, period } = req.body;

      // Валідація обов'язкових полів
      if (!name || !price || !period) {
        return res.status(400).json({
          success: false,
          message: 'name, price та period є обов\'язковими полями'
        });
      }

      if (period !== 'monthly' && period !== 'yearly') {
        return res.status(400).json({
          success: false,
          message: 'period має бути "monthly" або "yearly"'
        });
      }

      const plan = await planService.createPlan(name, price, period);
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
      const { name, price, period } = req.body;

      const plan = await planService.updatePlan(id, name, price, period);

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

  // ========== PAYMENT SIMULATION ROUTES ==========

  /**
   * POST /api/payment/simulate - Симуляція оплати
   */
  router.post('/payment/simulate', async (req: Request, res: Response) => {
    try {
      const { userEmail, subscriptionPlanId, amount } = req.body;

      // Валідація обов'язкових полів
      if (!userEmail || !subscriptionPlanId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'userEmail, subscriptionPlanId та amount є обов\'язковими полями'
        });
      }

      const result = await paymentSimulationService.simulatePayment(userEmail, subscriptionPlanId, amount);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка симуляції оплати',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });


  /**
   * GET /api/payment/user/:email/transactions - Отримати транзакції користувача
   */
  router.get('/payment/transactions', async (req: Request, res: Response) => {
    try {
      const transactions = await paymentSimulationService.getTransactions();
      res.json({ success: true, data: transactions });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Помилка отримання транзакцій користувача',
        error: error instanceof Error ? error.message : 'Невідома помилка'
      });
    }
  });


  return router;
}
