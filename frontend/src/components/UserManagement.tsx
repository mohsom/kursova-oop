import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, User as UserIcon } from "lucide-react";
import { userApi, planApi } from "../services/api";
import { User, CreateUserData, SubscriptionPlan } from "../types";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, plansData] = await Promise.all([
        userApi.getAllUsers(),
        planApi.getAllPlans(),
      ]);
      setUsers(usersData);
      setPlans(plansData);
    } catch (err) {
      setError("Помилка завантаження даних");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Функція для отримання плану за ID
  const getPlanById = (planId: string) => {
    return plans.find((plan) => plan.id === planId);
  };

  // Функція для отримання назви плану
  const getPlanName = (user: User) => {
    if (!user.subscription) return "Немає підписки";

    const plan = getPlanById(user.subscription.planId);
    return plan ? plan.name : "Невідомий план";
  };

  // Функція для отримання статусу підписки
  const getSubscriptionStatus = (user: User) => {
    if (!user.subscription) {
      return { status: "Неактивний", className: "status-cancelled" };
    }

    const now = new Date();
    const endDate = new Date(user.subscription.endDate);

    if (endDate > now) {
      return { status: "Активний", className: "status-active" };
    } else {
      return { status: "Закінчився", className: "status-expired" };
    }
  };

  // Функція для отримання дати закінчення
  const getEndDate = (user: User) => {
    if (!user.subscription) return "-";

    return new Date(user.subscription.endDate).toLocaleDateString("uk-UA");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (editingUser) {
        await userApi.updateUser(editingUser.id, formData);
        setUsers(
          users.map((user) =>
            user.id === editingUser.id
              ? { ...user, ...formData, updatedAt: new Date().toISOString() }
              : user
          )
        );
      } else {
        const newUser = await userApi.createUser(formData);
        setUsers([...users, newUser]);
      }

      setFormData({ name: "", email: "" });
      setShowForm(false);
      setEditingUser(null);
    } catch (err) {
      setError("Помилка збереження користувача");
      console.error(err);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цього користувача?")) {
      try {
        await userApi.deleteUser(userId);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (err) {
        setError("Помилка видалення користувача");
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ name: "", email: "" });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Завантаження користувачів...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <UserIcon size={24} />
            Управління користувачами
          </h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Додати користувача
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="card">
            <h3>
              {editingUser ? "Редагувати користувача" : "Новий користувач"}
            </h3>

            <div className="form-group">
              <label htmlFor="user-name" className="form-label">
                Ім'я
              </label>
              <input
                id="user-name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-email" className="form-label">
                Email
              </label>
              <input
                id="user-email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                {editingUser ? "Оновити" : "Створити"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Скасувати
              </button>
            </div>
          </form>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Ім'я</th>
                <th>Назва плану</th>
                <th>Статус плану</th>
                <th>Дата закінчення</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const subscriptionStatus = getSubscriptionStatus(user);
                return (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.name}</td>
                    <td>{getPlanName(user)}</td>
                    <td>
                      <span
                        className={`status-badge ${subscriptionStatus.className}`}
                      >
                        {subscriptionStatus.status}
                      </span>
                    </td>
                    <td>{getEndDate(user)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="loading">Користувачів не знайдено</div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
