import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersPage from './UsersPage';
import { usersApi } from '../services/api';
import type { User } from '../types';

// Mock API
jest.mock('../services/api', () => ({
  usersApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>;

describe('UsersPage', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Іван Петренко',
      email: 'ivan@example.com',
      subscription: {
        planName: 'Basic Plan',
        subscriptionEndDate: '2025-12-31',
      },
    },
    {
      id: '2',
      name: 'Марія Коваль',
      email: 'maria@example.com',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsersApi.getAll.mockResolvedValue(mockUsers);
  });

  describe('Рендеринг', () => {
    it('повинен показувати індикатор завантаження спочатку', () => {
      mockUsersApi.getAll.mockImplementation(
        () => new Promise(() => {}) // Promise, що не резолвиться
      );

      render(<UsersPage />);

      expect(screen.getByText('Завантаження...')).toBeInTheDocument();
    });

    it('повинен відобразити заголовок сторінки', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Користувачі')).toBeInTheDocument();
      });
    });

    it('повинен відобразити кнопку "Додати користувача"', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Додати користувача')).toBeInTheDocument();
      });
    });

    it('повинен відобразити таблицю з користувачами', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Іван Петренко')).toBeInTheDocument();
        expect(screen.getByText('ivan@example.com')).toBeInTheDocument();
        expect(screen.getByText('Марія Коваль')).toBeInTheDocument();
        expect(screen.getByText('maria@example.com')).toBeInTheDocument();
      });
    });

    it('повинен відобразити статус підписки "Активна" для користувача з підпискою', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Активна')).toBeInTheDocument();
      });
    });

    it('повинен відобразити "Без підписки" для користувача без підписки', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Без підписки')).toBeInTheDocument();
      });
    });
  });

  describe('Створення користувача', () => {
    it('повинен відкрити діалог при натисканні "Додати користувача"', async () => {
      const user = userEvent.setup();
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Додати користувача')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Додати користувача');
      await user.click(addButton);

      expect(screen.getByText('Додати нового користувача')).toBeInTheDocument();
    });

    it('повинен створити нового користувача', async () => {
      const user = userEvent.setup();
      const newUser = {
        id: '3',
        name: 'Петро Сидоренко',
        email: 'petro@example.com',
      };

      mockUsersApi.create.mockResolvedValue(newUser);
      mockUsersApi.getAll.mockResolvedValueOnce(mockUsers).mockResolvedValueOnce([...mockUsers, newUser]);

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Додати користувача')).toBeInTheDocument();
      });

      // Відкрити діалог
      const addButton = screen.getByText('Додати користувача');
      await user.click(addButton);

      // Заповнити форму
      const nameInput = screen.getByLabelText("Ім'я");
      const emailInput = screen.getByLabelText('Email');

      await user.type(nameInput, 'Петро Сидоренко');
      await user.type(emailInput, 'petro@example.com');

      // Зберегти
      const createButton = screen.getByText('Створити');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockUsersApi.create).toHaveBeenCalledWith({
          name: 'Петро Сидоренко',
          email: 'petro@example.com',
        });
      });
    });

    it('повинен закрити діалог при натисканні "Скасувати"', async () => {
      const user = userEvent.setup();
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Додати користувача')).toBeInTheDocument();
      });

      // Відкрити діалог
      const addButton = screen.getByText('Додати користувача');
      await user.click(addButton);

      expect(screen.getByText('Додати нового користувача')).toBeInTheDocument();

      // Скасувати
      const cancelButton = screen.getByText('Скасувати');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Додати нового користувача')).not.toBeInTheDocument();
      });
    });
  });

  describe('Оновлення користувача', () => {
    it('повинен відкрити діалог редагування при натисканні кнопки редагування', async () => {
      const user = userEvent.setup();
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Іван Петренко')).toBeInTheDocument();
      });

      // Знайти кнопку редагування (перша іконка Edit)
      const editButtons = screen.getAllByTestId('EditIcon');
      await user.click(editButtons[0]);

      expect(screen.getByText('Редагувати користувача')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Іван Петренко')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ivan@example.com')).toBeInTheDocument();
    });

    it('повинен оновити користувача', async () => {
      const user = userEvent.setup();
      const updatedUser = {
        id: '1',
        name: 'Іван Оновлений',
        email: 'ivan_new@example.com',
      };

      mockUsersApi.update.mockResolvedValue(updatedUser);

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Іван Петренко')).toBeInTheDocument();
      });

      // Відкрити діалог редагування
      const editButtons = screen.getAllByTestId('EditIcon');
      await user.click(editButtons[0]);

      // Змінити дані
      const nameInput = screen.getByLabelText("Ім'я");
      const emailInput = screen.getByLabelText('Email');

      await user.clear(nameInput);
      await user.type(nameInput, 'Іван Оновлений');
      await user.clear(emailInput);
      await user.type(emailInput, 'ivan_new@example.com');

      // Оновити
      const updateButton = screen.getByText('Оновити');
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockUsersApi.update).toHaveBeenCalledWith('1', {
          name: 'Іван Оновлений',
          email: 'ivan_new@example.com',
        });
      });
    });
  });

  describe('Видалення користувача', () => {
    it('повинен показати підтвердження перед видаленням', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => false); // Відмінити видалення

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Іван Петренко')).toBeInTheDocument();
      });

      // Знайти кнопку видалення
      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      await user.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalledWith(
        'Ви впевнені, що хочете видалити цього користувача?'
      );
      expect(mockUsersApi.delete).not.toHaveBeenCalled();
    });

    it('повинен видалити користувача після підтвердження', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => true); // Підтвердити видалення

      mockUsersApi.delete.mockResolvedValue(undefined);

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Іван Петренко')).toBeInTheDocument();
      });

      // Видалити користувача
      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockUsersApi.delete).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('Форматування даних', () => {
    it('повинен форматувати дату закінчення підписки', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        // Перевіряємо, що дата відформатована (українська локаль)
        expect(screen.getByText(/31\.12\.2025/)).toBeInTheDocument();
      });
    });

    it('повинен відображати "Немає" для відсутнього плану', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        // Перевіряємо, що є рядки з "Немає" (у таблиці 2 колонки можуть мати "Немає")
        const nemaeCells = screen.getAllByText('Немає');
        expect(nemaeCells.length).toBeGreaterThan(0);
      });
    });
  });
});
