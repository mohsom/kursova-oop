import { UserSubscription } from './UserSubscription';

/**
 * Клас User - містить інформацію про ім'я, пошту та посилання на UserSubscription
 */
export class User {
  private userSubscription?: UserSubscription;

  constructor(
    public id: string,
    public name: string,
    public email: string
  ) { }

  /**
   * Встановити підписку користувача
   */
  setSubscription(subscription: UserSubscription): void {
    this.userSubscription = subscription;
  }

  /**
   * Отримати підписку користувача
   */
  getSubscription(): UserSubscription | undefined {
    return this.userSubscription;
  }

  /**
   * Перевірити чи має користувач активну підписку
   */
  hasActiveSubscription(): boolean {
    return this.userSubscription?.isActive() ?? false;
  }

  /**
   * Отримати інформацію про підписку
   */
  getSubscriptionInfo(): string {
    if (!this.userSubscription) {
      return 'Немає підписки';
    }

    if (!this.userSubscription.isActive()) {
      return 'Підписка неактивна';
    }

    const daysLeft = this.userSubscription.getDaysLeft();
    return `Активна підписка, залишилось днів: ${daysLeft}`;
  }
}
