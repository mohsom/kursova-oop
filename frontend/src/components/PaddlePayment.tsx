import React, { useState, useEffect } from "react";
import {
  CreditCard,
  User,
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
} from "lucide-react";
import {
  userApi,
  planApi,
  subscriptionApi,
  transactionApi,
} from "../services/api";
import {
  User as UserType,
  SubscriptionPlan,
  CreateTransactionData,
} from "../types";

const PaddlePayment: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
  };

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    return selectedPlan.price;
  };

  const getBillingPeriod = () => {
    if (!selectedPlan) return "";
    return selectedPlan.billingInterval === "monthly" ? "місяць" : "рік";
  };

  const handlePayment = async () => {
    if (!selectedUser || !selectedPlan) {
      setError("Будь ласка, оберіть користувача та план підписки");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      // Створюємо підписку
      const subscription = await subscriptionApi.createSubscription({
        userId: selectedUser.id,
        planId: selectedPlan.id,
        paymentMethod: "card",
        autoRenew: true,
      });

      // Створюємо транзакцію
      const transactionData: CreateTransactionData = {
        subscriptionId: subscription.id,
        userId: selectedUser.id,
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        paymentMethod: "card",
        description: `Оплата підписки ${selectedPlan.name}`,
      };

      const transaction = await transactionApi.createTransaction(
        transactionData
      );

      // Симулюємо успішну оплату (90% шанс успіху)
      const isSuccessful = Math.random() > 0.1;

      if (isSuccessful) {
        // Завершуємо транзакцію
        await transactionApi.completeTransaction(transaction.id);

        // Активуємо підписку
        await subscriptionApi.activateSubscription(subscription.id);

        setSuccess(
          `Оплата успішно проведена! Підписка "${selectedPlan.name}" активована для ${selectedUser.name}.`
        );

        // Очищуємо форму
        setSelectedUser(null);
        setSelectedPlan(null);
      } else {
        // Позначаємо транзакцію як невдалу
        await transactionApi.failTransaction(transaction.id);
        setError(
          "Оплата не пройшла. Спробуйте ще раз або використайте інший спосіб оплати."
        );
      }
    } catch (err) {
      setError("Помилка обробки оплати");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
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
            Оплата підписки (Paddle Style)
          </h2>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="grid grid-2">
          {/* Вибір користувача */}
          <div className="card">
            <h3
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <User size={20} />
              Користувач
            </h3>

            <div className="form-group">
              <label className="form-label">Оберіть користувача</label>
              <select
                className="form-select"
                value={selectedUser?.id || ""}
                onChange={(e) => {
                  const user = users.find((u) => u.id === e.target.value);
                  setSelectedUser(user || null);
                }}
              >
                <option value="">Оберіть користувача</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && (
              <div
                style={{
                  padding: "1rem",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  marginTop: "1rem",
                }}
              >
                <h4>Вибраний користувач:</h4>
                <p>
                  <strong>Ім'я:</strong> {selectedUser.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Статус:</strong>
                  <span
                    className={`status-badge ${
                      selectedUser.isActive
                        ? "status-active"
                        : "status-cancelled"
                    }`}
                  >
                    {selectedUser.isActive ? "Активний" : "Неактивний"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Вибір плану */}
          <div className="card">
            <h3
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Package size={20} />
              План підписки
            </h3>

            <div className="form-group">
              <label className="form-label">Оберіть план</label>
              <select
                className="form-select"
                value={selectedPlan?.id || ""}
                onChange={(e) => {
                  const plan = plans.find((p) => p.id === e.target.value);
                  setSelectedPlan(plan || null);
                }}
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

            {selectedPlan && (
              <div
                style={{
                  padding: "1rem",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  marginTop: "1rem",
                }}
              >
                <h4>Вибраний план:</h4>
                <p>
                  <strong>Назва:</strong> {selectedPlan.name}
                </p>
                <p>
                  <strong>Опис:</strong> {selectedPlan.description}
                </p>
                <p>
                  <strong>Ціна:</strong> {formatPrice(selectedPlan.price)}
                </p>
                <p>
                  <strong>Період:</strong>{" "}
                  {selectedPlan.billingInterval === "monthly"
                    ? "Місячний"
                    : "Річний"}
                </p>
                {selectedPlan.features && selectedPlan.features.length > 0 && (
                  <div>
                    <strong>Функції:</strong>
                    <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Підсумок та оплата */}
        {selectedUser && selectedPlan && (
          <div className="card">
            <h3
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <DollarSign size={20} />
              Підсумок замовлення
            </h3>

            <div
              style={{
                padding: "1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: "12px",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.2rem" }}>
                    Підписка: {selectedPlan.name}
                  </h4>
                  <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
                    {selectedUser.name} • {selectedUser.email}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {formatPrice(calculateTotal())}
                  </div>
                  <div style={{ opacity: 0.9 }}>за {getBillingPeriod()}</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                }}
              >
                <Calendar size={16} />
                <span>Автоматичне продовження</span>
              </div>
            </div>

            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePayment}
                disabled={isProcessing}
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {isProcessing ? (
                  <>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        border: "2px solid transparent",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Обробка...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Оплатити {formatPrice(calculateTotal())}
                  </>
                )}
              </button>
            </div>

            <div
              style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: "0.875rem",
                color: "#6c757d",
              }}
            >
              <p>Безпечна оплата • 90% шанс успішної транзакції</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaddlePayment;
