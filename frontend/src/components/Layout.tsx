import React from "react";
import {
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
} from "@mui/material";
import { People, CardMembership, Payment, BarChart } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Спрощений layout без responsive

  const menuItems = [
    { text: "Користувачі", icon: <People />, path: "/users" },
    { text: "Плани", icon: <CardMembership />, path: "/plans" },
    { text: "Симуляція оплати", icon: <Payment />, path: "/payment" },
    { text: "Статистика", icon: <BarChart />, path: "/statistics" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          SaaS Management
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "#1976d2",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
                "& .MuiListItemIcon-root": {
                  color: "white",
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Фіксована бокова панель */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            position: "relative",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Основний контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        {/* Заголовок */}
        <Box
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            p: 2,
            mb: 3,
            borderRadius: 1,
          }}
        >
          <Typography variant="h5" component="h1">
            Система управління підписками
          </Typography>
        </Box>

        {/* Контент сторінки */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
