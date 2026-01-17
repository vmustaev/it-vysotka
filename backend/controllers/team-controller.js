const teamService = require('../service/team-service');
const tokenService = require('../service/token-service');
const ApiError = require('../exceptions/api-error');

class TeamController {
    // Создание команды
    async create(req, res, next) {
        try {
            const { name } = req.body;
            const userId = req.user.id;

            // Валидация уже происходит в middleware и сервисе
            const team = await teamService.createTeam(name.trim(), userId);
            return res.json({
                success: true,
                message: 'Команда успешно создана!',
                data: team
            });
        } catch (e) {
            next(e);
        }
    }

    // Присоединение к команде по токену
    async join(req, res, next) {
        try {
            const { inviteToken } = req.params;
            const userId = req.user.id;

            const team = await teamService.joinTeam(inviteToken, userId);
            return res.json({
                success: true,
                message: 'Вы успешно присоединились к команде!',
                data: team
            });
        } catch (e) {
            next(e);
        }
    }

    // Получение информации о своей команде
    async getMyTeam(req, res, next) {
        try {
            const userId = req.user.id;

            const team = await teamService.getUserTeam(userId);
            if (!team) {
                return res.json({ 
                    success: true,
                    data: null, 
                    message: 'Вы не состоите в команде' 
                });
            }

            return res.json({
                success: true,
                data: team
            });
        } catch (e) {
            next(e);
        }
    }

    // Выход из команды
    async leave(req, res, next) {
        try {
            const userId = req.user.id;

            const result = await teamService.leaveTeam(userId);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }

    // Исключение участника (только капитан)
    async kickMember(req, res, next) {
        try {
            const { userId: memberUserId } = req.params;
            const captainId = req.user.id;

            // Валидация userId
            const parsedUserId = parseInt(memberUserId);
            if (isNaN(parsedUserId) || parsedUserId <= 0) {
                throw ApiError.BadRequest(
                    'Некорректный ID пользователя',
                    ['Некорректный ID пользователя']
                );
            }

            const result = await teamService.kickMember(captainId, parsedUserId);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }

    // Удаление команды (только капитан)
    async delete(req, res, next) {
        try {
            const captainId = req.user.id;

            const result = await teamService.deleteTeam(captainId);
            return res.json(result);
        } catch (e) {
            next(e);
        }
    }

    // Присоединение к команде по ссылке (GET, как активация)
    async joinByLink(req, res, next) {
        try {
            const { inviteToken } = req.params;
            
            // Пытаемся получить пользователя из refresh token (если авторизован)
            const { refreshToken } = req.cookies;
            let userId = null;

            if (refreshToken) {
                const userData = tokenService.validateToken(refreshToken, 'refresh');
                if (userData) {
                    // Проверяем, что токен есть в БД
                    const tokenFromDb = await tokenService.findToken(refreshToken, 'refresh');
                    if (tokenFromDb) {
                        userId = userData.id;
                    }
                }
            }

            // Если пользователь не авторизован, редиректим на логин
            if (!userId) {
                return res.redirect(`${process.env.URL}/login?teamToken=${inviteToken}`);
            }

            // Пытаемся присоединить к команде
            try {
                await teamService.joinTeam(inviteToken, userId);
                // Успешно присоединились - редирект на профиль
                return res.redirect(`${process.env.URL}/profile?joined=true`);
            } catch (e) {
                // Ошибка присоединения - редирект с ошибкой
                const errorMessage = encodeURIComponent(e.message || 'Ошибка присоединения к команде');
                return res.redirect(`${process.env.URL}/profile?join_error=${errorMessage}`);
            }
        } catch (e) {
            // Общая ошибка - редирект на главную
            return res.redirect(`${process.env.URL}/?team_join_error=true`);
        }
    }

    // Получить все команды (для админки)
    async getAllTeams(req, res, next) {
        try {
            const teams = await teamService.getAllTeams();
            return res.json({
                success: true,
                data: teams
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new TeamController();
