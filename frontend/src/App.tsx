import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Layout from "./components/Layout";
import UsersPage from "./pages/UsersPage";
import PlansPage from "./pages/PlansPage";
import PaymentSimulationPage from "./pages/PaymentSimulationPage";
import StatisticsPage from "./pages/StatisticsPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<UsersPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/payment" element={<PaymentSimulationPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
