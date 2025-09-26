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
 * Інтерфейс підписки
 */
export interface Subscription {
    id: string;
    userId: string;
    planId: string; // Зв'язок з планом підписки
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    subscriptionEndDate: Date; // Дата закінчення підписки (може відрізнятися від endDate)
    price: number; // Ціна на момент створення підписки
    createdAt: Date;
    updatedAt: Date;
    paymentMethod?: string;
    autoRenew: boolean;
    billingInterval: 'monthly' | 'yearly';
}

/**
 * Дані для створення підписки
 */
export interface CreateSubscriptionData {
    userId: string;
    planId: string; // ID плану підписки
    paymentMethod?: string;
    autoRenew?: boolean;
}

/**
 * Дані для оновлення підписки
 */
export interface UpdateSubscriptionData {
    status?: SubscriptionStatus;
    endDate?: Date;
    subscriptionEndDate?: Date;
    paymentMethod?: string;
    autoRenew?: boolean;
}

/**
 * Клас для роботи з підписками
 */
export class SubscriptionService {
    constructor(
        private subscriptionRepository: any,
        private planRepository: any
    ) { }

    /**
     * Створити нову підписку
     */
    async createSubscription(subscriptionData: CreateSubscriptionData): Promise<Subscription> {
        // Отримуємо план підписки
        const plan = await this.planRepository.findById(subscriptionData.planId);
        if (!plan) {
            throw new Error('План підписки не знайдений');
        }

        if (!plan.isActive) {
            throw new Error('План підписки неактивний');
        }

        const now = new Date();
        const endDate = new Date();

        // Встановлюємо дату закінчення залежно від інтервалу оплати
        if (plan.billingInterval === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const subscription: Omit<Subscription, 'id'> = {
            userId: subscriptionData.userId,
            planId: subscriptionData.planId,
            status: SubscriptionStatus.PENDING,
            startDate: now,
            endDate: endDate,
            subscriptionEndDate: endDate, // Спочатку subscriptionEndDate = endDate
            price: plan.price,
            createdAt: now,
            updatedAt: now,
            paymentMethod: subscriptionData.paymentMethod,
            autoRenew: subscriptionData.autoRenew ?? true,
            billingInterval: plan.billingInterval
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
            subscription.subscriptionEndDate > now;
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

    /**
     * Отримати підписки за планом
     */
    async getSubscriptionsByPlan(planId: string): Promise<Subscription[]> {
        return await this.subscriptionRepository.findBy({ planId });
    }

    /**
     * Отримати активні підписки за планом
     */
    async getActiveSubscriptionsByPlan(planId: string): Promise<Subscription[]> {
        return await this.subscriptionRepository.findBy({
            planId,
            status: SubscriptionStatus.ACTIVE
        });
    }

    /**
     * Отримати підписку з інформацією про план
     */
    async getSubscriptionWithPlan(id: string): Promise<(Subscription & { plan: any }) | null> {
        const subscription = await this.getSubscriptionById(id);
        if (!subscription) {
            return null;
        }

        const plan = await this.planRepository.findById(subscription.planId);
        return { ...subscription, plan };
    }

    /**
     * Отримати всі підписки користувача з інформацією про плани
     */
    async getUserSubscriptionsWithPlans(userId: string): Promise<(Subscription & { plan: any })[]> {
        const subscriptions = await this.getUserSubscriptions(userId);
        const subscriptionsWithPlans = [];

        for (const subscription of subscriptions) {
            const plan = await this.planRepository.findById(subscription.planId);
            subscriptionsWithPlans.push({ ...subscription, plan });
        }

        return subscriptionsWithPlans;
    }
}
