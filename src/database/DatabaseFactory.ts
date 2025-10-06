import { DatabaseService } from './DatabaseInterface';
import { JSONDataBaseService } from './JsonDatabase';

/**
 * Фабрика для створення сервісів бази даних
 */
export class DatabaseFactory {
    private static instance: DatabaseFactory;

    private constructor() { }

    public static getInstance(): DatabaseFactory {
        if (!DatabaseFactory.instance) {
            DatabaseFactory.instance = new DatabaseFactory();
        }
        return DatabaseFactory.instance;
    }

    private createJSONService<T extends { id: string }>(fileName: string): DatabaseService<T> {
        return new JSONDataBaseService<T>(fileName);
    }

    public createService<T extends { id: string }>(fileName: string): DatabaseService<T> {
        return this.createJSONService<T>(fileName);
    }
}

export const databaseFactory = DatabaseFactory.getInstance();
