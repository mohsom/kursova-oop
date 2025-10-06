import React, { useState } from "react";
import {
  Users,
  CreditCard,
  BarChart3,
  Shield,
  Plus,
  ShoppingCart,
  Package,
} from "lucide-react";
import UserManagement from "./components/UserManagement";
import PlanManagement from "./components/PlanManagement";
import SubscriptionManagement from "./components/SubscriptionManagement";
import PaymentSimulation from "./components/PaymentSimulation";
import PaddlePayment from "./components/PaddlePayment";
import LicenseCheck from "./components/LicenseCheck";
import TransactionStats from "./components/TransactionStats";
import "./App.css";

type TabType =
  | "users"
  | "plans"
  | "subscriptions"
  | "payment"
  | "paddle"
  | "license"
  | "stats";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("users");

  const tabs = [
    { id: "users" as TabType, label: "Користувачі", icon: Users },
    { id: "plans" as TabType, label: "Плани", icon: Package },
    { id: "subscriptions" as TabType, label: "Підписки", icon: CreditCard },
    { id: "payment" as TabType, label: "Оплата (стара)", icon: Plus },
    { id: "paddle" as TabType, label: "Paddle Оплата", icon: ShoppingCart },
    { id: "license" as TabType, label: "Ліцензії", icon: Shield },
    { id: "stats" as TabType, label: "Статистика", icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "plans":
        return <PlanManagement />;
      case "subscriptions":
        return <SubscriptionManagement />;
      case "payment":
        return <PaymentSimulation />;
      case "paddle":
        return <PaddlePayment />;
      case "license":
        return <LicenseCheck />;
      case "stats":
        return <TransactionStats />;
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
