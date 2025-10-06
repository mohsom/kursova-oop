import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { JsonDatabase } from './database/JsonDatabase';
import { UserService } from './models/User';
import { SubscriptionService } from './models/Subscription';
import { SubscriptionPlanService } from './models/SubscriptionPlan';
import { TransactionService } from './models/Transaction';
import { WebhookHandler } from './webhooks/WebhookHandler';
import { createRoutes } from './api/routes';

// Завантажуємо environment змінні
dotenv.config();

/**
 * Головний файл сервера
 */
class Server {
  private app: express.Application;
  private port: number;

  constructor(port?: number) {
    this.app = express();
    this.port = port || parseInt(process.env.PORT || '3001', 10);
    this.initializeDatabase();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  /**
   * Ініціалізація бази даних
   */
  private initializeDatabase(): void {
    console.log('Ініціалізація бази даних...');

    // Створення репозиторіїв
    const userRepository = new JsonDatabase('users');
    const subscriptionRepository = new JsonDatabase('subscriptions');
    const planRepository = new JsonDatabase('subscription_plans');
    const transactionRepository = new JsonDatabase('transactions');

    // Створення сервісів
    const userService = new UserService(userRepository);
    const planService = new SubscriptionPlanService(planRepository);
    const subscriptionService = new SubscriptionService(subscriptionRepository, planRepository);
    const transactionService = new TransactionService(transactionRepository);
    const webhookHandler = new WebhookHandler(subscriptionService, transactionService);

    // Збереження сервісів в app locals для використання в роутах
    this.app.locals.userService = userService;
    this.app.locals.planService = planService;
    this.app.locals.subscriptionService = subscriptionService;
    this.app.locals.transactionService = transactionService;
    this.app.locals.webhookHandler = webhookHandler;

    console.log('База даних ініціалізована');
  }

  /**
   * Ініціалізація middleware
   */
  private initializeMiddleware(): void {
    // CORS
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    };
    this.app.use(cors(corsOptions));

    // Body parser
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Логування запитів
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Ініціалізація роутів
   */
  private initializeRoutes(): void {
    const { userService, planService, subscriptionService, transactionService, webhookHandler } = this.app.locals;

    // API роути
    this.app.use('/api', createRoutes(userService, subscriptionService, planService, transactionService, webhookHandler));

    // Головна сторінка
    this.app.get('/', (req, res) => {
      res.json({
        message: 'SaaS Subscription Management System',
        version: '1.0.0',
        endpoints: {
          users: '/api/users',
          subscriptions: '/api/subscriptions',
          webhooks: '/api/webhooks'
        }
      });
    });

    // Обробка неіснуючих роутів
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint не знайдений'
      });
    });
  }

  /**
   * Запуск сервера
   */
  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Сервер запущено на порту ${this.port}`);
      console.log(`📱 API доступне за адресою: http://localhost:${this.port}/api`);
      console.log(`🌐 Головна сторінка: http://localhost:${this.port}`);
      console.log('\n📋 Доступні endpoints:');
      console.log('  GET    /api/users                    - Отримати всіх користувачів');
      console.log('  GET    /api/users/:id                 - Отримати користувача за ID');
      console.log('  POST   /api/users                     - Створити користувача');
      console.log('  PUT    /api/users/:id                 - Оновити користувача');
      console.log('  DELETE /api/users/:id                 - Видалити користувача');
      console.log('  GET    /api/plans                     - Отримати всі плани підписок');
      console.log('  GET    /api/plans/:id                 - Отримати план за ID');
      console.log('  POST   /api/plans                     - Створити план підписки');
      console.log('  PUT    /api/plans/:id                 - Оновити план підписки');
      console.log('  DELETE /api/plans/:id                 - Видалити план');
      console.log('  GET    /api/subscriptions             - Отримати всі підписки');
      console.log('  GET    /api/subscriptions/:id         - Отримати підписку за ID');
      console.log('  POST   /api/subscriptions             - Створити підписку');
      console.log('  PUT    /api/subscriptions/:id         - Оновити підписку');
      console.log('  POST   /api/subscriptions/:id/cancel  - Скасувати підписку');
      console.log('  GET    /api/users/:userId/subscriptions - Підписки користувача');
      console.log('  GET    /api/transactions             - Отримати всі транзакції');
      console.log('  GET    /api/transactions/:id         - Отримати транзакцію за ID');
      console.log('  POST   /api/transactions             - Створити транзакцію');
      console.log('  PUT    /api/transactions/:id         - Оновити транзакцію');
      console.log('  POST   /api/transactions/:id/complete - Завершити транзакцію');
      console.log('  POST   /api/transactions/:id/fail    - Позначити як невдалу');
      console.log('  GET    /api/transactions/stats       - Статистика транзакцій');
      console.log('  GET    /api/users/:userId/transactions - Транзакції користувача');
      console.log('  GET    /api/subscriptions/:id/transactions - Транзакції підписки');
      console.log('  POST   /api/webhooks                  - Webhook обробка');
      console.log('  POST   /api/webhooks/test             - Тестовий webhook');
    });
  }
}

// Запуск сервера
const server = new Server();
server.start();
