# Ієрархія класів та взаємодія - SaaS Subscription Management

## Діаграма ієрархії класів

```mermaid
classDiagram
    %% Моделі даних (Domain Models)
    class User {
        -id: string
        -name: string
        -email: string
        -userSubscription?: UserSubscription
        +setSubscription(subscription: UserSubscription): void
        +getSubscription(): UserSubscription | undefined
        +hasActiveSubscription(): boolean
        +getSubscriptionInfo(): string
    }

    class SubscriptionPlan {
        -id: string
        -name: string
        -price: number
        -period: 'monthly' | 'yearly'
        +getMonthlyPrice(): number
        +getYearlyPrice(): number
        +isMonthly(): boolean
        +isYearly(): boolean
    }

    class UserSubscription {
        -email: string
        -subscriptionPlanId: string
        -subscriptionEndDate: Date
        +getDaysLeft(): number
        +isActive(): boolean
        +getStatus(): string
        +extendSubscription(days: number): void
        +extendByMonth(): void
        +extendByYear(): void
    }

    class Transaction {
        -id: string
        -amount: number
        -email: string
        -subscriptionPlanId: string
        +getInfo(): string
        +isValidAmount(): boolean
        +getAmountInUSD(): number
        +getAmountInEUR(): number
    }

    %% Абстракція бази даних
    class DatabaseService~T~ {
        <<abstract>>
        +findAll(): Promise~T[]~
        +findById(id: string): Promise~T | null~
        +create(data: Omit~T, 'id'~): Promise~T~
        +update(id: string, data: Partial~T~): Promise~T | null~
        +delete(id: string): Promise~boolean~
        +findBy(criteria: Partial~T~): Promise~T[]~
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
        +findBy(criteria: Partial~T~): Promise~T[]~
    }

    %% Фабрика (Singleton)
    class DatabaseFactory {
        -static instance: DatabaseFactory
        -constructor()
        +static getInstance(): DatabaseFactory
        -createJSONService~T~(fileName: string): DatabaseService~T~
        +createService~T~(fileName: string): DatabaseService~T~
    }

    %% Сервіси
    class UserService {
        -userRepository: DatabaseService~UserData~
        -paymentSimulationService?: PaymentSimulationService
        +createUser(name: string, email: string): Promise~User~
        +getUserById(id: string): Promise~User | null~
        +getUserByEmail(email: string): Promise~User | null~
        +getAllUsers(): Promise~User[]~
        +getAllUsersWithSubscriptions(): Promise~any[]~
        +updateUser(id: string, name?: string, email?: string): Promise~User | null~
        +deleteUser(id: string): Promise~boolean~
    }

    class SubscriptionPlanService {
        -planRepository: DatabaseService~SubscriptionPlanData~
        +createPlan(name: string, price: number, period: 'monthly' | 'yearly'): Promise~SubscriptionPlan~
        +getPlanById(id: string): Promise~SubscriptionPlan | null~
        +getAllPlans(): Promise~SubscriptionPlan[]~
        +updatePlan(id: string, name?: string, price?: number, period?: 'monthly' | 'yearly'): Promise~SubscriptionPlan | null~
        +deletePlan(id: string): Promise~boolean~
        +getPlansByPeriod(period: 'monthly' | 'yearly'): Promise~SubscriptionPlan[]~
    }

    class SubscriptionService {
        -subscriptionRepository: any
        -planRepository: any
        +createSubscription(subscriptionData: CreateSubscriptionData): Promise~Subscription~
        +getSubscriptionById(id: string): Promise~Subscription | null~
        +getUserSubscriptions(userId: string): Promise~Subscription[]~
        +getActiveUserSubscription(userId: string): Promise~Subscription | null~
        +updateSubscription(id: string, updateData: UpdateSubscriptionData): Promise~Subscription | null~
        +cancelSubscription(id: string): Promise~Subscription | null~
        +activateSubscription(id: string): Promise~Subscription | null~
        +markPaymentFailed(id: string): Promise~Subscription | null~
        +renewSubscription(id: string, months: number): Promise~Subscription | null~
        +isSubscriptionActive(id: string): Promise~boolean~
        +getAllSubscriptions(): Promise~Subscription[]~
        +deleteSubscription(id: string): Promise~boolean~
        +getSubscriptionsByPlan(planId: string): Promise~Subscription[]~
        +getActiveSubscriptionsByPlan(planId: string): Promise~Subscription[]~
        +getSubscriptionWithPlan(id: string): Promise~(Subscription & { plan: any }) | null~
        +getUserSubscriptionsWithPlans(userId: string): Promise~(Subscription & { plan: any })[]~
    }

    class PaymentSimulationService {
        -userRepository: DatabaseService~UserData~
        -subscriptionRepository: DatabaseService~UserSubscriptionData~
        -transactionRepository: DatabaseService~TransactionData~
        -planRepository: DatabaseService~SubscriptionPlanData~
        +simulatePayment(userEmail: string, subscriptionPlanId: string, amount: number): Promise~{ userSubscription: UserSubscription; transaction: Transaction }~
        +getUserSubscriptions(userEmail: string): Promise~UserSubscription[]~
        +getUserSubscriptionsAsSubscriptions(userEmail: string): Promise~any[]~
        +getUserTransactions(userEmail: string): Promise~Transaction[]~
        +getAllSubscriptionsAsSubscriptions(): Promise~any[]~
        +getTransactionStats(): Promise~{ totalTransactions: number; totalAmount: number; averageAmount: number }~
    }

    %% Відносини наслідування
    JSONDataBaseService --|> DatabaseService : extends

    %% Відносини композиції та агрегації
    UserService --> DatabaseService : uses
    UserService --> PaymentSimulationService : uses
    UserService --> User : creates/returns

    SubscriptionPlanService --> DatabaseService : uses
    SubscriptionPlanService --> SubscriptionPlan : creates/returns

    SubscriptionService --> DatabaseService : uses
    SubscriptionService --> Subscription : creates/returns

    PaymentSimulationService --> DatabaseService : uses
    PaymentSimulationService --> UserSubscription : creates/returns
    PaymentSimulationService --> Transaction : creates/returns
    PaymentSimulationService --> SubscriptionPlan : uses

    DatabaseFactory --> DatabaseService : creates
    DatabaseFactory --> JSONDataBaseService : creates

    %% Відносини між моделями
    User --> UserSubscription : has
    UserSubscription --> SubscriptionPlan : references
    Transaction --> SubscriptionPlan : references
    Transaction --> User : references (by email)
```

