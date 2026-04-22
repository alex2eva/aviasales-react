# Aviasales Web Application (React + Node.js)

Веб-приложение для управления авиарейсами на базе React.js и Node.js.

## 📁 Структура проекта

```
aviasales-react/
├── backend/          # Node.js/Express API сервер
│   ├── server.js    # Основной файл сервера
│   ├── package.json
│   └── .env         # Конфигурация базы данных
├── frontend/        # React приложение
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── services/    # API сервисы
│   │   └── App.js       # Главный компонент
│   └── package.json
└── README.md
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js (версия 14 или выше)
- PostgreSQL (порт 5434)
- База данных `aviasales`

### 1. Установка зависимостей

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Настройка базы данных

Отредактируйте `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5434
DB_NAME=aviasales
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
```

### 3. Запуск приложения

**Запуск Backend (в отдельном терминале):**
```bash
cd backend
npm start
# или для разработки с автоперезагрузкой:
npm run dev
```

**Запуск Frontend (в отдельном терминале):**
```bash
cd frontend
npm start
```

### 4. Откройте в браузере

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📋 Функциональность

### Справочники (CRUD операции):
- ✅ Страны (`/countries`)
- ✅ Города (`/cities`) - с выбором страны
- ✅ Аэропорты (`/airports`) - с выбором города
- ✅ Самолеты (`/aircrafts`)
- ✅ Класс места (`/seats-classes`)
- ✅ Авиакомпании (`/airlines`)

### Поиск рейсов:
- ✅ Поиск по городу вылета
- ✅ Поиск по аэропорту вылета
- ✅ Поиск по городу прилета
- ✅ Поиск по аэропорту прилета
- ✅ Поиск по дате вылета
- ✅ Отображение всех атрибутов рейса с наименованиями для FK

## 🛠 Технологии

### Backend:
- Node.js
- Express.js
- PostgreSQL (pg)
- CORS
- dotenv

### Frontend:
- React 18
- React Router DOM
- Axios
- CSS3

## 📝 API Endpoints

### Countries
- `GET /api/countries` - Получить все страны
- `POST /api/countries` - Создать страну
- `DELETE /api/countries/:id` - Удалить страну

### Cities
- `GET /api/cities` - Получить все города
- `POST /api/cities` - Создать город
- `DELETE /api/cities/:id` - Удалить город

### Airports
- `GET /api/airports` - Получить все аэропорты
- `POST /api/airports` - Создать аэропорт
- `DELETE /api/airports/:id` - Удалить аэропорт

### Aircrafts
- `GET /api/aircrafts` - Получить все самолеты
- `POST /api/aircrafts` - Создать самолет
- `DELETE /api/aircrafts/:id` - Удалить самолет

### Seats Classes
- `GET /api/seats-classes` - Получить все классы мест
- `POST /api/seats-classes` - Создать класс места
- `DELETE /api/seats-classes/:id` - Удалить класс места

### Airlines
- `GET /api/airlines` - Получить все авиакомпании
- `POST /api/airlines` - Создать авиакомпанию
- `DELETE /api/airlines/:id` - Удалить авиакомпанию

### Flights
- `GET /api/flights` - Поиск рейсов
  - Query параметры:
    - `departure_city_id`
    - `departure_airport_id`
    - `arrival_city_id`
    - `arrival_airport_id`
    - `departure_date` (формат: YYYY-MM-DD)

## 🔧 Разработка

### Backend разработка с автоперезагрузкой:
```bash
cd backend
npm run dev
```

### Frontend разработка:
```bash
cd frontend
npm start
```
Приложение автоматически откроется в браузере на http://localhost:3000

## 📦 Сборка для продакшена

### Frontend:
```bash
cd frontend
npm run build
```

Собранные файлы будут в папке `frontend/build/`

## ⚠️ Важные замечания

1. Убедитесь, что PostgreSQL запущен и доступен на порту 5434
2. База данных `aviasales` должна быть создана
3. Backend должен быть запущен перед запуском Frontend
4. CORS настроен для работы с localhost:3000

## 📄 Лицензия

ISC

