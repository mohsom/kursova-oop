import React, { useState, useEffect } from "react";
import { Plus, CreditCard, X, Calendar } from "lucide-react";
import { subscriptionApi, userApi, planApi } from "../services/api";
import {
  Subscription,
  CreateSubscriptionData,
  User,
  SubscriptionPlan,
} from "../types";

const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateSubscriptionData>({
    userId: "",
    planId: "",
    paymentMethod: "card",
    autoRenew: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subscriptionsData, usersData, plansData] = await Promise.all([
        subscriptionApi.getAllSubscriptions(),
        userApi.getAllUsers(),
        planApi.getAllPlans(),
      ]);

      setSubscriptions(subscriptionsData);
      setUsers(usersData);
      setPlans(plansData);
    } catch (err) {
      setError("Помилка завантаження даних");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const newSubscription = await subscriptionApi.createSubscription(
        formData
      );
      setSubscriptions([...subscriptions, newSubscription]);
      setFormData({
        userId: "",
        planId: "",
        paymentMethod: "card",
        autoRenew: true,
      });
      setShowForm(false);
    } catch (err) {
      setError("Помилка створення підписки");
      console.error(err);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (window.confirm("Ви впевнені, що хочете скасувати цю підписку?")) {
      try {
        const updatedSubscription = await subscriptionApi.cancelSubscription(
          subscriptionId
        );
        setSubscriptions(
          subscriptions.map((sub) =>
            sub.id === subscriptionId ? updatedSubscription : sub
          )
        );
      } catch (err) {
        setError("Помилка скасування підписки");
        console.error(err);
      }
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Невідомий користувач";
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    return plan ? plan.name : "Невідомий план";
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { class: "status-active", text: "Активна" },
      cancelled: { class: "status-cancelled", text: "Скасована" },
      expired: { class: "status-expired", text: "Закінчилася" },
      pending: { class: "status-pending", text: "Очікує" },
      payment_failed: {
        class: "status-payment_failed",
        text: "Помилка оплати",
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      class: "",
      text: status,
    };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Завантаження підписок...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <CreditCard size={24} />
            Управління підписками
          </h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Додати підписку
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="card">
            <h3>Нова підписка</h3>

            <div className="form-group">
              <label className="form-label">Користувач</label>
              <select
                className="form-select"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                required
              >
                <option value="">Оберіть користувача</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">План підписки</label>
              <select
                className="form-select"
                value={formData.planId}
                onChange={(e) =>
                  setFormData({ ...formData, planId: e.target.value })
                }
                required
              >
                <option value="">Оберіть план</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {formatPrice(plan.price)}/
                    {plan.billingInterval === "monthly" ? "місяць" : "рік"}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Спосіб оплати</label>
              <select
                className="form-select"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
              >
                <option value="card">Банківська картка</option>
                <option value="paypal">PayPal</option>
                <option value="bank">Банківський переказ</option>
              </select>
            </div>

            <div className="form-group">
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  checked={formData.autoRenew}
                  onChange={(e) =>
                    setFormData({ ...formData, autoRenew: e.target.checked })
                  }
                />
                Автоматичне продовження
              </label>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                Створити підписку
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
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
                <th>Користувач</th>
                <th>План</th>
                <th>Ціна</th>
                <th>Статус</th>
                <th>Початок</th>
                <th>Закінчення</th>
                <th>Автопродовження</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td>{getUserName(subscription.userId)}</td>
                  <td>{getPlanName(subscription.planId)}</td>
                  <td>{formatPrice(subscription.price)}</td>
                  <td>{getStatusBadge(subscription.status)}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Calendar size={16} />
                      {formatDate(subscription.startDate)}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Calendar size={16} />
                      {formatDate(subscription.endDate)}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        subscription.autoRenew
                          ? "status-active"
                          : "status-cancelled"
                      }`}
                    >
                      {subscription.autoRenew ? "Так" : "Ні"}
                    </span>
                  </td>
                  <td>
                    {subscription.status === "active" && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          handleCancelSubscription(subscription.id)
                        }
                      >
                        <X size={16} />
                        Скасувати
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subscriptions.length === 0 && (
          <div className="loading">Підписок не знайдено</div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;
