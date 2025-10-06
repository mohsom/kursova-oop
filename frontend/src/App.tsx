import React, { useState } from "react";
import { Users, CreditCard, BarChart3, Package } from "lucide-react";
import UserManagement from "./components/UserManagement";
import PlanManagement from "./components/PlanManagement";
import PaymentSimulationNew from "./components/PaymentSimulationNew";
import TransactionStatsNew from "./components/TransactionStatsNew";
import "./App.css";

type TabType = "users" | "plans" | "payment" | "stats";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("users");

  const tabs = [
    { id: "users" as TabType, label: "Користувачі", icon: Users },
    { id: "plans" as TabType, label: "Плани", icon: Package },
    { id: "payment" as TabType, label: "Симуляція оплати", icon: CreditCard },
    { id: "stats" as TabType, label: "Статистика", icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "plans":
        return <PlanManagement />;
      case "payment":
        return <PaymentSimulationNew />;
      case "stats":
        return <TransactionStatsNew />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Система управління підписками SaaS</h1>
        <p>Демонстрація роботи системи управління підписками</p>
      </header>

      <nav className="app-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="app-main">{renderContent()}</main>
    </div>
  );
};

export default App;
