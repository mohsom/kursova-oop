#!/bin/bash

echo "Запуск frontend додатку..."

# Перейти в директорію frontend
cd frontend

# Встановити залежності якщо потрібно
if [ ! -d "node_modules" ]; then
    echo "Встановлення залежностей..."
    npm install
fi

# Запустити frontend додаток
echo "Запуск React додатку на порту 3000..."
npm start
