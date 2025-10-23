/**
 * Клас Transaction - містить amount, email, subscriptionPlanId
 */
export class Transaction {
  constructor(
    public id: string,
    // remove
    public amount: number,
    public email: string,
    public subscriptionPlanId: string,
    public date: string
  ) { }

  /**
   * Отримати інформацію про транзакцію
   */
  getInfo(): string {
    return `Транзакція ${this.id}: ${this.amount} грн для ${this.email} (план: ${this.subscriptionPlanId})`;
  }

  /**
   * Перевірити чи сума є позитивною
   */
  isValidAmount(): boolean {
    return this.amount > 0;
  }

  /**
   * Отримати суму в доларах (припускаємо курс 1 USD = 40 UAH)
   */
  getAmountInUSD(): number {
    return this.amount / 40;
  }

  /**
   * Отримати суму в євро (припускаємо курс 1 EUR = 45 UAH)
   */
  getAmountInEUR(): number {
    return this.amount / 45;
  }
}


