import { DatabaseService } from '../database/DatabaseInterface';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { SubscriptionPlanData } from '../types/DatabaseTypes';

/**
 * Сервіс для роботи з планами підписки
 */
export class SubscriptionPlanService {
    constructor(private planRepository: DatabaseService<SubscriptionPlanData>) { }

    /**
     * Створити план підписки
     */
    async createPlan(name: string, price: number, period: 'monthly' | 'yearly'): Promise<SubscriptionPlan> {
        const id = this.generateId();
        const plan = new SubscriptionPlan(id, name, price, period);

        // Зберігаємо план в базі даних
        await this.planRepository.create({
            name: plan.name,
            price: plan.price,
            period: plan.period
        });

        return plan;
    }

    /**
     * Отримати план за ID
     */
    async getPlanById(id: string): Promise<SubscriptionPlan | null> {
        const planData = await this.planRepository.findById(id);
        if (!planData) return null;

        return new SubscriptionPlan(planData.id, planData.name, planData.price, planData.period);
    }

    /**
     * Отримати всі плани
     */
    async getAllPlans(): Promise<SubscriptionPlan[]> {
        const plansData = await this.planRepository.findAll();
        return plansData.map(planData => new SubscriptionPlan(planData.id, planData.name, planData.price, planData.period));
    }

    /**
     * Оновити план
     */
    async updatePlan(id: string, name?: string, price?: number, period?: 'monthly' | 'yearly'): Promise<SubscriptionPlan | null> {
        const updateData: { name?: string; price?: number; period?: 'monthly' | 'yearly' } = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = price;
        if (period !== undefined) updateData.period = period;

        const updatedPlan = await this.planRepository.update(id, updateData);
        if (!updatedPlan) return null;

        return new SubscriptionPlan(updatedPlan.id, updatedPlan.name, updatedPlan.price, updatedPlan.period);
    }

    /**
     * Видалити план
     */
    async deletePlan(id: string): Promise<boolean> {
        return await this.planRepository.delete(id);
    }

    /**
     * Отримати плани за періодом
     */
    async getPlansByPeriod(period: 'monthly' | 'yearly'): Promise<SubscriptionPlan[]> {
        const plansData = await this.planRepository.findBy({ period });
        return plansData.map(planData => new SubscriptionPlan(planData.id, planData.name, planData.price, planData.period));
    }

    /**
     * Генерувати унікальний ID
     */
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
