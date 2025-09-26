import * as fs from 'fs';
import * as path from 'path';
import { DatabaseInterface } from './DatabaseInterface';

/**
 * Реалізація доступу до бази даних через JSON файл
 */
export class JsonDatabase<T extends { id: string }> extends DatabaseInterface<T> {
    private filePath: string;
    private data: T[] = [];

    constructor(fileName: string) {
        super();
        this.filePath = path.join(process.cwd(), 'data', `${fileName}.json`);
        this.ensureDataDirectory();
        this.loadData();
    }

    /**
     * Створити директорію для даних, якщо вона не існує
     */
    private ensureDataDirectory(): void {
        const dataDir = path.dirname(this.filePath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    /**
     * Завантажити дані з JSON файлу
     */
    private loadData(): void {
        try {
            if (fs.existsSync(this.filePath)) {
                const fileContent = fs.readFileSync(this.filePath, 'utf-8');
                this.data = JSON.parse(fileContent);
            } else {
                this.data = [];
                this.saveData();
            }
        } catch (error) {
            console.error(`Помилка завантаження даних з ${this.filePath}:`, error);
            this.data = [];
        }
    }

    /**
     * Зберегти дані в JSON файл
     */
    private saveData(): void {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error(`Помилка збереження даних в ${this.filePath}:`, error);
        }
    }

    /**
     * Генерувати унікальний ID
     */
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async findAll(): Promise<T[]> {
        return [...this.data];
    }

    async findById(id: string): Promise<T | null> {
        return this.data.find(item => item.id === id) || null;
    }

    async create(data: Omit<T, 'id'>): Promise<T> {
        const newItem = { ...data, id: this.generateId() } as T;
        this.data.push(newItem);
        this.saveData();
        return newItem;
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) {
            return null;
        }

        this.data[index] = { ...this.data[index], ...data };
        this.saveData();
        return this.data[index];
    }

    async delete(id: string): Promise<boolean> {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) {
            return false;
        }

        this.data.splice(index, 1);
        this.saveData();
        return true;
    }

    async findBy(criteria: Partial<T>): Promise<T[]> {
        return this.data.filter(item => {
            return Object.keys(criteria).every(key => {
                return item[key as keyof T] === criteria[key as keyof T];
            });
        });
    }
}
