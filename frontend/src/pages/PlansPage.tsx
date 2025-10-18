import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { Add, Edit, Delete, AttachMoney, Schedule } from "@mui/icons-material";
import { plansApi } from "../services/api";
import { SubscriptionPlan } from "../types";

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    period: "monthly" as "monthly" | "yearly",
  });

  const loadPlans = React.useCallback(async () => {
    setLoading(true);
    const data = await plansApi.getAll();
    setPlans(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleOpenDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        period: plan.period,
      });
    } else {
      setEditingPlan(null);
      setFormData({ name: "", price: "", period: "monthly" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlan(null);
    setFormData({ name: "", price: "", period: "monthly" });
  };

  const handleSubmit = async () => {
    const planData = {
      name: formData.name,
      price: parseFloat(formData.price),
      period: formData.period,
    };

    if (editingPlan) {
      await plansApi.update(editingPlan.id, planData);
    } else {
      await plansApi.create(planData);
    }
    handleCloseDialog();
    loadPlans();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей план?")) {
      await plansApi.delete(id);
      loadPlans();
    }
  };

  const getPeriodText = (period: string) => {
    return period === "monthly" ? "місяць" : "рік";
  };

  const getPeriodChip = (period: string) => {
    return (
      <Chip
        label={getPeriodText(period)}
        color={period === "monthly" ? "primary" : "secondary"}
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Завантаження...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Плани підписок
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Додати план
        </Button>
      </Box>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} md={6} lg={4} key={plan.id}>
            <Card
              sx={{ height: 300, display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1, pb: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" component="h2">
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {plan.id}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <AttachMoney sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h4" component="span" color="primary">
                    {plan.price} ₴
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Schedule sx={{ mr: 1, color: "text.secondary" }} />
                  {getPeriodChip(plan.period)}
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {plan.period === "monthly"
                    ? `Щомісячна оплата: ${plan.price} ₴`
                    : `Річна оплата: ${plan.price} ₴ (${(
                        plan.price / 12
                      ).toFixed(2)} ₴/місяць)`}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleOpenDialog(plan)}
                  sx={{ mr: 1 }}
                >
                  Редагувати
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => handleDelete(plan.id)}
                >
                  Видалити
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPlan ? "Редагувати план" : "Додати новий план"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Назва плану"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Ціна (₴)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Період</InputLabel>
            <Select
              value={formData.period}
              label="Період"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  period: e.target.value as "monthly" | "yearly",
                })
              }
            >
              <MenuItem value="monthly">Щомісячно</MenuItem>
              <MenuItem value="yearly">Щорічно</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Скасувати</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPlan ? "Оновити" : "Створити"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlansPage;
