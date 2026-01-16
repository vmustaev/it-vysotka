# 🔐 Middleware для проверки прав доступа

## Обзор

В проекте используются middleware для защиты API эндпоинтов и проверки прав доступа пользователей.

---

## 📚 Доступные Middleware

### 1. `auth-middleware.js`
**Назначение:** Проверка авторизации пользователя

**Что проверяет:**
- ✅ Наличие Authorization заголовка
- ✅ Валидность access токена
- ✅ Наличие активной сессии (refresh token в БД)

**Результат:**
- Добавляет данные пользователя в `req.user`
- Возвращает 401 Unauthorized при ошибке

**Использование:**
```javascript
router.get('/profile', authMiddleware, userController.getProfile);
```

---

### 2. `admin-middleware.js` ⭐ (Новый)
**Назначение:** Проверка прав администратора

**Что проверяет:**
- ✅ Пользователь авторизован (req.user существует)
- ✅ Роль пользователя = 'admin'

**Результат:**
- Пропускает запрос дальше, если пользователь - админ
- Возвращает 403 Forbidden, если права недостаточны

**⚠️ ВАЖНО:** Используется ТОЛЬКО после `authMiddleware`!

**Использование:**
```javascript
// ✅ ПРАВИЛЬНО - сначала auth, потом admin
router.get('/admin/participants', authMiddleware, adminMiddleware, controller.getAll);

// ❌ НЕПРАВИЛЬНО - admin без auth
router.get('/admin/participants', adminMiddleware, controller.getAll);
```

---

### 3. `validation-middleware.js`
**Назначение:** Валидация входных данных

**Что проверяет:**
- ✅ Результаты валидации из express-validator
- ✅ Форматирование ошибок для фронтенда

---

### 4. `error-middleware.js`
**Назначение:** Обработка ошибок

**Что делает:**
- 📝 Логирует ошибки
- 📤 Отправляет форматированный ответ клиенту

---

## 🎯 Сценарии использования

### Публичные роуты (без защиты)
```javascript
router.get('/schools/regions', schoolController.getRegions);
router.get('/gallery', galleryController.getPhotos);
```

### Роуты для авторизованных пользователей
```javascript
router.get('/user/profile', authMiddleware, userController.getProfile);
router.get('/team/my', authMiddleware, teamController.getMyTeam);
router.post('/team/create', authMiddleware, teamController.create);
```

### Роуты только для администраторов
```javascript
// Получить всех участников
router.get('/admin/participants', authMiddleware, adminMiddleware, participantsController.getAll);

// Экспорт в Excel
router.get('/admin/participants/export', authMiddleware, adminMiddleware, participantsController.exportToExcel);

// Управление аудиториями
router.post('/admin/rooms', authMiddleware, adminMiddleware, roomsController.create);
router.put('/admin/rooms/:id', authMiddleware, adminMiddleware, roomsController.update);
router.delete('/admin/rooms/:id', authMiddleware, adminMiddleware, roomsController.delete);

// Рассадка
router.post('/admin/seating/auto', authMiddleware, adminMiddleware, seatingController.autoAssign);

// Настройки
router.put('/admin/settings/registration', authMiddleware, adminMiddleware, settingsController.toggleRegistration);

// CMS
router.post('/admin/cms/upload', authMiddleware, adminMiddleware, cmsController.uploadFile);

// Логи
router.get('/admin/logs', authMiddleware, adminMiddleware, logsController.getAll);
```

---

## 🔑 Структура req.user

После прохождения `authMiddleware`, в `req.user` доступны:

```javascript
{
  id: 1,
  email: "user@example.com",
  isActivated: true,
  first_name: "Иван",
  last_name: "Иванов",
  second_name: "Иванович",
  role: "admin" // или "participant"
}
```

---

## ⚠️ Коды ошибок

| Код | Ошибка | Описание |
|-----|--------|----------|
| 401 | Unauthorized | Пользователь не авторизован |
| 403 | Forbidden | Недостаточно прав (не админ) |
| 400 | Bad Request | Некорректные данные |
| 500 | Internal Server Error | Ошибка сервера |

---

## 📝 Примеры ответов

### Успешный запрос
```json
{
  "success": true,
  "data": { ... }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Пользователь не авторизован"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Доступ запрещен. Требуются права администратора."
}
```

---

## 🔧 Расширение функционала

### Добавление новых ролей

Если в будущем потребуется больше ролей (например, `moderator`):

1. Обновить enum в `user-model.js`:
```javascript
role: {
    type: DataTypes.ENUM('participant', 'admin', 'moderator'),
    defaultValue: 'participant'
}
```

2. Создать новый middleware (например, `moderator-middleware.js`):
```javascript
module.exports = async function (req, res, next) {
    if (!req.user) {
        return next(ApiError.UnauthorizedError());
    }

    // Модератор или админ
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
        return next(ApiError.Forbidden('Требуются права модератора'));
    }

    next();
}
```

---

## ✅ Чек-лист для новых эндпоинтов

При создании нового эндпоинта спросите себя:

- [ ] Нужна ли авторизация? → `authMiddleware`
- [ ] Только для админа? → `authMiddleware + adminMiddleware`
- [ ] Нужна валидация данных? → добавьте validation схему
- [ ] Логирование действий? → добавьте в контроллер

---

## 🧪 Тестирование

### Проверка прав администратора

**Тест 1: Обычный пользователь пытается получить доступ к админке**
```bash
# Логин под обычным пользователем
POST /api/login
{
  "email": "participant@example.com",
  "password": "password"
}

# Попытка доступа к админскому эндпоинту
GET /api/admin/participants
Authorization: Bearer <access_token>

# Ожидаемый результат: 403 Forbidden
```

**Тест 2: Админ получает доступ**
```bash
# Логин под админом
POST /api/login
{
  "email": "admin@it-vysotka.ru",
  "password": "admin123"
}

# Доступ к админскому эндпоинту
GET /api/admin/participants
Authorization: Bearer <access_token>

# Ожидаемый результат: 200 OK + данные
```

---

## 🚀 Готово к использованию!

Теперь все админские эндпоинты защищены `admin-middleware`.

При разработке новых функций админ-панели:
1. Создайте контроллер
2. Добавьте роут с `authMiddleware, adminMiddleware`
3. Тестируйте доступ под разными ролями

