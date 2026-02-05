# IT-ВыСотка

Веб-приложение для проведения чемпионата по программированию IT-ВыСотка. Система обеспечивает полный цикл организации мероприятия: от регистрации участников до генерации сертификатов и публикации результатов.

## Содержание

- [Описание](#описание)
- [Технологический стек](#технологический-стек)
- [Функциональность](#функциональность)
- [Структура проекта](#структура-проекта)
- [Установка и запуск](#установка-и-запуск)
- [Конфигурация](#конфигурация)
- [API](#api)
- [Разработка](#разработка)

## Описание

IT-ВыСотка — это комплексная платформа для организации и проведения чемпионата по программированию. Система поддерживает регистрацию участников (индивидуально или в командах), управление аудиториями и рассадкой, генерацию сертификатов, публикацию результатов и многое другое.

## Технологический стек

### Backend
- **Node.js** 20+ с **Express** 5.1
- **PostgreSQL** 15 (через Sequelize ORM)
- **JWT** для аутентификации
- **Nodemailer** для отправки email
- **PDF-lib** для генерации сертификатов
- **Multer** для загрузки файлов
- **ExcelJS** для экспорта данных

### Frontend
- **React** 19.2
- **MobX** для управления состоянием
- **React Router** 7 для маршрутизации
- **Axios** для HTTP-запросов

### Инфраструктура
- **Docker** и **Docker Compose** для контейнеризации
- **Nginx** как reverse proxy

## Функциональность

### Для участников
- Регистрация с подтверждением email
- Индивидуальное или командное участие
- Создание и управление командами
- Присоединение к команде по пригласительной ссылке
- Личный кабинет с информацией о регистрации
- Просмотр результатов чемпионата по годам
- Просмотр галереи фотографий с чемпионата
- Скачивание сертификатов из личного кабинета
- Получение email уведомлений о готовности сертификата и о победе
- Восстановление пароля

### Для администраторов
- **Панель управления** с общей статистикой
- **Управление участниками**: просмотр, редактирование, экспорт в Excel, удаление, фильтрация по классам и формату участия
- **Управление школами**: автоматический импорт из CSV
- **Управление аудиториями**: создание, редактирование, удаление
- **Рассадка участников**: автоматическое и ручное распределение по аудиториям, экспорт рассадки
- **Генерация сертификатов**: загрузка шаблонов и шрифтов, интерактивная настройка позиции текста, массовая выдача с фильтрацией, отправка уведомлений участникам
- **Файловый менеджер**: загрузка и управление файлами (регламенты, галерея и т.д.)
- **CMS**: управление контентом сайта
- **Настройки**: управление статусом регистрации, очистка данных для нового года
- **Управление результатами**: добавление, редактирование результатов по годам, автоматическое создание результатов из участников с местами, отправка уведомлений победителям

## Структура проекта

```
it-vysotka/
├── backend/                 # Backend приложение
│   ├── controllers/        # Контроллеры (обработка запросов)
│   ├── models/            # Модели Sequelize
│   ├── service/           # Бизнес-логика
│   ├── middlewares/       # Middleware (auth, validation, error)
│   ├── router/            # Маршруты API
│   ├── validation/        # Валидация запросов
│   ├── exceptions/        # Обработка ошибок
│   ├── dtos/              # Data Transfer Objects
│   ├── scripts/           # Вспомогательные скрипты
│   ├── files/             # Загруженные файлы
│   ├── db.js              # Конфигурация БД
│   ├── server.js          # Точка входа
│   └── Dockerfile         # Docker образ для backend
│
├── frontend/
│   └── app/               # React приложение
│       ├── src/
│       │   ├── components/    # React компоненты
│       │   ├── pages/         # Страницы приложения
│       │   │   └── admin/     # Страницы админ-панели
│       │   ├── services/      # Сервисы для API
│       │   ├── store/         # MobX store
│       │   ├── http/          # HTTP клиент
│       │   └── styles/        # CSS стили
│       ├── public/            # Статические файлы
│       └── Dockerfile         # Docker образ для frontend
│
├── db/                    # Данные PostgreSQL (volume)
├── docker-compose.yml      # Конфигурация Docker Compose
├── nginx.conf             # Конфигурация Nginx
└── README.md              # Документация
```

## Установка и запуск

### Требования

- Docker и Docker Compose
- Git

### Быстрый старт

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd it-vysotka
```

2. **Создайте файл `.env` в корне проекта:**
```env
# База данных
DB_HOST=db
DB_NAME=it_vysotka
DB_USER=admin
DB_PASSWORD=your_secure_password
DB_PORT=5432

# JWT секреты
JWT_ACCESS_SECRET=your_access_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_RESET_SECRET=your_reset_secret_key_min_32_chars
JWT_ACTIVATION_SECRET=your_activation_secret_key_min_32_chars

# SMTP настройки (для отправки email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Администратор (создается автоматически при первом запуске)
ADMIN_EMAIL=admin@it-vysotka.ru
ADMIN_PASSWORD=admin123

# URL сайта (для ссылок в email)
URL=http://localhost

# API URL для frontend
REACT_APP_API_URL=http://localhost

# Порт backend (опционально)
PORT=4000
```

3. **Запустите приложение:**
```bash
docker-compose up -d
```

4. **Приложение будет доступно по адресу:**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - PostgreSQL: localhost:5431

### Первый вход

После первого запуска автоматически создается администратор:
- **Email**: значение из `ADMIN_EMAIL` (по умолчанию `admin@it-vysotka.ru`)
- **Пароль**: значение из `ADMIN_PASSWORD` (по умолчанию `admin123`)

**Важно**: Обязательно смените пароль администратора после первого входа!

## Конфигурация

### Переменные окружения

#### База данных
- `DB_HOST` - хост PostgreSQL (в Docker: `db`)
- `DB_NAME` - имя базы данных
- `DB_USER` - пользователь PostgreSQL
- `DB_PASSWORD` - пароль PostgreSQL
- `DB_PORT` - порт PostgreSQL (по умолчанию 5432)

#### JWT токены
Все секреты должны быть длиной минимум 32 символа для безопасности:
- `JWT_ACCESS_SECRET` - секрет для access токенов (15 минут)
- `JWT_REFRESH_SECRET` - секрет для refresh токенов (30 дней)
- `JWT_RESET_SECRET` - секрет для токенов сброса пароля (15 минут)
- `JWT_ACTIVATION_SECRET` - секрет для токенов активации (7 дней)

#### Email (SMTP)
- `SMTP_HOST` - SMTP сервер (например, `smtp.gmail.com`)
- `SMTP_PORT` - порт SMTP (обычно 465 для SSL)
- `SMTP_USER` - email для отправки писем
- `SMTP_PASSWORD` - пароль или app password для email

#### Администратор
- `ADMIN_EMAIL` - email администратора
- `ADMIN_PASSWORD` - пароль администратора (будет захеширован)

#### Frontend и URL
- `URL` - базовый URL сайта для генерации ссылок в email (например, `http://localhost` или `https://it-vysotka.rusoil.net`)
- `REACT_APP_API_URL` - URL API для frontend (например, `http://localhost` или `https://it-vysotka.rusoil.net`)

### Импорт школ

При первом запуске автоматически импортируются школы из файла `backend/educational_orgs_russia.csv`. Для ручного импорта:

```bash
docker-compose exec backend npm run import-schools
```

### Создание тестовых данных

Для разработки можно создать тестовые данные:

```bash
docker-compose exec backend npm run seed
```

## API

### Аутентификация
- `POST /api/registration` - Регистрация нового пользователя
- `POST /api/login` - Вход в систему
- `POST /api/logout` - Выход из системы
- `GET /api/activate/:link` - Активация аккаунта по ссылке
- `POST /api/refresh` - Обновление токена доступа

### Управление паролем
- `POST /api/password/reset/request` - Запрос на сброс пароля
- `POST /api/password/reset` - Сброс пароля по токену

### Профиль
- `GET /api/user/profile` - Получить профиль текущего пользователя
- `PUT /api/user/participation-format` - Изменить формат участия
- `PUT /api/user/essay-url` - Обновить ссылку на эссе

### Команды
- `POST /api/team/create` - Создать команду
- `GET /api/team/join/:inviteToken` - Присоединиться к команде (по ссылке)
- `POST /api/team/join/:inviteToken` - Присоединиться к команде (API)
- `GET /api/team/my` - Получить информацию о своей команде
- `POST /api/team/leave` - Покинуть команду
- `DELETE /api/team/kick/:userId` - Исключить участника из команды
- `DELETE /api/team/delete` - Удалить команду

### Школы
- `GET /api/schools/regions` - Получить список регионов
- `GET /api/schools/cities` - Получить список городов
- `GET /api/schools` - Получить список школ

### Админ-панель

#### Участники
- `GET /api/admin/participants` - Список всех участников
- `GET /api/admin/participants/stats` - Статистика по участникам
- `GET /api/admin/participants/export` - Экспорт в Excel
- `GET /api/admin/participants/:id` - Информация об участнике
- `PUT /api/admin/participants/:id/place` - Установить место участника
- `DELETE /api/admin/participants/:id` - Удалить участника

#### Аудитории
- `POST /api/admin/rooms` - Создать аудиторию
- `GET /api/admin/rooms` - Список аудиторий
- `GET /api/admin/rooms/:id` - Информация об аудитории
- `PUT /api/admin/rooms/:id` - Обновить аудиторию
- `DELETE /api/admin/rooms/:id` - Удалить аудиторию

#### Рассадка
- `POST /api/admin/seating/auto-assign` - Автоматическая рассадка
- `GET /api/admin/seating` - Получить рассадку
- `GET /api/admin/seating/export` - Экспорт рассадки в Excel
- `GET /api/admin/seating/unassigned` - Не распределенные участники
- `POST /api/admin/seating/add-unassigned` - Добавить нераспределенных
- `DELETE /api/admin/seating/clear` - Очистить рассадку
- `POST /api/admin/seating/assign` - Назначить участника вручную
- `POST /api/admin/seating/remove` - Удалить назначение

#### Сертификаты
- `POST /api/admin/certificates/upload-template` - Загрузить шаблон сертификата
- `POST /api/admin/certificates/upload-font` - Загрузить шрифт
- `GET /api/admin/certificates/settings` - Настройки сертификатов
- `PUT /api/admin/certificates/settings` - Обновить настройки
- `GET /api/admin/certificates/template` - Получить шаблон
- `GET /api/admin/certificates/preview` - Предпросмотр сертификата с тестовым текстом
- `POST /api/admin/certificates/issue` - Выдать сертификаты выбранным участникам
- `POST /api/admin/certificates/send-notifications` - Отправить email уведомления участникам с выданными сертификатами
- `GET /api/admin/certificates/participants` - Список участников для выдачи сертификатов с фильтрацией

#### Файлы
- `POST /api/admin/files/upload` - Загрузить файл
- `GET /api/admin/files` - Список файлов
- `GET /api/admin/files/stats` - Статистика файлов
- `GET /api/admin/files/:id` - Информация о файле
- `PUT /api/admin/files/:id` - Обновить файл
- `DELETE /api/admin/files/:id` - Удалить файл

#### Настройки
- `GET /api/admin/settings` - Получить настройки
- `PUT /api/admin/settings` - Обновить настройки
- `POST /api/admin/settings/clear-data` - Очистить данные для нового года

#### Результаты
- `GET /api/admin/results` - Все результаты
- `POST /api/admin/results` - Создать результат вручную
- `POST /api/admin/results/from-participants` - Автоматически создать результаты из участников с присвоенными местами
- `POST /api/admin/results/send-winner-notifications` - Отправить email уведомления победителям (1-3 места)
- `PUT /api/admin/results/:id` - Обновить результат
- `DELETE /api/admin/results/:id` - Удалить результат

### Публичные эндпоинты
- `GET /api/settings/registration-status` - Статус регистрации
- `GET /api/files/type/:type` - Файлы по типу
- `GET /api/results/years` - Список годов с результатами
- `GET /api/results/year/:year` - Результаты по году
- `GET /certificates/download/:participantId` - Скачать сертификат

## Разработка

### Локальная разработка без Docker

#### Backend

1. Установите зависимости:
```bash
cd backend
npm install
```

2. Настройте PostgreSQL и создайте базу данных

3. Создайте `.env` файл в папке `backend`

4. Запустите сервер:
```bash
npm start
# или
node server.js
```

#### Frontend

1. Установите зависимости:
```bash
cd frontend/app
npm install
```

2. Создайте `.env` файл:
```env
REACT_APP_API_URL=http://localhost:4000/api
```

3. Запустите dev-сервер:
```bash
npm start
```

### Полезные команды

```bash
# Просмотр логов
docker-compose logs -f

# Перезапуск сервиса
docker-compose restart backend

# Выполнение команды в контейнере
docker-compose exec backend npm run import-schools

# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes
docker-compose down -v
```

### Структура базы данных

Основные модели:
- **User** - пользователи (участники и администраторы)
- **Team** - команды
- **School** - школы
- **Room** - аудитории
- **SeatingAssignment** - рассадка участников
- **Settings** - настройки системы
- **File** - загруженные файлы
- **ChampionshipResult** - результаты чемпионата
- **Token** - токены (refresh, reset, activation)

## Лицензия

ISC License (лицензия с открытым исходным кодом, разрешающая использование, изменение и распространение кода с минимальными ограничениями).

## Авторы

Проект разработан **Мустаевым Венером** и **Якшибаевым Даниром** в рамках выполнения комплексной выпускной квалификационной работы для кафедры ВТИК УГНТУ.

---

**Примечание**: При первом запуске убедитесь, что все переменные окружения настроены корректно, особенно секреты JWT и настройки SMTP для отправки email.
