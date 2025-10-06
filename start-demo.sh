#!/bin/bash

echo "🚀 Запуск демонстрації системи управління підписками SaaS"
echo "=================================================="

# Перевіряємо чи існують .env файли
if [ ! -f ".env" ]; then
    echo "📝 Створення .env файлу з налаштуваннями..."
    cp .env.example .env
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Створення frontend/.env файлу з налаштуваннями..."
    cp frontend/.env.example frontend/.env
fi

# Перевіряємо чи встановлені залежності
if [ ! -d "node_modules" ]; then
    echo "📦 Встановлення залежностей для backend..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Встановлення залежностей для frontend..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "🔧 Запуск backend сервера (порт з .env файлу)..."
echo "🌐 Запуск frontend додатку (порт з .env файлу)..."
echo ""
echo "📱 Frontend буде доступний за адресою: http://localhost:3000"
echo "🔌 Backend API буде доступний за адресою: http://localhost:3001"
echo ""
echo "Натисніть Ctrl+C для зупинки серверів"
echo ""

# Запускаємо обидва сервери одночасно
npm run dev:full
