import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, TrendingUp, DollarSign, CreditCard } from "lucide-react";

interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
}

const TransactionStatsNew: React.FC = () => {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/payment/stats");

      if (!response.ok) {
        throw new Error("Помилка завантаження статистики");
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.message || "Помилка завантаження статистики");
      }
    } catch (err) {
      setError("Помилка завантаження статистики");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Завантаження статистики...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <BarChart3 size={24} />
            Статистика транзакцій
          </h2>
        </div>

        {error && <div className="error">{error}</div>}

        {stats && (
          <div className="grid grid-3">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <CreditCard size={20} />
                  Загальна кількість
                </h3>
              </div>
              <div className="stat-value">{stats.totalTransactions}</div>
              <p className="stat-label">транзакцій</p>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <DollarSign size={20} />
                  Загальна сума
                </h3>
              </div>
              <div className="stat-value">
                {formatCurrency(stats.totalAmount)}
              </div>
              <p className="stat-label">всього</p>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <TrendingUp size={20} />
                  Середня сума
                </h3>
              </div>
              <div className="stat-value">
                {formatCurrency(stats.averageAmount)}
              </div>
              <p className="stat-label">за транзакцію</p>
            </div>
          </div>
        )}

        {!stats && !loading && (
          <div className="loading">Статистика недоступна</div>
        )}
      </div>
    </div>
  );
};

export default TransactionStatsNew;
