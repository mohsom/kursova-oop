#!/bin/bash

echo "🚀 Запуск демонстрації системи управління підписками SaaS"
echo "=================================================="

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
echo "🔧 Запуск backend сервера на порту 3001..."
echo "🌐 Запуск frontend додатку на порту 3000..."
echo ""
echo "📱 Frontend буде доступний за адресою: http://localhost:3000"
echo "🔌 Backend API буде доступний за адресою: http://localhost:3001"
echo ""
echo "Натисніть Ctrl+C для зупинки серверів"
echo ""

# Запускаємо backend в фоновому режимі
npm run dev &
BACKEND_PID=$!

# Запускаємо frontend
cd frontend
npm start &
FRONTEND_PID=$!

# Функція для зупинки процесів при Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Зупинка серверів..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Обробка сигналу завершення
trap cleanup SIGINT SIGTERM

# Очікуємо завершення
wait
