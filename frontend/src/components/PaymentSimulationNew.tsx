import React, { useState, useEffect, useCallback } from "react";
import { CreditCard } from "lucide-react";
import { userApi, planApi } from "../services/api";
import { User as UserType, SubscriptionPlan } from "../types";

interface PaymentFormData {
  userEmail: string;
  subscriptionPlanId: string;
  amount: number;
}

const PaymentSimulationNew: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    userEmail: "",
    subscriptionPlanId: "",
    amount: 0,
  });

  const loadData = useCallback(async () => {
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
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Помилка симуляції оплати");
      }

      const result = await response.json();

      if (result.success) {
        setSuccess(
          `Оплата успішно симульована! Створено підписку та транзакцію.`
        );
        setFormData({
          userEmail: "",
          subscriptionPlanId: "",
          amount: 0,
        });
      } else {
        setError(result.message || "Помилка симуляції оплати");
      }
    } catch (err) {
      setError("Помилка симуляції оплати");
      console.error(err);
    }
  };

  const handlePlanChange = (planId: string) => {
    const selectedPlan = plans.find((plan) => plan.id === planId);
    setFormData({
      ...formData,
      subscriptionPlanId: planId,
      amount: selectedPlan?.price || 0,
    });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Завантаження даних...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <CreditCard size={24} />
            Симуляція оплати
          </h2>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit} className="card">
          <h3>Симуляція оплати підписки</h3>

          <div className="form-group">
            <label htmlFor="user-email" className="form-label">
              Email користувача
            </label>
            <select
              id="user-email"
              className="form-select"
              value={formData.userEmail}
              onChange={(e) =>
                setFormData({ ...formData, userEmail: e.target.value })
              }
              required
            >
              <option value="">Оберіть користувача</option>
              {users.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.email} ({user.name})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subscription-plan" className="form-label">
              План підписки
            </label>
            <select
              id="subscription-plan"
              className="form-select"
              value={formData.subscriptionPlanId}
              onChange={(e) => handlePlanChange(e.target.value)}
              required
            >
              <option value="">Оберіть план</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.price} грн (
                  {plan.period === "monthly" ? "місячний" : "річний"})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              Сума (грн)
            </label>
            <input
              id="amount"
              type="number"
              className="form-input"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value),
                })
              }
              required
              min="0"
              step="0.01"
              placeholder="Введіть суму"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <CreditCard size={20} />
            Симулювати оплату
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentSimulationNew;
