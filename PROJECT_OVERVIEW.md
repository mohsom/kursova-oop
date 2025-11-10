# ПОВНИЙ ОГЛЯД ПРОЕКТУ
## Система управління підписками SaaS

---

## 1. АНАЛІЗ ФУНКЦІЙ СИСТЕМИ

### 1.1 Основні функціональні можливості

**Backend API:**
- CRUD операції для користувачів (створення, читання, оновлення, видалення)
- CRUD операції для планів підписок
- Симуляція платежів з автоматичним створенням підписок
- Управління підписками користувачів
- Збереження історії транзакцій
- REST API endpoints для всіх операцій

**Frontend додаток:**
- Управління користувачами (таблиця з CRUD операціями)
- Управління планами підписок (картки з CRUD операціями)
- Симуляція платежів (Paddle-style інтерфейс)
- Статистика та аналітика (графіки транзакцій з Recharts)

### 1.2 Технічний стек

**Backend:**
- Node.js + TypeScript 5.3.0
- Express 4.18.2
- JSON файлова база даних
- CORS, Body Parser

**Frontend:**
- React 18.2.0 + TypeScript 4.9.5
- Material-UI 5.14.20
- React Router 6.20.1
- Axios 1.6.2
- Recharts 2.8.0

---

## 2. ДЕКОМПОЗИЦІЯ СИСТЕМИ

### 2.1 Архітектурні шари

```
┌─────────────────────────────────────┐
│     Presentation Layer (React)      │
│  - UsersPage, PlansPage             │
│  - PaymentSimulationPage            │
│  - StatisticsPage                   │
└─────────────────────────────────────┘
              ↓ HTTP (Axios)
┌─────────────────────────────────────┐
│      API Layer (Express Routes)     │
│  - /api/users                       │
│  - /api/plans                       │
│  - /api/payment                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Business Logic (Services)      │
│  - UserService                      │
│  - SubscriptionPlanService          │
│  - PaymentSimulationService         │
│  - UserSubscriptionService          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    Data Access Layer (Repository)   │
│  - DatabaseInterface (abstract)     │
│  - JSONDatabaseService (concrete)   │
│  - DatabaseFactory                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Data Storage (JSON Files)     │
│  - users.json                       │
│  - subscription_plans.json          │
│  - user_subscriptions.json          │
│  - transactions.json                │
└─────────────────────────────────────┘
```

### 2.2 Модульна структура

**Backend модулі (src/):**
- `models/` - Доменні класи (User, SubscriptionPlan, UserSubscription, Transaction)
- `database/` - Абстракція БД (DatabaseInterface, DatabaseFactory, JsonDatabase)
- `services/` - Бізнес-логіка (UserService, SubscriptionPlanService, PaymentSimulationService)
- `api/` - REST endpoints (routes.ts)
- `types/` - TypeScript типи (DatabaseTypes.ts)
- `index.ts` - Точка входу (Server клас)

**Frontend модулі (frontend/src/):**
- `pages/` - Сторінки додатку (UsersPage, PlansPage, PaymentSimulationPage, StatisticsPage)
- `components/` - Переборні компоненти (Layout)
- `services/` - HTTP клієнт (api.ts)
- `types/` - TypeScript інтерфейси
- `App.tsx` - Головний компонент з роутингом

---

## 3. АНАЛІЗ ВЗАЄМОЗВ'ЯЗКІВ МІЖ ОБ'ЄКТАМИ

### 3.1 Діаграма взаємозв'язків класів

```
User (1) ──────────── (0..1) UserSubscription
                              │
                              │ (N) ──────── (1) SubscriptionPlan
                              │
Transaction (N) ──────────────┘

Server
  ├── DatabaseFactory (Singleton)
  ├── UserService
  │     ├── DatabaseService<UserData>
  │     ├── UserSubscriptionService
  │     └── SubscriptionPlanService
  ├── SubscriptionPlanService
  │     └── DatabaseService<SubscriptionPlanData>
  └── PaymentSimulationService
        ├── DatabaseService<UserSubscriptionData>
        ├── DatabaseService<TransactionData>
        └── DatabaseService<SubscriptionPlanData>
```

