import { DatabaseService } from '../database/DatabaseInterface';
import { User } from '../models/User';
import { UserData } from '../types/DatabaseTypes';

/**
 * Сервіс для роботи з користувачами
 */
export class UserService {
    constructor(private userRepository: DatabaseService<UserData>) { }

    /**
     * Створити користувача
     */
    async createUser(name: string, email: string): Promise<User> {
        const id = this.generateId();
        const user = new User(id, name, email);

        // Зберігаємо користувача в базі даних
        await this.userRepository.create({
            name: user.name,
            email: user.email
        });

        return user;
    }

    /**
     * Отримати користувача за ID
     */
    async getUserById(id: string): Promise<User | null> {
        const userData = await this.userRepository.findById(id);
        if (!userData) return null;

        return new User(userData.id, userData.name, userData.email);
    }

    /**
     * Отримати користувача за email
     */
    async getUserByEmail(email: string): Promise<User | null> {
        const users = await this.userRepository.findBy({ email });
        if (users.length === 0) return null;

        const userData = users[0];
        return new User(userData.id, userData.name, userData.email);
    }

    /**
     * Отримати всіх користувачів
     */
    async getAllUsers(): Promise<User[]> {
        const usersData = await this.userRepository.findAll();
        return usersData.map(userData => new User(userData.id, userData.name, userData.email));
    }

    /**
     * Оновити користувача
     */
    async updateUser(id: string, name?: string, email?: string): Promise<User | null> {
        const updateData: { name?: string; email?: string } = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;

        const updatedUser = await this.userRepository.update(id, updateData);
        if (!updatedUser) return null;

        return new User(updatedUser.id, updatedUser.name, updatedUser.email);
    }

    /**
     * Видалити користувача
     */
    async deleteUser(id: string): Promise<boolean> {
        return await this.userRepository.delete(id);
    }

    /**
     * Генерувати унікальний ID
     */
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
