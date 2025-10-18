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

    async getUserSubscriptionsAsSubscription(email: string): Promise<UserSubscription> {
        const [subData] = await this.subscriptionRepository.findBy({ email });

        return new UserSubscription(
            subData.email,
            subData.planId,
            new Date(subData.subscriptionEndDate)
        );
    }
}
