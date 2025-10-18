import { DatabaseService } from '../database/DatabaseInterface';
import { UserSubscription } from '../models/UserSubscription';
import { Transaction } from '../models/Transaction';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { SubscriptionPlanData, UserSubscriptionData, TransactionData } from '../types/DatabaseTypes';

/**
 * Сервіс для симуляції оплати
 */
export class PaymentSimulationService {
    constructor(
        private subscriptionRepository: DatabaseService<UserSubscriptionData>,
        private transactionRepository: DatabaseService<TransactionData>,
        private planRepository: DatabaseService<SubscriptionPlanData>
    ) { }

    /**
     * Симуляція оплати - створює UserSubscription та Transaction
     */
    async simulatePayment(
        userEmail: string,
        subscriptionPlanId: string,
        amount: number
    ): Promise<{ userSubscription: UserSubscription; transaction: Transaction }> {
        // Отримуємо план підписки
        const planData = await this.planRepository.findById(subscriptionPlanId);
        if (!planData) {
            throw new Error('План підписки не знайдений');
        }

        const plan = new SubscriptionPlan(planData.id, planData.name, planData.price, planData.period);

        // Розраховуємо дату закінчення підписки
        const subscriptionEndDate = new Date();
        if (plan.isMonthly()) {
            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        } else {
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        }

        // Створюємо підписку користувача
        const userSubscription = new UserSubscription(
            userEmail,
            subscriptionPlanId,
            subscriptionEndDate
        );

        // Зберігаємо підписку в базі даних
        await this.subscriptionRepository.create({
            email: userSubscription.email,
            planId: userSubscription.subscriptionPlanId,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: userSubscription.subscriptionEndDate.toISOString(),
            subscriptionEndDate: userSubscription.subscriptionEndDate.toISOString(),
            price: plan.price,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            autoRenew: false,
            billingInterval: plan.period
        });

        // Створюємо транзакцію
        const transaction = new Transaction(
            this.generateId(),
            amount,
            userEmail,
            subscriptionPlanId
        );

        // Зберігаємо транзакцію в базі даних
        await this.transactionRepository.create({
            amount: transaction.amount,
            email: transaction.email,
            subscriptionPlanId: transaction.subscriptionPlanId
        });

        return { userSubscription, transaction };
    }


    /**
     * Отримати всі транзакції користувача
     */
    async getUserTransactions(userEmail: string): Promise<Transaction[]> {
        const transactionsData = await this.transactionRepository.findBy({ email: userEmail });
        return transactionsData.map(transData => new Transaction(
            transData.id,
            transData.amount,
            transData.email,
            transData.subscriptionPlanId
        ));
    }


    /**
     * Отримати статистику транзакцій
     */
    async getTransactionStats(): Promise<{
        totalTransactions: number;
        totalAmount: number;
        averageAmount: number;
    }> {
        const transactionsData = await this.transactionRepository.findAll();

        const totalTransactions = transactionsData.length;
        const totalAmount = transactionsData.reduce((sum: number, trans: { amount: number }) => sum + trans.amount, 0);
        const averageAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

        return {
            totalTransactions,
            totalAmount,
            averageAmount
        };
    }

    /**
     * Генерувати унікальний ID
     */
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
