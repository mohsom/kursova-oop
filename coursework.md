# КУРСОВА РОБОТА

**Тема:** Розробка системи управління підписками SaaS з використанням об'єктно-орієнтованого підходу

**Дисципліна:** Об'єктно-орієнтоване програмування

---

## РЕФЕРАТ

Курсова робота присвячена розробці системи управління підписками SaaS (Software as a Service) з використанням принципів об'єктно-орієнтованого програмування. Система реалізована на мові TypeScript з використанням Node.js та React, демонструє застосування основних принципів ООП: інкапсуляції, наслідування, поліморфізму та абстракції.

Проект включає повнофункціональну систему управління користувачами, планами підписок, транзакціями та веб-інтерфейс для взаємодії з системою. Архітектура системи побудована на основі патернів проектування: Repository, Factory, Service Layer та Singleton.

**Ключові слова:** об'єктно-орієнтоване програмування, TypeScript, SaaS, підписки, патерни проектування, архітектура програмного забезпечення.

---

## ВСТУП

Сучасний розвиток інформаційних технологій призвів до широкого поширення моделі SaaS (Software as a Service), де програмне забезпечення надається як послуга через інтернет. Управління підписками в таких системах є критично важливим компонентом, що вимагає ретельного проектування та реалізації.

Об'єктно-орієнтоване програмування (ООП) надає потужні засоби для створення складних систем через принципи інкапсуляції, наслідування, поліморфізму та абстракції. Використання цих принципів дозволяє створювати гнучкі, масштабовані та легкі для підтримки системи.

Мета курсової роботи - розробити систему управління підписками SaaS, що демонструє застосування принципів ООП та сучасних патернів проектування.

---

## 1. АНАЛІЗ СУЧАСНОГО СТАНУ ПИТАННЯ ТА ОБҐРУНТУВАННЯ ЗАВДАННЯ НА РОБОТУ

### 1.1. Аналіз предмету проектування

Система управління підписками SaaS є складним програмним продуктом, що включає:

**Основні компоненти:**

- **Управління користувачами** - створення, редагування, видалення користувачів
- **Управління планами підписок** - створення та налаштування різних тарифних планів
- **Обробка підписок** - активація, деактивація, продовження підписок
- **Система платежів** - обробка транзакцій та симуляція оплат
- **Аналітика та звітність** - статистика використання та доходів

**Бізнес-процеси:**

1. Реєстрація користувача в системі
2. Вибір тарифного плану
3. Оформлення підписки
4. Обробка платежів
5. Управління ліцензіями
6. Аналіз використання

### 1.2. Класифікація об'єктно-орієнтованих мов програмування

**За рівнем типізації:**

- **Статично типізовані:** Java, C#, C++
- **Динамічно типізовані:** Python, Ruby, JavaScript
- **Гібридні:** TypeScript, Kotlin

**За парадигмою виконання:**

- **Компільовані:** C++, Java, C#
- **Інтерпретовані:** Python, Ruby, JavaScript
- **Гібридні:** TypeScript (транспіляція в JavaScript)

**За платформою:**

- **JVM:** Java, Kotlin, Scala
- **.NET:** C#, F#, VB.NET
- **Web:** JavaScript, TypeScript, Dart
- **Native:** C++, Rust, Go

**Вибір TypeScript для проекту обґрунтований:**

- Статична типізація для надійності коду
- Повна сумісність з JavaScript
- Потужна підтримка ООП
- Сучасні можливості мови (generics, decorators)
- Широка екосистема та інструменти

### 1.3. Огляд та аналіз сучасних технологій та засобів проектування програмного забезпечення

**Backend технології:**

- **Node.js** - JavaScript runtime для серверної розробки
- **Express.js** - мінімалістичний веб-фреймворк
- **TypeScript** - типізована надмножина JavaScript

**Frontend технології:**

- **React** - бібліотека для створення користувацьких інтерфейсів
- **Axios** - HTTP клієнт для API запитів
- **Recharts** - бібліотека для створення графіків

**Інструменти розробки:**

- **ts-node** - виконання TypeScript без компіляції
- **concurrently** - паралельний запуск скриптів
- **CORS** - обробка міждоменних запитів

**Архітектурні підходи:**

- **Мікросервісна архітектура** - розділення на незалежні сервіси
- **RESTful API** - стандартизований підхід до веб-сервісів
- **Модульна архітектура** - розділення функціональності на модулі

### 1.4. Універсальна мова проектування UML

**UML (Unified Modeling Language)** - стандартизована мова для візуального моделювання програмних систем.