### 3.2 Залежності між компонентами

**User → UserSubscription:**
- User містить посилання на UserSubscription через метод `setSubscription()`
- User може перевірити активність підписки через `hasActiveSubscription()`
- Зв'язок: композиція (User володіє підпискою)

**UserSubscription → SubscriptionPlan:**
- UserSubscription зберігає `subscriptionPlanId`
- Зв'язок: асоціація (підписка посилається на план)

**Transaction → User + SubscriptionPlan:**
- Transaction містить `email` (користувача) та `subscriptionPlanId`
- Зв'язок: асоціація (транзакція посилається на обидві сутності)

**Services → Repository:**
- Всі сервіси залежать від DatabaseService через Dependency Injection
- Зв'язок: залежність (сервіси використовують репозиторії)

---

## 4. РОЗРОБЛЕННЯ ІНТЕРФЕЙСІВ КЛАСІВ

### 4.1 Основні класи моделей

#### **User** ([src/models/User.ts](src/models/User.ts))
```typescript
class User {
  constructor(
    public id: string,
    public name: string,
    public email: string
  )

  // Методи
  setSubscription(subscription: UserSubscription): void
  getSubscription(): UserSubscription | undefined
  hasActiveSubscription(): boolean
  getSubscriptionInfo(): string
}
```

#### **SubscriptionPlan** ([src/models/SubscriptionPlan.ts](src/models/SubscriptionPlan.ts))
```typescript
class SubscriptionPlan {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public period: 'monthly' | 'yearly'
  )

  // Методи
  getMonthlyPrice(): number
  getYearlyPrice(): number
  isMonthly(): boolean
  isYearly(): boolean
}
```

#### **UserSubscription** ([src/models/UserSubscription.ts](src/models/UserSubscription.ts))
```typescript
class UserSubscription {
  constructor(
    public email: string,
    public subscriptionPlanId: string,
    public subscriptionEndDate: Date
  )

  // Методи
  getDaysLeft(): number
  isActive(): boolean
  getStatus(): string
}
```

#### **Transaction** ([src/models/Transaction.ts](src/models/Transaction.ts))
```typescript
class Transaction {
  constructor(
    public id: string,
    public amount: number,
    public email: string,
    public subscriptionPlanId: string,
    public date: string
  )

  // Методи
  getInfo(): string
  isValidAmount(): boolean
  getAmountInUSD(): number
  getAmountInEUR(): number
}
```

### 4.2 Абстрактний клас DatabaseService

#### **DatabaseService<T>** ([src/database/DatabaseInterface.ts](src/database/DatabaseInterface.ts))
```typescript
abstract class DatabaseService<T> {
  abstract findAll(): Promise<T[]>
  abstract findById(id: string): Promise<T | null>
  abstract create(data: Omit<T, 'id'>): Promise<T>
  abstract update(id: string, data: Partial<T>): Promise<T | null>
  abstract delete(id: string): Promise<boolean>
  abstract findBy(criteria: Partial<T>): Promise<T[]>
}
```

### 4.3 Сервісні класи

#### **UserService** ([src/services/UserService.ts](src/services/UserService.ts))
```typescript
class UserService {
  constructor(
    private userRepository: DatabaseService<UserData>,
    private userSubscriptionService: UserSubscriptionService,
    private planService: SubscriptionPlanService
  )

  async createUser(name: string, email: string): Promise<User>
  async getUserById(id: string): Promise<User | null>
  async getUserByEmail(email: string): Promise<User | null>
  async getAllUsers(): Promise<User[]>
  async getAllUsersWithSubscriptions(): Promise<any[]>
  async updateUser(id: string, name?: string, email?: string): Promise<User | null>
  async deleteUser(id: string): Promise<boolean>
}
```

