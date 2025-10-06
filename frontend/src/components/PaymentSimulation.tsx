import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  transactionApi,
  subscriptionApi,
  userApi,
  planApi,
} from "../services/api";
import {
  Transaction,
  CreateTransactionData,
  Subscription,
  User,
  SubscriptionPlan,
} from "../types";

const PaymentSimulation: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateTransactionData>({
    subscriptionId: "",
    userId: "",
    planId: "",
    amount: 0,
    paymentMethod: "card",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [transactionsData, subscriptionsData, usersData, plansData] =
        await Promise.all([
          transactionApi.getAllTransactions(),
          subscriptionApi.getAllSubscriptions(),
          userApi.getAllUsers(),
          planApi.getAllPlans(),
        ]);

      setTransactions(transactionsData);
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
      setSuccess(null);

      // Створюємо транзакцію
      const newTransaction = await transactionApi.createTransaction(formData);
      setTransactions([newTransaction, ...transactions]);

      // Симулюємо успішну оплату (90% шанс успіху)
      const isSuccessful = Math.random() > 0.1;

      if (isSuccessful) {
        await transactionApi.completeTransaction(newTransaction.id);
        await subscriptionApi.activateSubscription(formData.subscriptionId);
        setSuccess("Оплата успішно проведена! Підписка активована.");
      } else {
        await transactionApi.failTransaction(newTransaction.id);
        setError("Оплата не пройшла. Спробуйте ще раз.");
      }

      // Оновлюємо список транзакцій
      await loadData();
      setFormData({
        subscriptionId: "",
        userId: "",
        planId: "",
        amount: 0,
        paymentMethod: "card",
        description: "",
      });
      setShowForm(false);
    } catch (err) {
      setError("Помилка створення транзакції");
      console.error(err);
    }
  };

  const handleSubscriptionChange = (subscriptionId: string) => {
    const subscription = subscriptions.find((s) => s.id === subscriptionId);
    if (subscription) {
      setFormData({
        ...formData,
        subscriptionId,
        userId: subscription.userId,
        planId: subscription.planId,
        amount: subscription.price,
      });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} className="status-completed" />;
      case "failed":
        return <XCircle size={20} className="status-failed" />;
      case "pending":
        return <Clock size={20} className="status-pending" />;
      default:
        return <Clock size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: { class: "status-completed", text: "Завершена" },
      failed: { class: "status-failed", text: "Невдала" },
      pending: { class: "status-pending", text: "Очікує" },
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
    }).format(price);
  };

  const getTotalRevenue = () => {
    return transactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getSuccessfulTransactions = () => {
    return transactions.filter((t) => t.status === "completed").length;
  };

  const getFailedTransactions = () => {
    return transactions.filter((t) => t.status === "failed").length;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Завантаження транзакцій...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-3">
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DollarSign size={24} />
            Загальний дохід
          </h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#28a745" }}>
            {formatPrice(getTotalRevenue())}
          </p>
        </div>

        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={24} />
            Успішні транзакції
          </h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#28a745" }}>
            {getSuccessfulTransactions()}
          </p>
        </div>

        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <XCircle size={24} />
            Невдалі транзакції
          </h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc3545" }}>
            {getFailedTransactions()}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <CreditCard size={24} />
            Симуляція оплати
          </h2>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <CreditCard size={20} />
            Нова оплата
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="card">
            <h3>Симуляція оплати</h3>

            <div className="form-group">
              <label className="form-label">Підписка</label>
              <select
                className="form-select"
                value={formData.subscriptionId}
                onChange={(e) => handleSubscriptionChange(e.target.value)}
                required
              >
                <option value="">Оберіть підписку</option>
                {subscriptions
                  .filter(
                    (s) =>
                      s.status === "pending" || s.status === "payment_failed"
                  )
                  .map((subscription) => (
                    <option key={subscription.id} value={subscription.id}>
                      {getUserName(subscription.userId)} -{" "}
                      {getPlanName(subscription.planId)} (
                      {formatPrice(subscription.price)})
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
              <label className="form-label">Сума</label>
              <input
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
              />
            </div>

            <div className="form-group">
              <label className="form-label">Опис</label>
              <input
                type="text"
                className="form-input"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Опис транзакції"
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                <CreditCard size={20} />
                Провести оплату
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
                <th>Статус</th>
                <th>Користувач</th>
                <th>План</th>
                <th>Сума</th>
                <th>Спосіб оплати</th>
                <th>Створено</th>
                <th>Завершено</th>
                <th>Опис</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {getStatusIcon(transaction.status)}
                      {getStatusBadge(transaction.status)}
                    </div>
                  </td>
                  <td>{getUserName(transaction.userId)}</td>
                  <td>{getPlanName(transaction.planId)}</td>
                  <td style={{ fontWeight: "bold" }}>
                    {formatPrice(transaction.amount)}
                  </td>
                  <td>{transaction.paymentMethod}</td>
                  <td>{formatDate(transaction.createdAt)}</td>
                  <td>
                    {transaction.completedAt
                      ? formatDate(transaction.completedAt)
                      : "-"}
                  </td>
                  <td>{transaction.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="loading">Транзакцій не знайдено</div>
        )}
      </div>
    </div>
  );
};

export default PaymentSimulation;
