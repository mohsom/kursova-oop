import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  CreditCard,
  Person,
  CardMembership,
  AttachMoney,
  CheckCircle,
} from "@mui/icons-material";
import { usersApi, plansApi, paymentApi } from "../services/api";
import { User, SubscriptionPlan, PaymentSimulation } from "../types";

const PaymentSimulationPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const loadData = React.useCallback(async () => {
    const [usersData, plansData] = await Promise.all([
      usersApi.getAll(),
      plansApi.getAll(),
    ]);
    setUsers(usersData);
    setPlans(plansData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedPlan) {
      const plan = plans.find((p) => p.id === selectedPlan);
      if (plan) {
        setAmount(plan.price);
      }
    }
  }, [selectedPlan, plans]);

  const handlePayment = async () => {
    if (!selectedUser || !selectedPlan) return;

    setLoading(true);
    const paymentData: PaymentSimulation = {
      userEmail: selectedUser,
      subscriptionPlanId: selectedPlan,
      amount: amount,
    };

    await paymentApi.simulate(paymentData);
    setPaymentSuccess(true);

    setTimeout(() => {
      setSelectedUser("");
      setSelectedPlan("");
      setAmount(0);
      setPaymentSuccess(false);
    }, 3000);

    setLoading(false);
  };

  const selectedUserData = users.find((u) => u.email === selectedUser);
  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Симуляція оплати
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Оберіть користувача та план підписки для проведення симуляції оплати
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <CreditCard sx={{ mr: 2, color: "primary.main" }} />
                <Typography variant="h6">Деталі оплати</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Користувач</InputLabel>
                    <Select
                      value={selectedUser}
                      label="Користувач"
                      onChange={(e) => setSelectedUser(e.target.value)}
                    >
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.email}>
                          <Box>
                            <Typography variant="body1">{user.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>План підписки</InputLabel>
                    <Select
                      value={selectedPlan}
                      label="План підписки"
                      onChange={(e) => setSelectedPlan(e.target.value)}
                    >
                      {plans.map((plan) => (
                        <MenuItem key={plan.id} value={plan.id}>
                          <Box>
                            <Typography variant="body1">{plan.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {plan.price} ₴ /{" "}
                              {plan.period === "monthly" ? "місяць" : "рік"}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Сума оплати"
                    type="number"
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <AttachMoney sx={{ mr: 1 }} />,
                      endAdornment: <Typography sx={{ ml: 1 }}>₴</Typography>,
                    }}
                  />
                </Grid>
              </Grid>

              <Box mt={3}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handlePayment}
                  disabled={loading || !selectedUser || !selectedPlan}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <CreditCard />
                  }
                >
                  {loading ? "Обробка..." : "Провести оплату"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Підсумок
              </Typography>

              {selectedUserData && (
                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="subtitle2">Користувач</Typography>
                  </Box>
                  <Typography variant="body1">
                    {selectedUserData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUserData.email}
                  </Typography>
                </Box>
              )}

              {selectedPlanData && (
                <Box mb={2}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CardMembership sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="subtitle2">План</Typography>
                  </Box>
                  <Typography variant="body1">
                    {selectedPlanData.name}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Chip
                      label={
                        selectedPlanData.period === "monthly"
                          ? "Щомісячно"
                          : "Щорічно"
                      }
                      size="small"
                      color={
                        selectedPlanData.period === "monthly"
                          ? "primary"
                          : "secondary"
                      }
                    />
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">Сума до сплати:</Typography>
                <Typography variant="h5" color="primary">
                  {amount} ₴
                </Typography>
              </Box>

              {paymentSuccess && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "#e8f5e8",
                    borderRadius: 1,
                    color: "green",
                  }}
                >
                  Оплата успішно проведена!
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentSimulationPage;
