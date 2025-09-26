import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { JsonDatabase } from './database/JsonDatabase';
import { UserService } from './models/User';
import { SubscriptionService } from './models/Subscription';
import { WebhookHandler } from './webhooks/WebhookHandler';
import { createRoutes } from './api/routes';

/**
 * Головний файл сервера
 */
class Server {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
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
    
    // Створення сервісів
    const userService = new UserService(userRepository);
    const subscriptionService = new SubscriptionService(subscriptionRepository);
    const webhookHandler = new WebhookHandler(subscriptionService);
    
    // Збереження сервісів в app locals для використання в роутах
    this.app.locals.userService = userService;
    this.app.locals.subscriptionService = subscriptionService;
    this.app.locals.webhookHandler = webhookHandler;
    
    console.log('База даних ініціалізована');
  }

  /**
   * Ініціалізація middleware
   */
  private initializeMiddleware(): void {
    // CORS
    this.app.use(cors());
    
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
    const { userService, subscriptionService, webhookHandler } = this.app.locals;
    
    // API роути
    this.app.use('/api', createRoutes(userService, subscriptionService, webhookHandler));
    
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
      console.log('  GET    /api/subscriptions             - Отримати всі підписки');
      console.log('  GET    /api/subscriptions/:id         - Отримати підписку за ID');
      console.log('  POST   /api/subscriptions             - Створити підписку');
      console.log('  PUT    /api/subscriptions/:id         - Оновити підписку');
      console.log('  POST   /api/subscriptions/:id/cancel  - Скасувати підписку');
      console.log('  GET    /api/users/:userId/subscriptions - Підписки користувача');
      console.log('  POST   /api/webhooks                  - Webhook обробка');
      console.log('  POST   /api/webhooks/test             - Тестовий webhook');
    });
  }
}

// Запуск сервера
const server = new Server(3000);
server.start();
