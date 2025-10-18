import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { usersApi } from "../services/api";
import { User } from "../types";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
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

  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch {
      showSnackbar("Помилка завантаження користувачів", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({ name: "", email: "" });
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData);
        showSnackbar("Користувач успішно оновлений", "success");
      } else {
        await usersApi.create(formData);
        showSnackbar("Користувач успішно створений", "success");
      }
      handleCloseDialog();
      loadUsers();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Помилка збереження користувача";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цього користувача?")) {
      try {
        await usersApi.delete(id);
        showSnackbar("Користувач успішно видалений", "success");
        loadUsers();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Помилка видалення користувача";
        showSnackbar(errorMessage, "error");
      }
    }
  };

  const getStatusChip = (user: User) => {
    if (!user.subscription) {
      return <Chip label="Без підписки" color="default" size="small" />;
    }

    // Перевіряємо, чи підписка ще активна за датою закінчення
    const endDate = new Date(user.subscription.subscriptionEndDate);
    const currentDate = new Date();
    const isActive = endDate > currentDate;

    return (
      <Chip
        label={isActive ? "Активна" : "Неактивна"}
        color={isActive ? "success" : "error"}
        size="small"
      />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA");
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
          Користувачі
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Додати користувача
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Ім'я</TableCell>
              <TableCell>Назва плану</TableCell>
              <TableCell>Статус плану</TableCell>
              <TableCell>Дата закінчення</TableCell>
              <TableCell>Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.subscription?.planName || "Немає"}</TableCell>
                <TableCell>{getStatusChip(user)}</TableCell>
                <TableCell>
                  {user.subscription?.subscriptionEndDate
                    ? formatDate(user.subscription.subscriptionEndDate)
                    : "Немає"}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(user)}
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(user.id)}
                    size="small"
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? "Редагувати користувача" : "Додати нового користувача"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ім'я"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Скасувати</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? "Оновити" : "Створити"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default UsersPage;
