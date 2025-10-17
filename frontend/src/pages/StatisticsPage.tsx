import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, AttachMoney, Receipt, People } from "@mui/icons-material";
import { paymentApi } from "../services/api";
import { TransactionStats } from "../types";

const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showSnackbar = React.useCallback(
    (message: string, severity: "success" | "error") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const loadStats = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentApi.getStats();
      setStats(data);
    } catch {
      showSnackbar("Помилка завантаження статистики", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()} ₴`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Статистика транзакцій
        </Typography>
        <Alert severity="error">Не вдалося завантажити статистику</Alert>
      </Box>
    );
  }

  // Перевірка на наявність даних
  if (!stats.transactionsByMonth || stats.transactionsByMonth.length === 0) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Статистика транзакцій
        </Typography>
        <Alert severity="info">
          Немає даних для відображення статистики. Створіть кілька транзакцій
          для аналізу.
        </Alert>
      </Box>
    );
  }

  // Prepare data for charts
  const lineChartData =
    stats.transactionsByMonth?.map((item) => ({
      month: formatDate(item.month),
      count: item.count || 0,
      amount: item.amount || 0,
    })) || [];

  const barChartData =
    stats.transactionsByMonth?.map((item) => ({
      month: formatDate(item.month),
      transactions: item.count || 0,
      revenue: item.amount || 0,
    })) || [];

  const pieChartData = [
    { name: "Активні транзакції", value: stats.totalTransactions || 0 },
    { name: "Загальна сума", value: stats.totalAmount || 0 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Статистика транзакцій
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Аналіз транзакцій та фінансових показників системи
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Receipt sx={{ mr: 2, color: "primary.main", fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalTransactions}
                  </Typography>
                  <Typography color="text.secondary">
                    Всього транзакцій
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney
                  sx={{ mr: 2, color: "success.main", fontSize: 40 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {formatCurrency(stats.totalAmount)}
                  </Typography>
                  <Typography color="text.secondary">Загальна сума</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp
                  sx={{ mr: 2, color: "warning.main", fontSize: 40 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {formatCurrency(stats.averageAmount)}
                  </Typography>
                  <Typography color="text.secondary">Середня сума</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ mr: 2, color: "info.main", fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.transactionsByMonth.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Місяців активності
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Line Chart - Transactions Over Time */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Динаміка транзакцій
              </Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "count"
                          ? value
                          : formatCurrency(Number(value)),
                        name === "count" ? "Кількість" : "Сума",
                      ]}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Кількість транзакцій"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="amount"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Сума (₴)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart - Transaction Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Розподіл показників
              </Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart - Monthly Revenue */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Місячний дохід
              </Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "transactions"
                          ? value
                          : formatCurrency(Number(value)),
                        name === "transactions" ? "Транзакції" : "Дохід",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="transactions"
                      fill="#8884d8"
                      name="Кількість транзакцій"
                    />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Дохід (₴)" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StatisticsPage;