#### **PaymentSimulationService** ([src/services/PaymentSimulationService.ts](src/services/PaymentSimulationService.ts))
```typescript
class PaymentSimulationService {
  constructor(
    private subscriptionRepository: DatabaseService<UserSubscriptionData>,
    private transactionRepository: DatabaseService<TransactionData>,
    private planRepository: DatabaseService<SubscriptionPlanData>
  )

  async simulatePayment(
    userEmail: string,
    subscriptionPlanId: string,
    amount: number
  ): Promise<{ userSubscription: UserSubscription; transaction: Transaction }>

  async getTransactions(): Promise<Transaction[]>
}
```

### 4.4 Server клас

#### **Server** ([src/index.ts](src/index.ts))
```typescript
class Server {
  private app: express.Application
  private port: number

  constructor(port?: number)

  private initializeDatabase(): void
  private initializeMiddleware(): void
  private initializeRoutes(): void
  public start(): void
}
```

---

## 5. UML-ДІАГРАМА КЛАСІВ

```
┌─────────────────────────────────┐
│          <<abstract>>           │
│       DatabaseService<T>        │
├─────────────────────────────────┤
│ + findAll(): Promise<T[]>       │
│ + findById(id): Promise<T>      │
│ + create(data): Promise<T>      │
│ + update(id, data): Promise<T>  │
│ + delete(id): Promise<boolean>  │
│ + findBy(criteria): Promise<T[]>│
└─────────────────────────────────┘
            △
            │ implements
            │
┌───────────┴─────────────────────┐
│   JSONDatabaseService<T>        │
├─────────────────────────────────┤
│ - filePath: string              │
│ - data: T[]                     │
├─────────────────────────────────┤
│ + findAll(): Promise<T[]>       │
│ + findById(id): Promise<T>      │
│ + create(data): Promise<T>      │
│ # readFromFile(): Promise<T[]>  │
│ # writeToFile(data): Promise    │
└─────────────────────────────────┘


┌──────────────────────┐      ┌──────────────────────┐
│        User          │      │   SubscriptionPlan   │
├──────────────────────┤      ├──────────────────────┤
│ + id: string         │      │ + id: string         │
│ + name: string       │      │ + name: string       │
│ + email: string      │      │ + price: number      │
│ - subscription       │      │ + period: string     │
├──────────────────────┤      ├──────────────────────┤
│ + setSubscription()  │      │ + getMonthlyPrice()  │
│ + getSubscription()  │      │ + getYearlyPrice()   │
│ + hasActive()        │      │ + isMonthly()        │
└──────────────────────┘      └──────────────────────┘
         │ 1                           △
         │                             │
         │ has                         │ references
         ↓ 0..1                        │
┌──────────────────────┐              │
│  UserSubscription    │──────────────┘
├──────────────────────┤      N
│ + email: string      │
│ + planId: string     │
│ + endDate: Date      │
├──────────────────────┤
│ + getDaysLeft()      │
│ + isActive()         │
│ + getStatus()        │
└──────────────────────┘
         △
         │ creates
         │
┌──────────────────────┐
│    Transaction       │
├──────────────────────┤
│ + id: string         │
│ + amount: number     │
│ + email: string      │
│ + planId: string     │
│ + date: string       │
├──────────────────────┤
│ + getInfo()          │
│ + isValidAmount()    │
│ + getAmountInUSD()   │
└──────────────────────┘


┌─────────────────────────────────┐
│       DatabaseFactory           │
│       <<singleton>>             │
├─────────────────────────────────┤
│ - instance: DatabaseFactory     │
├─────────────────────────────────┤
│ + createService<T>(): Service<T>│
└─────────────────────────────────┘
            │ creates
            ↓
┌─────────────────────────────────┐
│         UserService             │
├─────────────────────────────────┤
│ - userRepository                │
│ - subscriptionService           │
│ - planService                   │
├─────────────────────────────────┤
│ + createUser()                  │
│ + getAllUsersWithSubs()         │
│ + updateUser()                  │
│ + deleteUser()                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   PaymentSimulationService      │
├─────────────────────────────────┤
│ - subscriptionRepository        │
│ - transactionRepository         │
│ - planRepository                │
├─────────────────────────────────┤
│ + simulatePayment()             │
│ + getTransactions()             │
└─────────────────────────────────┘
```

