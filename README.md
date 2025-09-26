# SaaS Subscription Management System

Система управління підписками для SaaS, створена для курсової роботи з ООП.

## Архітектура

Система побудована на принципах об'єктно-орієнтованого програмування з використанням TypeScript:

### Основні класи:

1. **DatabaseInterface<T>** - абстрактний клас для доступу до бази даних
2. **JsonDatabase<T>** - реалізація доступу до бази даних через JSON файли
3. **UserService** - клас для роботи з користувачами
4. **SubscriptionPlanService** - клас для роботи з планами підписок
5. **SubscriptionService** - клас для роботи з підписками користувачів
6. **WebhookHandler** - клас для обробки webhook подій

### Моделі даних:

- **User** - користувач системи
- **SubscriptionPlan** - план підписки (продукт)
- **Subscription** - підписка користувача на план
- **WebhookPayload** - дані webhook подій

### Архітектура за принципом Paddle:

- **Плани підписок** - окремі продукти/тарифи (Basic, Premium, Enterprise)
- **Підписки користувачів** - зв'язок між користувачем та планом
- **Багато до одного** - багато користувачів можуть мати підписку на один план
- **Гнучкість** - можна створювати нові типи планів без зміни коду

## Встановлення та запуск

1. Встановіть залежності:

```bash
npm install
```

2. Запустіть сервер:

```bash
npm start
```

Або для розробки з автоперезавантаженням:

```bash
npm run dev
```

Сервер буде доступний за адресою: http://localhost:3000

## API Endpoints

### Користувачі

- `GET /api/users` - Отримати всіх користувачів
- `GET /api/users/:id` - Отримати користувача за ID
- `POST /api/users` - Створити користувача
- `PUT /api/users/:id` - Оновити користувача
- `DELETE /api/users/:id` - Видалити користувача

### Плани підписок

- `GET /api/plans` - Отримати всі плани підписок
- `GET /api/plans/:id` - Отримати план за ID
- `POST /api/plans` - Створити план підписки
- `PUT /api/plans/:id` - Оновити план підписки
- `DELETE /api/plans/:id` - Видалити план

### Підписки

- `GET /api/subscriptions` - Отримати всі підписки
- `GET /api/subscriptions/:id` - Отримати підписку за ID
- `POST /api/subscriptions` - Створити підписку
- `PUT /api/subscriptions/:id` - Оновити підписку
- `POST /api/subscriptions/:id/cancel` - Скасувати підписку
- `GET /api/users/:userId/subscriptions` - Підписки користувача

### Webhooks

- `POST /api/webhooks` - Обробити webhook
- `POST /api/webhooks/test` - Тестовий webhook

## Тестування з Postman

1. Імпортуйте колекцію з файлу `postman/SaaS_Subscription_Management.postman_collection.json`
2. Встановіть змінну `baseUrl` на `http://localhost:3000/api`
3. Запустіть сервер
4. Використовуйте готові запити для тестування

## Приклад використання

### Створення користувача

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

### Створення плану підписки

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Plan",
    "description": "Premium subscription with advanced features",
    "price": 29.99,
    "billingInterval": "monthly",
    "features": ["Advanced analytics", "Priority support", "API access"]
  }'
```

### Створення підписки

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "planId": "PLAN_ID",
    "paymentMethod": "credit_card",
    "autoRenew": true
  }'
```

### Обробка webhook

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment_processed",
    "subscriptionId": "SUBSCRIPTION_ID",
    "userId": "USER_ID",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }'
```

## Структура проекту

```
src/
├── database/
│   ├── DatabaseInterface.ts    # Абстрактний клас для БД
│   └── JsonDatabase.ts         # Реалізація JSON БД
├── models/
│   ├── User.ts                 # Клас користувача
│   └── Subscription.ts         # Клас підписки
├── webhooks/
│   └── WebhookHandler.ts       # Обробка webhook
├── api/
│   └── routes.ts               # API роути
└── index.ts                    # Головний файл сервера
```

## Особливості реалізації

1. **Абстракція бази даних** - використання абстрактного класу дозволяє легко змінити реалізацію БД
2. **Типізація** - повна типізація TypeScript для безпеки типів
3. **Webhook система** - обробка подій payment_processed, payment_failed, subscription_cancelled
4. **JSON зберігання** - дані зберігаються в JSON файлах для простоти демонстрації
5. **RESTful API** - стандартні HTTP методи для CRUD операцій

## Демонстрація роботи

1. Запустіть сервер
2. Створіть користувача через API
3. Створіть підписку для користувача
4. Симулюйте webhook події для зміни статусу підписки
5. Перевірте зміни в JSON файлах в папці `data/`
