import { DatabaseService } from '../database/DatabaseInterface';
import { UserSubscription } from '../models/UserSubscription';
import { UserSubscriptionData } from '../types/DatabaseTypes';

/**
 * Сервіс для роботи з підписками користувачів
 */
export class UserSubscriptionService {
    constructor(
        private subscriptionRepository: DatabaseService<UserSubscriptionData>,
    ) { }

    async getUserSubscriptionsAsSubscription(email: string): Promise<UserSubscription | null> {
        const subscriptions = await this.subscriptionRepository.findBy({ email });

        if (subscriptions.length === 0) {
            return null;
        }

        const subData = subscriptions[0];
        return new UserSubscription(
            subData.email,
            subData.subscriptionPlanId,
            new Date(subData.subscriptionEndDate)
        );
    }
}
