import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { planApi } from "../services/api";
import { SubscriptionPlan } from "../types";

interface CreatePlanData {
  name: string;
  price: number;
  period: "monthly" | "yearly";
}

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<CreatePlanData>({
    name: "",
    price: 0,
    period: "monthly",
  });

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const plansData = await planApi.getAllPlans();
      setPlans(plansData);
    } catch (err) {
      setError("Помилка завантаження планів");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (editingPlan) {
        // Оновлення плану (потрібно додати API метод)
        // await planApi.updatePlan(editingPlan.id, formData);
        setPlans(
          plans.map((plan) =>
            plan.id === editingPlan.id
              ? { ...plan, ...formData, updatedAt: new Date().toISOString() }
              : plan
          )
        );
      } else {
        // Створення нового плану (потрібно додати API метод)
        // const newPlan = await planApi.createPlan(formData);
        const newPlan: SubscriptionPlan = {
          id: Date.now().toString(),
          ...formData,
        };
        setPlans([...plans, newPlan]);
      }

      setFormData({
        name: "",
        price: 0,
        period: "monthly",
      });
      setShowForm(false);
      setEditingPlan(null);
    } catch (err) {
      setError("Помилка збереження плану");
      console.error(err);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      period: plan.period,
    });
    setShowForm(true);
  };

  const handleDelete = async (planId: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей план?")) {
      try {
        // await planApi.deletePlan(planId);
        setPlans(plans.filter((plan) => plan.id !== planId));
      } catch (err) {
        setError("Помилка видалення плану");
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlan(null);
    setFormData({
      name: "",
      price: 0,
      period: "monthly",
    });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Завантаження планів...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Package size={24} />
            Управління планами підписок
          </h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Додати план
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="card">
            <h3>{editingPlan ? "Редагувати план" : "Новий план підписки"}</h3>

            <div className="form-group">
              <label htmlFor="plan-name" className="form-label">
                Назва плану
              </label>
              <input
                id="plan-name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Наприклад: Pro Plan"
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="plan-price" className="form-label">
                  Ціна (грн)
                </label>
                <input
                  id="plan-price"
                  type="number"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  required
                  min="0"
                  step="0.01"
                  placeholder="299.99"
                />
              </div>

              <div className="form-group">
                <label htmlFor="plan-period" className="form-label">
                  Період
                </label>
                <select
                  id="plan-period"
                  className="form-select"
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      period: e.target.value as "monthly" | "yearly",
                    })
                  }
                >
                  <option value="monthly">Місячний</option>
                  <option value="yearly">Річний</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                {editingPlan ? "Оновити" : "Створити"}
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
                <th>ID</th>
                <th>Назва</th>
                <th>Ціна</th>
                <th>Період</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.id}</td>
                  <td>{plan.name}</td>
                  <td>{plan.price} грн</td>
                  <td>{plan.period === "monthly" ? "Місячний" : "Річний"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(plan)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {plans.length === 0 && (
          <div className="loading">Планів не знайдено</div>
        )}
      </div>
    </div>
  );
};

export default PlanManagement;
