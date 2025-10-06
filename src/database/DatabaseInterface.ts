/**
 * Абстрактний клас для роботи з базою даних
 * Визначає базовий інтерфейс для роботи з даними
 */
export abstract class DatabaseService<T> {
  /**
   * Отримати всі записи
   */
  abstract findAll(): Promise<T[]>;

  /**
   * Знайти запис за ID
   * @param id - унікальний ідентифікатор
   */
  abstract findById(id: string): Promise<T | null>;

  /**
   * Створити новий запис
   * @param data - дані для створення
   */
  abstract create(data: Omit<T, 'id'>): Promise<T>;

  /**
   * Оновити існуючий запис
   * @param id - унікальний ідентифікатор
   * @param data - дані для оновлення
   */
  abstract update(id: string, data: Partial<T>): Promise<T | null>;

  /**
   * Видалити запис
   * @param id - унікальний ідентифікатор
   */
  abstract delete(id: string): Promise<boolean>;

  /**
   * Знайти записи за критеріями
   * @param criteria - критерії пошуку
   */
  abstract findBy(criteria: Partial<T>): Promise<T[]>;
}
