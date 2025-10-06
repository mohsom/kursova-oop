import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { databaseFactory } from './database/DatabaseFactory';
import { UserService } from './services/UserService';
import { SubscriptionPlanService } from './services/SubscriptionPlanService';
import { PaymentSimulationService } from './services/PaymentSimulationService';
import { createRoutes } from './api/routes';
import { UserData, SubscriptionPlanData, UserSubscriptionData, TransactionData } from './types/DatabaseTypes';


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

    // Створення репозиторіїв через фабрику
    const userRepository = databaseFactory.createService<UserData>('users');
    const subscriptionRepository = databaseFactory.createService<UserSubscriptionData>('user_subscriptions');
    const planRepository = databaseFactory.createService<SubscriptionPlanData>('subscription_plans');
    const transactionRepository = databaseFactory.createService<TransactionData>('transactions');

    // Створення сервісів
    const paymentSimulationService = new PaymentSimulationService(
      userRepository,
      subscriptionRepository,
      transactionRepository,
      planRepository
    );
    const userService = new UserService(userRepository, paymentSimulationService);
    const planService = new SubscriptionPlanService(planRepository);

    // Збереження сервісів в app locals для використання в роутах
    this.app.locals.userService = userService;
    this.app.locals.planService = planService;
    this.app.locals.paymentSimulationService = paymentSimulationService;

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
    this.app.use((req, _res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Ініціалізація роутів
   */
  private initializeRoutes(): void {
    const { userService, planService, paymentSimulationService } = this.app.locals;

    // API роути
    this.app.use('/api', createRoutes(userService, planService, paymentSimulationService));

    // Головна сторінка
    this.app.get('/', (_req, res) => {
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
    this.app.use('*', (_req, res) => {
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
      console.log('  POST   /api/payment/simulate         - Симуляція оплати');
      console.log('  GET    /api/payment/user/:email/subscriptions - Підписки користувача');
      console.log('  GET    /api/payment/user/:email/transactions - Транзакції користувача');
      console.log('  GET    /api/payment/stats             - Статистика транзакцій');
    });
  }
}

// Запуск сервера
const server = new Server();
server.start();
