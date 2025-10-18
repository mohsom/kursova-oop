import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
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
} from "recharts";
import { paymentApi } from "../services/api";
import type { Transaction } from "../types";

const StatisticsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = React.useCallback(async () => {
    setLoading(true);
    const data = await paymentApi.getTransactions();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Завантаження транзакцій...</Typography>
      </Box>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Графік транзакцій по днях
        </Typography>
        <Box
          sx={{
            p: 2,
            backgroundColor: "#e3f2fd",
            borderRadius: 1,
            color: "blue",
          }}
        >
          Немає даних для відображення. Створіть кілька транзакцій для аналізу.
        </Box>
      </Box>
    );
  }

  // Групуємо транзакції по днях
  const groupedByDay = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!acc[dayKey]) {
      acc[dayKey] = { count: 0, amount: 0 };
    }

    acc[dayKey].count += 1;
    acc[dayKey].amount += transaction.amount;

    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  const chartData = Object.entries(groupedByDay)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([day, data]) => ({
      day: new Date(day).toLocaleDateString("uk-UA", {
        month: "short",
        day: "numeric",
      }),
      count: data.count,
      amount: data.amount,
    }));

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Графік транзакцій по днях
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Динаміка транзакцій
              </Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "count"
                          ? value
                          : `${Number(value).toLocaleString()} ₴`,
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
      </Grid>
    </Box>
  );
};

export default StatisticsPage;
