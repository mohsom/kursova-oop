import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, CreditCard } from 'lucide-react';
import { transactionApi, subscriptionApi, userApi, planApi } from '../services/api';
import { TransactionStats as TransactionStatsType, Transaction, Subscription, User, SubscriptionPlan } from '../types';

const TransactionStats: React.FC = () => {
  const [stats, setStats] = useState<TransactionStatsType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUserId || selectedPlanId) {
      loadStats();
    }
  }, [selectedUserId, selectedPlanId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, transactionsData, subscriptionsData, usersData, plansData] = await Promise.all([
        transactionApi.getTransactionStats(),
        transactionApi.getAllTransactions(),
        subscriptionApi.getAllSubscriptions(),
        userApi.getAllUsers(),
        planApi.getAllPlans(),
      ]);
      
      setStats(statsData);
      setTransactions(transactionsData);
      setSubscriptions(subscriptionsData);
      setUsers(usersData);
      setPlans(plansData);
    } catch (err) {
      setError('Помилка завантаження статистики');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await transactionApi.getTransactionStats(selectedUserId || undefined, selectedPlanId || undefined);
      setStats(statsData);
    } catch (err) {
      setError('Помилка завантаження статистики');
      console.error(err);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Невідомий користувач';
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : 'Невідомий план';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    }).format(price);
  };

  const getMonthlyRevenueData = () => {
    if (!stats?.monthlyRevenue) return [];
    
    return stats.monthlyRevenue.map(item => ({
      month: item.month,
      revenue: item.revenue,
      formattedRevenue: formatPrice(item.revenue)
    }));
  };

  const getPlanStatsData = () => {
    if (!stats?.planStats) return [];
    
    return stats.planStats.map(item => ({
      name: getPlanName(item.planId),
      subscriptions: item.subscriptions,
      revenue: item.revenue,
      formattedRevenue: formatPrice(item.revenue)
    }));
  };

  const getTransactionStatusData = () => {
    const completed = transactions.filter(t => t.status === 'completed').length;
    const failed = transactions.filter(t => t.status === 'failed').length;
    const pending = transactions.filter(t => t.status === 'pending').length;

    return [
      { name: 'Завершені', value: completed, color: '#28a745' },
      { name: 'Невдалі', value: failed, color: '#dc3545' },
      { name: 'Очікують', value: pending, color: '#ffc107' },
    ];
  };

  const getTransactionTrendData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const dayTransactions = transactions.filter(t => 
        t.createdAt.startsWith(date)
      );
      
      const completed = dayTransactions.filter(t => t.status === 'completed').length;
      const failed = dayTransactions.filter(t => t.status === 'failed').length;
      const revenue = dayTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: new Date(date).toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' }),
        completed,
        failed,
        revenue
      };
    });
  };

  const COLORS = ['#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'];

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Завантаження статистики...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <div className="error">Не вдалося завантажити статистику</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-3">
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={24} />
            Загальний дохід
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {formatPrice(stats.totalRevenue)}
          </p>
        </div>

        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={24} />
            Всього транзакцій
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>
            {stats.totalTransactions}
          </p>
        </div>

        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={24} />
            Успішність
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats.totalTransactions > 0 
              ? Math.round((stats.successfulTransactions / stats.totalTransactions) * 100)
              : 0}%
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <BarChart3 size={24} />
            Статистика транзакцій
          </h2>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Фільтр по користувачу</label>
            <select
              className="form-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Всі користувачі</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Фільтр по плану</label>
            <select
              className="form-select"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
            >
              <option value="">Всі плани</option>
              {plans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h3>Дохід по місяцях</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), 'Дохід']}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#28a745" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Статус транзакцій</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getTransactionStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getTransactionStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h3>Тренд транзакцій (останні 30 днів)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getTransactionTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#28a745" name="Успішні" />
                <Line type="monotone" dataKey="failed" stroke="#dc3545" name="Невдалі" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Дохід по планах</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getPlanStatsData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), 'Дохід']}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#17a2b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>Детальна статистика по планах</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>План</th>
                  <th>Кількість підписок</th>
                  <th>Загальний дохід</th>
                  <th>Середній дохід на підписку</th>
                </tr>
              </thead>
              <tbody>
                {getPlanStatsData().map((plan, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 'bold' }}>{plan.name}</td>
                    <td>{plan.subscriptions}</td>
                    <td style={{ fontWeight: 'bold' }}>{plan.formattedRevenue}</td>
                    <td>
                      {plan.subscriptions > 0 
                        ? formatPrice(plan.revenue / plan.subscriptions)
                        : formatPrice(0)
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionStats;
