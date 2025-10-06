/**
 * Клас UserSubscription - містить email користувача, subscriptionPlanId, subscriptionEndDate, getDaysLeft, isActive
 */
export class UserSubscription {
    constructor(
        public email: string,
        public subscriptionPlanId: string,
        public subscriptionEndDate: Date
    ) { }

    /**
     * Отримати кількість днів до закінчення підписки
     */
    getDaysLeft(): number {
        const now = new Date();
        const timeDiff = this.subscriptionEndDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return Math.max(0, daysLeft);
    }

    /**
     * Перевірити чи підписка активна
     */
    isActive(): boolean {
        const now = new Date();
        return this.subscriptionEndDate > now;
    }

    /**
     * Отримати статус підписки
     */
    getStatus(): string {
        if (this.isActive()) {
            const daysLeft = this.getDaysLeft();
            return `Активна (залишилось ${daysLeft} днів)`;
        } else {
            return 'Неактивна';
        }
    }

    /**
     * Продовжити підписку на вказану кількість днів
     */
    extendSubscription(days: number): void {
        this.subscriptionEndDate = new Date(this.subscriptionEndDate.getTime() + (days * 24 * 60 * 60 * 1000));
    }

    /**
     * Продовжити підписку на місяць
     */
    extendByMonth(): void {
        this.subscriptionEndDate = new Date(this.subscriptionEndDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    }

    /**
     * Продовжити підписку на рік
     */
    extendByYear(): void {
        this.subscriptionEndDate = new Date(this.subscriptionEndDate.getTime() + (365 * 24 * 60 * 60 * 1000));
    }
}
