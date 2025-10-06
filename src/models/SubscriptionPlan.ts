
/**
 * Клас SubscriptionPlan - містить інформацію про назву, ціну та період (рік/місяць)
 */
export class SubscriptionPlan {
    constructor(
        public id: string,
        public name: string,
        public price: number,
        public period: 'monthly' | 'yearly'
    ) { }

    /**
     * Отримати ціну за місяць
     */
    getMonthlyPrice(): number {
        return this.period === 'monthly' ? this.price : this.price / 12;
    }

    /**
     * Отримати ціну за рік
     */
    getYearlyPrice(): number {
        return this.period === 'yearly' ? this.price : this.price * 12;
    }

    /**
     * Перевірити чи план є щомісячним
     */
    isMonthly(): boolean {
        return this.period === 'monthly';
    }

    /**
     * Перевірити чи план є річним
     */
    isYearly(): boolean {
        return this.period === 'yearly';
    }
}
