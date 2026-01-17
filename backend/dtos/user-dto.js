// UserDto используется для JWT токенов - содержит только критически важные данные
// Остальную информацию получаем через API запросы (getProfile и т.д.)
module.exports = class UserDto {
    id;              // Идентификатор пользователя (обязательно)
    email;           // Email для удобства
    role;            // Роль (admin/participant) - для авторизации
    isActivated;     // Статус активации - для проверки доступа

    constructor(model) {
        this.id = model.id;
        this.email = model.email;
        this.role = model.role;
        this.isActivated = model.isActivated;
    }
}