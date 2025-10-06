import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User as UserIcon,
  Calendar,
} from "lucide-react";
import { subscriptionApi, userApi, planApi } from "../services/api";
import { Subscription, User as UserType, SubscriptionPlan } from "../types";

const LicenseCheck: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>(
    []
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserSubscriptions(selectedUserId);
    }
  }, [selectedUserId]);

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

  const loadUserSubscriptions = async (userId: string) => {
    try {
      const userSubs = await subscriptionApi.getUserSubscriptions(userId);
      setUserSubscriptions(userSubs);
    } catch (err) {
      setError("Помилка завантаження підписок користувача");
      console.error(err);
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

  const getLicenseStatus = (subscription: Subscription) => {
    const now = new Date();
    const endDate = new Date(subscription.subscriptionEndDate);
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (subscription.status === "active" && endDate > now) {
      if (daysUntilExpiry <= 7) {
        return {
          status: "warning",
          text: "Закінчується",
          icon: <AlertTriangle size={20} className="status-pending" />,
          description: `Закінчується через ${daysUntilExpiry} днів`,
        };
      } else {
        return {
          status: "active",
          text: "Активна",
          icon: <CheckCircle size={20} className="status-completed" />,
          description: `Дійсна ще ${daysUntilExpiry} днів`,
        };
      }
    } else if (subscription.status === "cancelled") {
      return {
        status: "cancelled",
        text: "Скасована",
        icon: <XCircle size={20} className="status-cancelled" />,
        description: "Підписка скасована",
      };
    } else if (subscription.status === "expired" || endDate <= now) {
      return {
        status: "expired",
        text: "Закінчилася",
        icon: <XCircle size={20} className="status-failed" />,
        description: "Ліцензія закінчилася",
      };
    } else {
      return {
        status: "pending",
        text: "Очікує",
        icon: <Clock size={20} className="status-pending" />,
        description: "Очікує активації",
      };
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { class: "status-completed", text: "Активна" },
      warning: { class: "status-pending", text: "Закінчується" },
      cancelled: { class: "status-cancelled", text: "Скасована" },
      expired: { class: "status-failed", text: "Закінчилася" },
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
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter((s) => s.status === "active");
  };

  const getExpiredSubscriptions = () => {
    const now = new Date();
    return subscriptions.filter(
      (s) => s.status === "expired" || new Date(s.subscriptionEndDate) <= now
    );
  };

  const getExpiringSoon = () => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return subscriptions.filter(
      (s) =>
        s.status === "active" &&
        new Date(s.subscriptionEndDate) <= weekFromNow &&
        new Date(s.subscriptionEndDate) > now
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Завантаження ліцензій...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-3">
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={24} />
            Активні ліцензії
          </h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#28a745" }}>
            {getActiveSubscriptions().length}
          </p>
        </div>

        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={24} />
            Закінчуються
          </h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#ffc107" }}>
            {getExpiringSoon().length}
          </p>
        </div>

        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <XCircle size={24} />
            Закінчилися
          </h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#dc3545" }}>
            {getExpiredSubscriptions().length}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Shield size={24} />
            Перевірка ліцензій
          </h2>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label className="form-label">
            Оберіть користувача для перевірки ліцензій
          </label>
          <select
            className="form-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Оберіть користувача</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {selectedUserId && (
          <div className="card">
            <h3
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <UserIcon size={20} />
              Ліцензії користувача: {getUserName(selectedUserId)}
            </h3>

            {userSubscriptions.length === 0 ? (
              <div className="loading">У цього користувача немає підписок</div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>План</th>
                      <th>Статус ліцензії</th>
                      <th>Початок</th>
                      <th>Закінчення</th>
                      <th>Ціна</th>
                      <th>Автопродовження</th>
                      <th>Деталі</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSubscriptions.map((subscription) => {
                      const licenseStatus = getLicenseStatus(subscription);
                      return (
                        <tr key={subscription.id}>
                          <td>
                            <div style={{ fontWeight: "bold" }}>
                              {getPlanName(subscription.planId)}
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
                              {licenseStatus.icon}
                              {getStatusBadge(licenseStatus.status)}
                            </div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "#6c757d",
                                marginTop: "0.25rem",
                              }}
                            >
                              {licenseStatus.description}
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
                              {formatDate(subscription.subscriptionEndDate)}
                            </div>
                          </td>
                          <td style={{ fontWeight: "bold" }}>
                            {formatPrice(subscription.price)}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                subscription.autoRenew
                                  ? "status-completed"
                                  : "status-cancelled"
                              }`}
                            >
                              {subscription.autoRenew ? "Так" : "Ні"}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.875rem" }}>
                              <div>
                                Спосіб оплати:{" "}
                                {subscription.paymentMethod || "Не вказано"}
                              </div>
                              <div>
                                Інтервал:{" "}
                                {subscription.billingInterval === "monthly"
                                  ? "Місячний"
                                  : "Річний"}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <h3>Всі ліцензії в системі</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Користувач</th>
                  <th>План</th>
                  <th>Статус ліцензії</th>
                  <th>Закінчення</th>
                  <th>Ціна</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => {
                  const licenseStatus = getLicenseStatus(subscription);
                  return (
                    <tr key={subscription.id}>
                      <td>{getUserName(subscription.userId)}</td>
                      <td>{getPlanName(subscription.planId)}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {licenseStatus.icon}
                          {getStatusBadge(licenseStatus.status)}
                        </div>
                      </td>
                      <td>{formatDate(subscription.subscriptionEndDate)}</td>
                      <td style={{ fontWeight: "bold" }}>
                        {formatPrice(subscription.price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseCheck;