**Основні типи діаграм UML:**

1. **Діаграми структури:**

   - Діаграма класів (Class Diagram)
   - Діаграма об'єктів (Object Diagram)
   - Діаграма компонентів (Component Diagram)

2. **Діаграми поведінки:**

   - Діаграма послідовності (Sequence Diagram)
   - Діаграма активності (Activity Diagram)
   - Діаграма станів (State Diagram)

3. **Діаграми взаємодії:**
   - Діаграма випадків використання (Use Case Diagram)
   - Діаграма комунікації (Communication Diagram)

**Застосування UML в проекті:**

- Моделювання ієрархії класів
- Визначення взаємозв'язків між об'єктами
- Документування архітектури системи
- Планування розробки

### 1.5. Уточнена постановка задачі на розробку програмного забезпечення

**Мета:** Розробити систему управління підписками SaaS з використанням принципів ООП

**Завдання:**

1. Проаналізувати вимоги до системи управління підписками
2. Розробити архітектуру системи з використанням патернів проектування
3. Створити ієрархію класів з дотриманням принципів ООП
4. Реалізувати backend API на TypeScript/Node.js
5. Розробити веб-інтерфейс на React
6. Протестувати функціональність системи
7. Створити документацію проекту

**Функціональні вимоги:**

- Управління користувачами (CRUD операції)
- Управління планами підписок
- Обробка підписок та транзакцій
- Симуляція платежів
- Аналітика та статистика
- Веб-інтерфейс для взаємодії

**Нефункціональні вимоги:**

- Модульна архітектура
- Використання принципів ООП
- Застосування патернів проектування
- Типізація коду
- Документованість

---

## 2. РОЗРОБКА ЗАГАЛЬНОЇ СТРУКТУРИ ПРОГРАМИ ТА ІЄРАРХІЇ КЛАСІВ

### 2.1. Аналіз функцій системи

**Основні функціональні модулі:**

1. **Модуль управління користувачами**

   - Створення користувачів
   - Редагування профілів
   - Видалення користувачів
   - Пошук та фільтрація

2. **Модуль управління планами**

   - Створення тарифних планів
   - Налаштування цін та періодів
   - Управління функціями планів

3. **Модуль підписок**

   - Активація підписок
   - Продовження терміну
   - Скасування підписок
   - Перевірка статусу

4. **Модуль платежів**

   - Симуляція транзакцій
   - Обробка успішних/неуспішних платежів
   - Валідація сум

5. **Модуль аналітики**
   - Статистика транзакцій
   - Аналіз доходів
   - Графічне представлення даних

### 2.2. Декомпозиція системи

**Архітектурні рівні:**

```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│         (React Frontend)            │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│            API Layer                │
│         (Express Routes)            │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│          Service Layer              │
│    (UserService, PaymentService)    │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│         Repository Layer            │
│      (DatabaseService<T>)           │
└─────────────────────────────────────┘
                    │
┌─────────────────────────────────────┐
│          Data Layer                 │
│        (JSON Files)                 │
└─────────────────────────────────────┘
```

**Модульна структура:**