## Діаграма взаємодії компонентів

```mermaid
graph TB
    %% Зовнішній шар (API)
    API[API Routes] --> UserService
    API --> SubscriptionPlanService
    API --> SubscriptionService
    API --> PaymentSimulationService

    %% Сервісний шар
    UserService --> DatabaseFactory
    SubscriptionPlanService --> DatabaseFactory
    SubscriptionService --> DatabaseFactory
    PaymentSimulationService --> DatabaseFactory

    %% Фабрика бази даних (Singleton)
    DatabaseFactory --> JSONDataBaseService1[Users JSON DB]
    DatabaseFactory --> JSONDataBaseService2[Plans JSON DB]
    DatabaseFactory --> JSONDataBaseService3[Subscriptions JSON DB]
    DatabaseFactory --> JSONDataBaseService4[Transactions JSON DB]

    %% Моделі даних
    UserService --> User[User Model]
    SubscriptionPlanService --> SubscriptionPlan[SubscriptionPlan Model]
    PaymentSimulationService --> UserSubscription[UserSubscription Model]
    PaymentSimulationService --> Transaction[Transaction Model]

    %% JSON файли
    JSONDataBaseService1 --> JSON1[users.json]
    JSONDataBaseService2 --> JSON2[subscription_plans.json]
    JSONDataBaseService3 --> JSON3[user_subscriptions.json]
    JSONDataBaseService4 --> JSON4[transactions.json]

    %% Взаємодії між сервісами
    UserService -.-> PaymentSimulationService : optional dependency
    PaymentSimulationService --> SubscriptionPlan : uses for validation
```

## Архітектурні патерни

### 1. **Singleton Pattern** - DatabaseFactory

- Забезпечує єдиний екземпляр фабрики для створення сервісів БД
- Контролює створення всіх репозиторіїв

### 2. **Factory Pattern** - DatabaseFactory

- Створює відповідні реалізації DatabaseService
- Абстрагує процес створення об'єктів БД

### 3. **Repository Pattern** - DatabaseService/JSONDataBaseService

- Абстрагує доступ до даних
- Забезпечує уніфікований інтерфейс для роботи з БД

### 4. **Service Layer Pattern**

- UserService, SubscriptionPlanService, SubscriptionService, PaymentSimulationService
- Інкапсулює бізнес-логіку
- Координує роботу між репозиторіями та моделями

### 5. **Domain Model Pattern**

- User, SubscriptionPlan, UserSubscription, Transaction
- Інкапсулює бізнес-логіку та правила домену

## Основні потоки взаємодії

### 1. **Створення користувача**

```
API → UserService → DatabaseFactory → JSONDataBaseService → users.json
```

### 2. **Симуляція оплати**

```
API → PaymentSimulationService → DatabaseFactory → Multiple JSONDataBaseServices
```

### 3. **Управління підписками**

```
API → SubscriptionService → DatabaseFactory → JSONDataBaseService → user_subscriptions.json
```

### 4. **Управління планами**

```
API → SubscriptionPlanService → DatabaseFactory → JSONDataBaseService → subscription_plans.json
```

## Переваги архітектури

1. **Розділення відповідальності** - кожен клас має чітко визначену роль
2. **Легкість тестування** - можна легко мокати залежності
3. **Гнучкість** - легко замінити JSON БД на іншу реалізацію
4. **Масштабованість** - можна додавати нові сервіси без зміни існуючого коду
5. **Повторне використання** - DatabaseFactory може створювати сервіси для різних типів даних
