module.exports = {
    // Общие ошибки
    VALIDATION_ERROR: 'Ошибка валидации данных',
    UNAUTHORIZED: 'Пользователь не авторизован',
    INTERNAL_ERROR: 'Непредвиденная ошибка',
    
    // Email ошибки
    EMAIL_REQUIRED: 'Email обязателен',
    EMAIL_INVALID: 'Введите корректный email',
    EMAIL_EXISTS: 'Пользователь с таким email уже существует',
    EMAIL_NOT_FOUND: 'Пользователь с таким email не найден',
    
    // Пароль ошибки
    PASSWORD_REQUIRED: 'Пароль обязателен',
    PASSWORD_LENGTH: 'Пароль должен быть от 8 до 32 символов',
    PASSWORD_COMPLEXITY: 'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру',
    PASSWORD_MISMATCH: 'Пароли не совпадают',
    PASSWORD_INCORRECT: 'Неверный пароль',
    
    // Личные данные
    LAST_NAME_REQUIRED: 'Фамилия обязательна',
    LAST_NAME_CYRILLIC: 'Фамилия должна содержать только русские буквы',
    
    FIRST_NAME_REQUIRED: 'Имя обязательно',
    FIRST_NAME_CYRILLIC: 'Имя должно содержать только русские буквы',
    
    SECOND_NAME_CYRILLIC: 'Отчество должно содержать только русские буквы',
    
    // Телефон
    PHONE_REQUIRED: 'Телефон обязателен',
    PHONE_INVALID: 'Неверный формат телефона',
    PHONE_EXISTS: 'Пользователь с таким номером телефона уже существует',
    
    // Дата рождения
    BIRTHDAY_REQUIRED: 'Дата рождения обязательна',
    BIRTHDAY_INVALID: 'Неверный формат даты',
    BIRTHDAY_AGE: 'Возраст должен быть от 14 лет',
    
    // Другие поля
    REGION_REQUIRED: 'Регион обязателен',
    CITY_REQUIRED: 'Город обязателен',
    SCHOOL_REQUIRED: 'Школа обязательна',
    PROGRAMMING_LANGUAGE_REQUIRED: 'Язык программирования обязателен',
    PROGRAMMING_LANGUAGE_INVALID: 'Неверный формат. Допустимо: C++ или Python или Java',
    GRADE_REQUIRED: 'Класс обязателен',
    GRADE_INVALID: 'Класс должен быть от 9 до 11',
    
    // Аккаунт
    ACTIVATION_LINK_INVALID: 'Некорректная ссылка активации',
    REFRESH_TOKEN_REQUIRED: 'Токен обновления отсутствует',
    REFRESH_TOKEN_INVALID: 'Токен обновления недействителен'
};