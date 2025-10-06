import { DatabaseService } from './DatabaseInterface';
import { JSONDataBaseService } from './JsonDatabase';

/**
 * Фабрика для створення сервісів бази даних
 */
export class DatabaseFactory {
    /**
     * Створити JSONDataBaseService для роботи з JSON файлами
     * @param fileName - назва файлу без розширення
     * @returns JSONDataBaseService
     */
    static createJSONService<T extends { id: string }>(fileName: string): DatabaseService<T> {
        return new JSONDataBaseService<T>(fileName);
    }
}
