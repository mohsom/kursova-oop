
/**
 * Інтерфейс плану підписки
 */
export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    billingInterval: 'monthly' | 'yearly';
    features: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Дані для створення плану підписки
 */
export interface CreateSubscriptionPlanData {
    name: string;
    description: string;
    price: number;
    billingInterval: 'monthly' | 'yearly';
    features: string[];
}

/**
 * Дані для оновлення плану підписки
 */
export interface UpdateSubscriptionPlanData {
    name?: string;
    description?: string;
    price?: number;
    billingInterval?: 'monthly' | 'yearly';
    features?: string[];
}

/**
 * Клас для роботи з планами підписок
 */
export class SubscriptionPlanService {
    constructor(private planRepository: any) { }

    /**
     * Створити новий план підписки
     */
    async createPlan(planData: CreateSubscriptionPlanData): Promise<SubscriptionPlan> {
        const now = new Date();
        const plan: Omit<SubscriptionPlan, 'id'> = {
            name: planData.name,
            description: planData.description,
            price: planData.price,
            billingInterval: planData.billingInterval,
            features: planData.features,
            createdAt: now,
            updatedAt: now
        };

        return await this.planRepository.create(plan);
    }

    /**
     * Отримати план за ID
     */
    async getPlanById(id: string): Promise<SubscriptionPlan | null> {
        return await this.planRepository.findById(id);
    }

    /**
     * Отримати всі плани
     */
    async getAllPlans(): Promise<SubscriptionPlan[]> {
        return await this.planRepository.findAll();
    }



    /**
     * Оновити план
     */
    async updatePlan(id: string, updateData: UpdateSubscriptionPlanData): Promise<SubscriptionPlan | null> {
        const updateDataWithTimestamp = {
            ...updateData,
            updatedAt: new Date()
        };
        return await this.planRepository.update(id, updateDataWithTimestamp);
    }


    /**
     * Видалити план
     */
    async deletePlan(id: string): Promise<boolean> {
        return await this.planRepository.delete(id);
    }


    /**
     * Отримати план за назвою
     */
    async getPlanByName(name: string): Promise<SubscriptionPlan | null> {
        const plans = await this.planRepository.findBy({ name });
        return plans.length > 0 ? plans[0] : null;
    }
}