- **api/** - API роути та обробники
- **services/** - бізнес-логіка
- **models/** - доменні моделі
- **database/** - робота з даними
- **types/** - TypeScript типи

### 2.3. Аналіз взаємозв'язків між об'єктами

**Основні взаємозв'язки:**

1. **User ↔ UserSubscription** (1:1)

   - Користувач має одну активну підписку
   - Підписка належить конкретному користувачу

2. **UserSubscription ↔ SubscriptionPlan** (N:1)

   - Багато підписок можуть використовувати один план
   - План визначає параметри підписки

3. **User ↔ Transaction** (1:N)

   - Користувач може мати багато транзакцій
   - Транзакція належить конкретному користувачу

4. **Service ↔ Repository** (Composition)
   - Сервіси використовують репозиторії для роботи з даними
   - Залежність через ін'єкцію

### 2.4. Розроблення інтерфейсів класів

**Базові інтерфейси:**

```typescript
// Абстрактний клас для роботи з базою даних
abstract class DatabaseService<T> {
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: Omit<T, "id">): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract findBy(criteria: Partial<T>): Promise<T[]>;
}

// Інтерфейс для сервісів
interface IService {
  // Базові CRUD операції
}

// Інтерфейс для моделей
interface IModel {
  id: string;
  // Базові властивості
}
```

**Доменні моделі:**

```typescript
class User {
  constructor(public id: string, public name: string, public email: string) {}

  setSubscription(subscription: UserSubscription): void;
  getSubscription(): UserSubscription | undefined;
  hasActiveSubscription(): boolean;
}

class SubscriptionPlan {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public period: "monthly" | "yearly"
  ) {}

  getMonthlyPrice(): number;
  getYearlyPrice(): number;
}
```

### 2.5. Розроблення структурної моделі системи і UML-діаграми класів

**UML діаграма класів:**

```mermaid
classDiagram
    %% Моделі даних
    class User {
        -id: string
        -name: string
        -email: string
        -userSubscription?: UserSubscription
        +setSubscription(subscription: UserSubscription): void
        +getSubscription(): UserSubscription | undefined
        +hasActiveSubscription(): boolean
    }

    class SubscriptionPlan {
        -id: string
        -name: string
        -price: number
        -period: 'monthly' | 'yearly'
        +getMonthlyPrice(): number
        +getYearlyPrice(): number
    }

    class UserSubscription {
        -email: string
        -subscriptionPlanId: string
        -subscriptionEndDate: Date
        +getDaysLeft(): number
        +isActive(): boolean
        +extendSubscription(days: number): void
    }

    class Transaction {
        -id: string
        -amount: number
        -email: string
        -subscriptionPlanId: string
        +getInfo(): string
        +isValidAmount(): boolean
    }

    %% Абстракція бази даних
    class DatabaseService~T~ {
        <<abstract>>
        +findAll(): Promise~T[]~
        +findById(id: string): Promise~T | null~
        +create(data: Omit~T, 'id'~): Promise~T~
        +update(id: string, data: Partial~T~): Promise~T | null~
        +delete(id: string): Promise~boolean~
    }

    %% Реалізація бази даних
    class JSONDataBaseService~T~ {
        -filePath: string
        -data: T[]
        +findAll(): Promise~T[]~
        +findById(id: string): Promise~T | null~
        +create(data: Omit~T, 'id'~): Promise~T~
        +update(id: string, data: Partial~T~): Promise~T | null~
        +delete(id: string): Promise~boolean~
    }

    %% Фабрика (Singleton)
    class DatabaseFactory {
        -static instance: DatabaseFactory
        +static getInstance(): DatabaseFactory
        +createService~T~(fileName: string): DatabaseService~T~
    }

    %% Сервіси
    class UserService {
        -userRepository: DatabaseService~UserData~
        -paymentSimulationService?: PaymentSimulationService
        +createUser(name: string, email: string): Promise~User~
        +getUserById(id: string): Promise~User | null~
        +getAllUsers(): Promise~User[]~
    }

    class PaymentSimulationService {
        -userRepository: DatabaseService~UserData~
        -subscriptionRepository: DatabaseService~UserSubscriptionData~
        -transactionRepository: DatabaseService~TransactionData~
        +simulatePayment(userEmail: string, subscriptionPlanId: string, amount: number): Promise~{ userSubscription: UserSubscription; transaction: Transaction }~
    }

    %% Відносини наслідування
    JSONDataBaseService --|> DatabaseService : extends

    %% Відносини композиції
    UserService --> DatabaseService : uses
    UserService --> User : creates/returns
    PaymentSimulationService --> DatabaseService : uses
    PaymentSimulationService --> UserSubscription : creates/returns
    PaymentSimulationService --> Transaction : creates/returns

    %% Відносини між моделями
    User --> UserSubscription : has
    UserSubscription --> SubscriptionPlan : references
    Transaction --> SubscriptionPlan : references
```

**Архітектурні патерни:**

1. **Singleton Pattern** - DatabaseFactory

   - Забезпечує єдиний екземпляр фабрики
   - Контролює створення репозиторіїв

2. **Factory Pattern** - DatabaseFactory

   - Створює відповідні реалізації DatabaseService
   - Абстрагує процес створення об'єктів

3. **Repository Pattern** - DatabaseService/JSONDataBaseService

   - Абстрагує доступ до даних
   - Забезпечує уніфікований інтерфейс

4. **Service Layer Pattern**
   - Інкапсулює бізнес-логіку
   - Координує роботу між репозиторіями

---

## 3. РОЗРОБКА КОРИСТУВАЦЬКОГО ІНТЕРФЕЙСУ

**Технологічний стек frontend:**

- **React 18** - бібліотека для створення UI
- **TypeScript** - типізація для надійності
- **Axios** - HTTP клієнт для API запитів
- **Recharts** - бібліотека для графіків
- **Lucide React** - іконки

**Основні компоненти інтерфейсу:**

1. **UserManagement** - управління користувачами

   - Список користувачів
   - Форма створення/редагування
   - Пошук та фільтрація

2. **PlanManagement** - управління планами

   - Створення тарифних планів
   - Налаштування цін та періодів
   - Редагування функцій

3. **PaymentSimulation** - симуляція платежів

   - Вибір користувача та плану
   - Розрахунок вартості
   - Обробка транзакцій

4. **TransactionStats** - аналітика
   - Графіки доходів
   - Статистика транзакцій
   - Фільтрація даних

**Архітектура frontend:**

```
src/
├── components/          # React компоненти
│   ├── UserManagement.tsx
│   ├── PlanManagement.tsx
│   ├── PaymentSimulation.tsx
│   └── TransactionStats.tsx
├── services/           # API сервіси
│   └── api.ts
├── types/             # TypeScript типи
│   └── index.ts
└── App.tsx           # Головний компонент
```

**Особливості реалізації:**

- Типізовані API запити
- Реактивні компоненти
- Обробка помилок
- Валідація форм
- Адаптивний дизайн

---

## 4. ТЕСТУВАННЯ ПРОГРАМНОГО ЗАБЕЗПЕЧЕННЯ І РОЗРОБКА ДОКУМЕНТАЦІЇ ДЛЯ СУПРОВОДЖЕННЯ ПРОГРАМНОГО ПРОДУКТУ

### 4.1. Стратегія тестування

**Рівні тестування:**

1. **Unit тести** - тестування окремих класів та методів
2. **Integration тести** - тестування взаємодії між компонентами
3. **System тести** - тестування системи в цілому
4. **Acceptance тести** - тестування з точки зору користувача

**Інструменти тестування:**

- **Jest** - фреймворк для unit тестів
- **Supertest** - тестування HTTP API
- **React Testing Library** - тестування React компонентів

### 4.2. Документація проекту

**Структура документації:**

1. **README.md** - загальний опис проекту
2. **API Documentation** - документація API endpoints
3. **Class Hierarchy** - ієрархія класів та UML діаграми
4. **Installation Guide** - інструкція з встановлення
5. **User Manual** - керівництво користувача

**API Endpoints:**

```
GET    /api/users                    - Отримати всіх користувачів
GET    /api/users/:id                - Отримати користувача за ID
POST   /api/users                    - Створити користувача
PUT    /api/users/:id                - Оновити користувача
DELETE /api/users/:id                - Видалити користувача

GET    /api/plans                    - Отримати всі плани
POST   /api/plans                    - Створити план
PUT    /api/plans/:id                - Оновити план
DELETE /api/plans/:id                - Видалити план

POST   /api/payment/simulate         - Симуляція оплати
GET    /api/payment/stats            - Статистика транзакцій
```

### 4.3. Інструкція з встановлення та запуску

**Вимоги до системи:**

- Node.js 16+
- npm або yarn
- Сучасний веб-браузер

**Кроки встановлення:**

1. Клонування репозиторію
2. Встановлення залежностей: `npm install`
3. Встановлення frontend залежностей: `npm run frontend:install`
4. Запуск backend: `npm run dev`
5. Запуск frontend: `npm run frontend`
6. Або запуск обох: `npm run dev:full`

**Налаштування:**

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`
- Автоматичне створення .env файлів

---

## ВИСНОВКИ

В ході виконання курсової роботи була розроблена повнофункціональна система управління підписками SaaS з використанням принципів об'єктно-орієнтованого програмування.

**Досягнуті результати:**

1. **Архітектурні рішення:**

   - Застосовано патерни проектування (Singleton, Factory, Repository, Service Layer)
   - Реалізовано модульну архітектуру з чітким розділенням відповідальностей
   - Створено типізовану систему з використанням TypeScript

2. **Об'єктно-орієнтований підхід:**

   - Інкапсуляція - кожен клас має чітко визначені методи та властивості
   - Наслідування - DatabaseService як базовий клас для JSONDataBaseService
   - Поліморфізм - використання абстрактних класів та інтерфейсів
   - Абстракція - DatabaseInterface як абстракція для роботи з даними

3. **Функціональність:**

   - Повний CRUD для користувачів, планів та підписок
   - Система симуляції платежів
   - Аналітика та статистика
   - Сучасний веб-інтерфейс

4. **Технічні особливості:**
   - RESTful API з Express.js
   - React frontend з TypeScript
   - JSON база даних для простоти
   - CORS налаштування для міждоменної роботи

**Переваги реалізованої архітектури:**

- **Масштабованість** - легко додавати нові функції
- **Підтримка** - чітка структура коду
- **Тестування** - можливість unit та integration тестів
- **Гнучкість** - можна замінити JSON БД на іншу реалізацію

**Можливі покращення:**

1. **База даних** - заміна JSON на PostgreSQL або MongoDB
2. **Аутентифікація** - додавання JWT токенів
3. **Валідація** - більш детальна валідація даних
4. **Тестування** - покриття unit тестами
5. **Документація** - автоматична генерація API документації

Проект успішно демонструє застосування принципів ООП та сучасних патернів проектування для створення реальної системи управління підписками.

---

## БІБЛІОГРАФІЧНИЙ СПИСОК

1. Gamma, E. Design Patterns: Elements of Reusable Object-Oriented Software / E. Gamma, R. Helm, R. Johnson, J. Vlissides. – Addison-Wesley, 1994. – 395 p.

2. Martin, R. Clean Architecture: A Craftsman's Guide to Software Structure and Design / R. Martin. – Prentice Hall, 2017. – 432 p.

3. Fowler, M. Patterns of Enterprise Application Architecture / M. Fowler. – Addison-Wesley, 2002. – 533 p.

4. TypeScript Handbook. – URL: https://www.typescriptlang.org/docs/ (дата звернення: 15.12.2024).

5. React Documentation. – URL: https://react.dev/ (дата звернення: 15.12.2024).

6. Express.js Guide. – URL: https://expressjs.com/ (дата звернення: 15.12.2024).

7. UML 2.0 Specification. – URL: https://www.omg.org/spec/UML/ (дата звернення: 15.12.2024).

8. Node.js Documentation. – URL: https://nodejs.org/docs/ (дата звернення: 15.12.2024).

---

## ДОДАТКИ

### Додаток А. Структура проекту

```
kursova-oop/
├── src/                    # Backend (Node.js + TypeScript + Express)
│   ├── api/               # API роути
│   │   └── routes.ts
│   ├── database/          # Робота з базою даних
│   │   ├── DatabaseFactory.ts
│   │   ├── DatabaseInterface.ts
│   │   └── JsonDatabase.ts
│   ├── models/           # Моделі даних
│   │   ├── User.ts
│   │   ├── SubscriptionPlan.ts
│   │   ├── UserSubscription.ts
│   │   └── Transaction.ts
│   ├── services/         # Бізнес-логіка
│   │   ├── UserService.ts
│   │   ├── SubscriptionPlanService.ts
│   │   ├── SubscriptionService.ts
│   │   └── PaymentSimulationService.ts
│   ├── types/           # TypeScript типи
│   │   └── DatabaseTypes.ts
│   └── index.ts         # Головний файл сервера
├── frontend/            # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/   # React компоненти
│   │   │   ├── UserManagement.tsx
│   │   │   ├── PlanManagement.tsx
│   │   │   ├── PaymentSimulationNew.tsx
│   │   │   └── TransactionStatsNew.tsx
│   │   ├── services/    # API сервіси
│   │   │   └── api.ts
│   │   ├── types/       # TypeScript типи
│   │   │   └── index.ts
│   │   ├── App.tsx      # Головний компонент
│   │   └── index.tsx    # Точка входу
│   └── public/          # Статичні файли
├── data/                # JSON файли з даними
│   ├── users.json
│   ├── subscription_plans.json
│   ├── user_subscriptions.json
│   └── transactions.json
├── package.json         # Залежності та скрипти
├── tsconfig.json        # Налаштування TypeScript
├── class-hierarchy.md   # UML діаграми
└── README.md           # Документація проекту
```

### Додаток Б. UML діаграми

Див. файл `class-hierarchy.md` для повних UML діаграм системи.

### Додаток В. Приклади коду

**Приклад класу User:**

```typescript
export class User {
  constructor(public id: string, public name: string, public email: string) {}

  setSubscription(subscription: UserSubscription): void {
    this.userSubscription = subscription;
  }

  hasActiveSubscription(): boolean {
    return this.userSubscription?.isActive() ?? false;
  }
}
```

**Приклад сервісу:**

```typescript
export class UserService {
  constructor(
    private userRepository: DatabaseService<UserData>,
    private paymentSimulationService?: PaymentSimulationService
  ) {}

  async createUser(name: string, email: string): Promise<User> {
    const id = this.generateId();
    const user = new User(id, name, email);
    await this.userRepository.create({
      name: user.name,
      email: user.email,
    });
    return user;
  }
}
```

### Додаток Г. API Endpoints

Повний список API endpoints див. в README.md файлі проекту.

### Додаток Д. Скріншоти інтерфейсу

[Тут можуть бути скріншоти веб-інтерфейсу системи]
