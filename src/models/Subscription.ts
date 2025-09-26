/**
 * Статуси підписки
 */
export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
    PENDING = 'pending',
    PAYMENT_FAILED = 'payment_failed'
}

/**
 * Типи підписки
 */
export enum SubscriptionType {
    BASIC = 'basic',
    PREMIUM = 'premium',
    ENTERPRISE = 'enterprise'
}

/**
 * Інтерфейс підписки
 */
export interface Subscription {
    id: string;
    userId: string;
    type: SubscriptionType;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    paymentMethod?: string;
    autoRenew: boolean;
}

/**
 * Дані для створення підписки
 */
export interface CreateSubscriptionData {
    userId: string;
    type: SubscriptionType;
    price: number;
    durationMonths: number;
    paymentMethod?: string;
    autoRenew?: boolean;
}

/**
 * Дані для оновлення підписки
 */
export interface UpdateSubscriptionData {
    type?: SubscriptionType;
    status?: SubscriptionStatus;
    endDate?: Date;
    price?: number;
    paymentMethod?: string;
    autoRenew?: boolean;
}

/**
 * Клас для роботи з підписками
 */
export class SubscriptionService {
    constructor(private subscriptionRepository: any) { }

    /**
     * Створити нову підписку
     */
    async createSubscription(subscriptionData: CreateSubscriptionData): Promise<Subscription> {
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + subscriptionData.durationMonths);

        const subscription: Omit<Subscription, 'id'> = {
            userId: subscriptionData.userId,
            type: subscriptionData.type,
            status: SubscriptionStatus.PENDING,
            startDate: now,
            endDate: endDate,
            price: subscriptionData.price,
            createdAt: now,
            updatedAt: now,
            paymentMethod: subscriptionData.paymentMethod,
            autoRenew: subscriptionData.autoRenew ?? true
        };

        return await this.subscriptionRepository.create(subscription);
    }

    /**
     * Отримати підписку за ID
     */
    async getSubscriptionById(id: string): Promise<Subscription | null> {
        return await this.subscriptionRepository.findById(id);
    }

    /**
     * Отримати підписки користувача
     */
    async getUserSubscriptions(userId: string): Promise<Subscription[]> {
        return await this.subscriptionRepository.findBy({ userId });
    }

    /**
     * Отримати активну підписку користувача
     */
    async getActiveUserSubscription(userId: string): Promise<Subscription | null> {
        const subscriptions = await this.subscriptionRepository.findBy({
            userId,
            status: SubscriptionStatus.ACTIVE
        });
        return subscriptions.length > 0 ? subscriptions[0] : null;
    }

    /**
     * Оновити підписку
     */
    async updateSubscription(id: string, updateData: UpdateSubscriptionData): Promise<Subscription | null> {
        const updateDataWithTimestamp = {
            ...updateData,
            updatedAt: new Date()
        };
        return await this.subscriptionRepository.update(id, updateDataWithTimestamp);
    }

    /**
     * Скасувати підписку
     */
    async cancelSubscription(id: string): Promise<Subscription | null> {
        return await this.updateSubscription(id, {
            status: SubscriptionStatus.CANCELLED
        });
    }

    /**
     * Активувати підписку (після успішної оплати)
     */
    async activateSubscription(id: string): Promise<Subscription | null> {
        return await this.updateSubscription(id, {
            status: SubscriptionStatus.ACTIVE
        });
    }

    /**
     * Позначити підписку як невдалу оплату
     */
    async markPaymentFailed(id: string): Promise<Subscription | null> {
        return await this.updateSubscription(id, {
            status: SubscriptionStatus.PAYMENT_FAILED
        });
    }

    /**
     * Продовжити підписку
     */
    async renewSubscription(id: string, months: number): Promise<Subscription | null> {
        const subscription = await this.getSubscriptionById(id);
        if (!subscription) {
            return null;
        }

        const newEndDate = new Date(subscription.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + months);

        return await this.updateSubscription(id, {
            endDate: newEndDate,
            status: SubscriptionStatus.ACTIVE
        });
    }

    /**
     * Перевірити чи підписка активна
     */
    async isSubscriptionActive(id: string): Promise<boolean> {
        const subscription = await this.getSubscriptionById(id);
        if (!subscription) {
            return false;
        }

        const now = new Date();
        return subscription.status === SubscriptionStatus.ACTIVE &&
            subscription.endDate > now;
    }

    /**
     * Отримати всі підписки
     */
    async getAllSubscriptions(): Promise<Subscription[]> {
        return await this.subscriptionRepository.findAll();
    }

    /**
     * Видалити підписку
     */
    async deleteSubscription(id: string): Promise<boolean> {
        return await this.subscriptionRepository.delete(id);
    }
}