---

## 6. РОЗРОБКА КОРИСТУВАЦЬКОГО ІНТЕРФЕЙСУ

### 6.1 Структура UI

**Головний Layout** ([frontend/src/components/Layout.tsx](frontend/src/components/Layout.tsx))
- Material-UI Drawer (бокове меню)
- Постійна навігація: Користувачі, Плани, Симуляція оплати, Статистика
- Responsive дизайн

### 6.2 Сторінки

#### **UsersPage** ([frontend/src/pages/UsersPage.tsx](frontend/src/pages/UsersPage.tsx))
**Компоненти:**
- Table з колонками: Email, Ім'я, Назва плану, Статус, Дата закінчення
- Кнопка "Додати користувача"
- IconButton для редагування та видалення
- Dialog для створення/редагування

**Функціональність:**
- Відображення користувачів з підписками
- CRUD операції
- Статус підписки (Активна/Неактивна) з кольоровими Chip
- Форматування дат (UK locale)

#### **PlansPage** ([frontend/src/pages/PlansPage.tsx](frontend/src/pages/PlansPage.tsx))
**Компоненти:**
- Grid з Card компонентами
- Кожна картка: ID, назва, ціна, період
- Кнопки редагування та видалення
- Dialog для створення/редагування

**Функціональність:**
- Відображення планів у вигляді карток
- CRUD операції
- Вибір періоду (monthly/yearly)

#### **PaymentSimulationPage** ([frontend/src/pages/PaymentSimulationPage.tsx](frontend/src/pages/PaymentSimulationPage.tsx))
**Стиль: Paddle-подібний інтерфейс**

**Компоненти:**
- Select для вибору користувача
- Select для вибору плану
- Автоматичний розрахунок суми
- Велика кнопка "Оплатити" з іконкою кредитної картки
- Snackbar для повідомлень успіху/помилки

**Функціональність:**
- Симуляція платіжного процесу
- Створення підписки та транзакції
- Відображення результату оплати

#### **StatisticsPage** ([frontend/src/pages/StatisticsPage.tsx](frontend/src/pages/StatisticsPage.tsx))
**Компоненти:**
- Recharts LineChart
- ResponsiveContainer для адаптивності
- Dual Y-axis (кількість і сума)
- Tooltip з форматуванням

**Функціональність:**
- Відображення транзакцій по днях
- Групування даних
- Line chart з двома лініями: кількість транзакцій та сума

### 6.3 UI/UX особливості

**Material-UI Theme:**
```typescript
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" }
  }
});
```

**Колірна схема:**
- Активна підписка: зелений Chip (success)
- Неактивна підписка: червоний Chip (error)
- Без підписки: сірий Chip (default)

**Ікони:**
- People (користувачі)
- CardMembership (плани)
- Payment (оплата)
- BarChart (статистика)
- Edit, Delete, Add (дії)

---

## 7. ТЕСТУВАННЯ ТА ДОКУМЕНТАЦІЯ

### 7.1 API тестування

**Postman колекція** ([postman/](postman/))
- Готові запити для всіх endpoints
- Тестові сценарії

**Endpoints для тестування:**
```
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/plans
POST   /api/plans
PUT    /api/plans/:id
DELETE /api/plans/:id

POST   /api/payment/simulate
GET    /api/payment/transactions
```

### 7.2 Тестові сценарії

**Сценарій 1: Створення підписки**
1. POST /api/users (створити користувача)
2. POST /api/plans (створити план)
3. POST /api/payment/simulate (симулювати оплату)
4. GET /api/users (перевірити підписку)

