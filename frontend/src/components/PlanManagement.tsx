import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Calendar,
} from "lucide-react";
import { planApi } from "../services/api";
import { SubscriptionPlan } from "../types";

interface CreatePlanData {
  name: string;
  description: string;
  price: number;
  billingInterval: "monthly" | "yearly";
  features: string[];
}

const PlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<CreatePlanData>({
    name: "",
    description: "",
    price: 0,
    billingInterval: "monthly",
    features: [],
  });
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
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
  };

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
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPlans([...plans, newPlan]);
      }

      setFormData({
        name: "",
        description: "",
        price: 0,
        billingInterval: "monthly",
        features: [],
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
      description: plan.description,
      price: plan.price,
      billingInterval: plan.billingInterval,
      features: plan.features || [],
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
      description: "",
      price: 0,
      billingInterval: "monthly",
      features: [],
    });
    setNewFeature("");
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

            <div className="form-group">
              <label htmlFor="plan-description" className="form-label">
                Опис
              </label>
              <textarea
                id="plan-description"
                className="form-input"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={3}
                placeholder="Опис плану підписки"
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="plan-price" className="form-label">
                  Ціна (USD)
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
                  placeholder="29.99"
                />
              </div>

              <div className="form-group">
                <label htmlFor="plan-interval" className="form-label">
                  Період оплати
                </label>
                <select
                  id="plan-interval"
                  className="form-select"
                  value={formData.billingInterval}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingInterval: e.target.value as "monthly" | "yearly",
                    })
                  }
                >
                  <option value="monthly">Місячний</option>
                  <option value="yearly">Річний</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Функції плану</label>
              <div
                style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
              >
                <input
                  type="text"
                  className="form-input"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Додати функцію"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addFeature())
                  }
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addFeature}
                >
                  Додати
                </button>
              </div>

              {formData.features.length > 0 && (
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem",
                        background: "#e9ecef",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc3545",
                          cursor: "pointer",
                          fontSize: "1rem",
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
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

        <div className="grid grid-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="card"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ margin: 0, color: "#2c3e50" }}>{plan.name}</h3>
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
              </div>

              <p style={{ color: "#6c757d", marginBottom: "1rem" }}>
                {plan.description}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <DollarSign size={20} color="#28a745" />
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#28a745",
                  }}
                >
                  {formatPrice(plan.price)}
                </span>
                <span style={{ color: "#6c757d" }}>
                  /{plan.billingInterval === "monthly" ? "місяць" : "рік"}
                </span>
              </div>

              {plan.features && plan.features.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                    Функції:
                  </h4>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "1.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e1e5e9",
                  fontSize: "0.875rem",
                  color: "#6c757d",
                }}
              >
                <span
                  className={`status-badge ${
                    plan.isActive ? "status-active" : "status-cancelled"
                  }`}
                >
                  {plan.isActive ? "Активний" : "Неактивний"}
                </span>
                <span>Створено: {formatDate(plan.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 && (
          <div className="loading">Планів не знайдено</div>
        )}
      </div>
    </div>
  );
};

export default PlanManagement;