**Сценарій 2: Перегляд статистики**
1. POST /api/payment/simulate (кілька разів)
2. GET /api/payment/transactions
3. Перевірити групування по датах у frontend

### 7.3 Валідація даних

**Backend валідація:**
- Обов'язкові поля (name, email, price, period)
- Унікальність email
- Формат періоду (monthly/yearly)
- Позитивна ціна

**Frontend валідація:**
- TextField обов'язкові поля
- Email формат
- Підтвердження видалення

### 7.4 Обробка помилок

**Backend:**
```typescript
try {
  // операція
} catch (error) {
  res.status(500).json({
    success: false,
    message: 'Повідомлення помилки',
    error: error.message
  });
}
```

**Frontend:**
```typescript
try {
  await api.method()
  // success
} catch (error) {
  // показати Snackbar з помилкою
}
```

### 7.5 Документація коду

**JSDoc коментарі:**
- Всі класи мають описи
- Всі публічні методи документовані
- Параметри та повернення описані

**README.md:**
- Інструкції з встановлення
- Опис функціональності
- API endpoints
- Технології

### 7.6 Структура даних

**Приклад даних:**

users.json:
```json
[
  {
    "id": "1",
    "name": "Іван Петренко",
    "email": "ivan@example.com"
  }
]
```

subscription_plans.json:
```json
[
  {
    "id": "1",
    "name": "Basic Plan",
    "price": 100,
    "period": "monthly"
  }
]
```

user_subscriptions.json:
```json
[
  {
    "id": "1",
    "email": "ivan@example.com",
    "subscriptionPlanId": "1",
    "subscriptionEndDate": "2025-12-10T00:00:00.000Z"
  }
]
```

transactions.json:
```json
[
  {
    "id": "abc123",
    "amount": 100,
    "email": "ivan@example.com",
    "subscriptionPlanId": "1",
    "date": "2025-11-10T10:30:00.000Z"
  }
]
```

---

## 8. ПАТТЕРНИ ПРОЕКТУВАННЯ

### 8.1 Використані паттерни

**1. Factory Pattern** - DatabaseFactory
- Створення інстансів DatabaseService
- Централізоване управління створенням об'єктів

**2. Repository Pattern** - DatabaseService
- Абстракція доступу до даних
- JSONDatabaseService як конкретна реалізація

**3. Service Layer Pattern**
- UserService, SubscriptionPlanService, PaymentSimulationService
- Інкапсуляція бізнес-логіки

**4. Dependency Injection**
- Сервіси приймають залежності через конструктор
- Слабке зв'язування компонентів

**5. Singleton Pattern** - DatabaseFactory
- Одна інстанція на весь додаток

---

## 9. ЗАПУСК ТА КОНФІГУРАЦІЯ

### 9.1 Швидкий старт

```bash
# Встановлення
npm run setup

# Запуск обох серверів
npm run dev:full
```

**URL адреси:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 9.2 Environment змінні

**.env (Backend):**
```
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001/api
CORS_ORIGIN=http://localhost:3000
```

---

## 10. ВИСНОВКИ

### 10.1 Реалізовані вимоги

✅ Об'єктно-орієнтована архітектура
✅ Патерни проектування (Factory, Repository, Service Layer, DI)
✅ Типізація TypeScript
✅ REST API
✅ Повнофункціональний UI з Material-UI
✅ Статистика та аналітика
✅ CRUD операції для всіх сутностей
✅ Валідація даних
✅ Обробка помилок
✅ Документація коду

### 10.2 Технічні характеристики

- **Мови:** TypeScript
- **Backend:** Node.js + Express
- **Frontend:** React 18 + Material-UI
- **База даних:** JSON файли
- **Архітектура:** 3-tier (Presentation, Business Logic, Data Access)
- **API:** RESTful
- **Загальна кількість файлів:** 23 TypeScript файла (14 backend + 9 frontend)

---

**Проект виконаний:** Володимир Скальський
**Дата:** Листопад 2025
**Курсова робота з ООП**
