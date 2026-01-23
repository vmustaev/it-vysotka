const bcrypt = require('bcrypt');
const UserModel = require('../models/user-model');
const TeamModel = require('../models/team-model');
const sequelize = require('../db');

// Тестовые данные
const testParticipants = [
    { lastName: 'Иванов', firstName: 'Иван', secondName: 'Иванович', emailName: 'ivan.ivanov', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Петров', firstName: 'Петр', secondName: 'Петрович', emailName: 'petr.petrov', grade: 10, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Сидоров', firstName: 'Сидор', secondName: 'Сидорович', emailName: 'sidor.sidorov', grade: 11, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Козлов', firstName: 'Андрей', secondName: 'Андреевич', emailName: 'andrey.kozlov', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Северобайкальск' },
    { lastName: 'Смирнова', firstName: 'Анна', secondName: 'Александровна', emailName: 'anna.smirnova', grade: 10, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Кузнецов', firstName: 'Дмитрий', secondName: 'Дмитриевич', emailName: 'dmitry.kuznetsov', grade: 11, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Новиков', firstName: 'Николай', secondName: 'Николаевич', emailName: 'nikolay.novikov', grade: 8, language: 'Python', region: 'Республика Бурятия', city: 'Гусиноозерск' },
    { lastName: 'Морозова', firstName: 'Мария', secondName: 'Михайловна', emailName: 'maria.morozova', grade: 9, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Соколов', firstName: 'Алексей', secondName: 'Алексеевич', emailName: 'alexey.sokolov', grade: 10, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Лебедев', firstName: 'Сергей', secondName: 'Сергеевич', emailName: 'sergey.lebedev', grade: 11, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Волкова', firstName: 'Ольга', secondName: 'Олеговна', emailName: 'olga.volkova', grade: 9, language: 'Java', region: 'Республика Бурятия', city: 'Закаменск' },
    { lastName: 'Семенов', firstName: 'Семен', secondName: 'Семенович', emailName: 'semen.semenov', grade: 10, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Егоров', firstName: 'Егор', secondName: 'Егорович', emailName: 'egor.egorov', grade: 8, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Павлова', firstName: 'Екатерина', secondName: 'Павловна', emailName: 'ekaterina.pavlova', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Федоров', firstName: 'Федор', secondName: 'Федорович', emailName: 'fedor.fedorov', grade: 11, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Романов', firstName: 'Роман', secondName: 'Романович', emailName: 'roman.romanov', grade: 10, language: 'C++', region: 'Республика Бурятия', city: 'Кяхта' },
    { lastName: 'Васильева', firstName: 'Вера', secondName: 'Васильевна', emailName: 'vera.vasileva', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Михайлов', firstName: 'Михаил', secondName: 'Михайлович', emailName: 'mikhail.mikhaylov', grade: 11, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Александрова', firstName: 'Александра', secondName: 'Александровна', emailName: 'alexandra.alexandrova', grade: 10, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Никитин', firstName: 'Никита', secondName: 'Никитович', emailName: 'nikita.nikitin', grade: 8, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Григорьев', firstName: 'Григорий', secondName: 'Григорьевич', emailName: 'grigoriy.grigorev', grade: 9, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Борисова', firstName: 'Борислава', secondName: 'Борисовна', emailName: 'borislava.borisova', grade: 10, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Яковлев', firstName: 'Яков', secondName: 'Яковлевич', emailName: 'yakov.yakovlev', grade: 11, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Давыдова', firstName: 'Дарья', secondName: 'Давыдовна', emailName: 'darya.davydova', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Герасимов', firstName: 'Геннадий', secondName: 'Геннадьевич', emailName: 'gennadiy.gerasimov', grade: 10, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Тихонова', firstName: 'Татьяна', secondName: 'Тихоновна', emailName: 'tatiana.tikhonova', grade: 8, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Макаров', firstName: 'Максим', secondName: 'Максимович', emailName: 'maksim.makarov', grade: 9, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Антонова', firstName: 'Антонина', secondName: 'Антоновна', emailName: 'antonina.antonova', grade: 11, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Денисов', firstName: 'Денис', secondName: 'Денисович', emailName: 'denis.denisov', grade: 10, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Степанова', firstName: 'Степанида', secondName: 'Степановна', emailName: 'stepanida.stepanova', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Орлов', firstName: 'Олег', secondName: 'Олегович', emailName: 'oleg.orlov', grade: 10, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Зайцева', firstName: 'Зоя', secondName: 'Зоевна', emailName: 'zoya.zaytseva', grade: 11, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Белов', firstName: 'Борис', secondName: 'Борисович', emailName: 'boris.belov', grade: 9, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Краснова', firstName: 'Кристина', secondName: 'Кристиновна', emailName: 'kristina.krasnova', grade: 10, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Чернов', firstName: 'Чарльз', secondName: 'Чарльзович', emailName: 'charles.chernov', grade: 8, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Белая', firstName: 'Белла', secondName: 'Белловна', emailName: 'bella.belaya', grade: 11, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Зеленов', firstName: 'Зенон', secondName: 'Зенонович', emailName: 'zenon.zelenov', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Синяя', firstName: 'Сильвия', secondName: 'Сильвиевна', emailName: 'sylvia.sinyaya', grade: 10, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Жуков', firstName: 'Жан', secondName: 'Жанович', emailName: 'zhan.zhukov', grade: 11, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Воробьева', firstName: 'Виктория', secondName: 'Викторовна', emailName: 'victoria.vorobyeva', grade: 8, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Соловьев', firstName: 'Соломон', secondName: 'Соломонович', emailName: 'solomon.solovev', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Ласточкина', firstName: 'Лариса', secondName: 'Ларисовна', emailName: 'larisa.lastochkina', grade: 10, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Щукин', firstName: 'Щука', secondName: 'Щукович', emailName: 'shchuka.shchukin', grade: 11, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Рыбкина', firstName: 'Рыбка', secondName: 'Рыбковна', emailName: 'rybka.rybkina', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Медведев', firstName: 'Медведь', secondName: 'Медведевич', emailName: 'medved.medvedev', grade: 10, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Лисова', firstName: 'Лисица', secondName: 'Лисична', emailName: 'lisitsa.lisova', grade: 8, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Волков', firstName: 'Волк', secondName: 'Волкович', emailName: 'volk.volkov', grade: 11, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Зайцева', firstName: 'Зайчиха', secondName: 'Зайчишна', emailName: 'zaychikha.zaytseva2', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' }
];

const schools = [
    'МАОУ "Гимназия №33 г. Улан-Удэ"',
    'МБОУ "СОШ №9 г. Улан-Удэ"',
    'МБОУ "СОШ №19 г. Улан-Удэ"',
    'МБОУ "Лицей №27 г. Улан-Удэ"',
    'МАОУ "СОШ №65 г. Улан-Удэ"',
    'МБОУ "СОШ №1 г. Улан-Удэ"',
    'МАОУ "Гимназия №14 г. Улан-Удэ"',
    'МБОУ "СОШ №32 г. Улан-Удэ"',
    'МБОУ "Лицей №1 г. Улан-Удэ"',
    'МАОУ "СОШ №49 г. Улан-Удэ"',
    'МБОУ "СОШ №18 г. Улан-Удэ"',
    'МАОУ "Гимназия №59 г. Улан-Удэ"'
];

const teams = [
    'Команда Альфа',
    'Код Мастера',
    'Байкальские кодеры',
    'Python Ninjas',
    'CodeWarriors',
    'Java Developers',
    'Tech Titans',
    'Digital Wizards',
    'Cyber Knights',
    'Algorithm Heroes',
    'Byte Masters',
    'Code Legends'
];

async function seedTestData() {
    try {
        await sequelize.authenticate();
        console.log('🔌 Подключено к БД');

        // Проверяем, есть ли уже тестовые данные
        const existingCount = await UserModel.count({
            where: { role: 'participant' }
        });

        if (existingCount > 0) {
            console.log(`⚠️  В БД уже есть ${existingCount} участников`);
            console.log('🗑️  Удаление существующих данных...');
            await UserModel.destroy({ where: { role: 'participant' } });
            await TeamModel.destroy({ where: {} });
            console.log('✅ Старые данные удалены');
        }

        const hashedPassword = await bcrypt.hash('password123', 3);

        // Создаем участников
        console.log('\n👥 Создание участников...');
        const createdUsers = [];

        // Распределение участников:
        // - 12 команд по 3 человека = 36 участников в командах
        // - 8 участников с форматом "team", но без команды (могут присоединиться)
        // - 6 участников с форматом "individual"
        const numTeams = 12;
        const usersInTeams = 36;
        const teamFormatNoTeam = 8; // Участники с "team", но без команды

        for (let i = 0; i < testParticipants.length; i++) {
            const participant = testParticipants[i];
            const email = `${participant.emailName}@test.com`;
            const phone = `+7 (${900 + i}) ${100 + i}-${10 + i}-${20 + i}`;
            const school = schools[i % schools.length];

            // Определяем формат участия:
            // - 0-43: формат "team" (36 будут в командах, 8 без команды)
            // - 44-49: формат "individual"
            const participationFormat = i < (usersInTeams + teamFormatNoTeam) ? 'team' : 'individual';

            const user = await UserModel.create({
                email,
                password: hashedPassword,
                isActivated: true, // Сразу активируем для теста
                role: 'participant',
                last_name: participant.lastName,
                first_name: participant.firstName,
                second_name: participant.secondName,
                birthday: `200${7 + (i % 3)}-0${(i % 9) + 1}-${10 + (i % 20)}`,
                region: participant.region,
                city: participant.city,
                school,
                programming_language: participant.language,
                phone,
                grade: participant.grade,
                participation_format: participationFormat
            });

            createdUsers.push(user);
            process.stdout.write(`  ${i + 1}/${testParticipants.length} `);
        }

        console.log('\n✅ Создано участников:', createdUsers.length);

        // Создаем команды и распределяем участников
        console.log('\n👥 Создание команд...');
        const createdTeams = [];
        let userIndex = 0; // Индекс для распределения участников по командам

        for (let i = 0; i < numTeams; i++) {
            const team = await TeamModel.create({
                name: teams[i],
                inviteToken: `test-token-${i + 1}-${Date.now()}`
            });
            createdTeams.push(team);

            // Добавляем по 3 участника в каждую команду
            const teamSize = 3;

            for (let j = 0; j < teamSize && userIndex < usersInTeams; j++) {
                const user = createdUsers[userIndex];
                user.teamId = team.id;
                user.isLead = j === 0; // Первый участник - лидер
                await user.save();
                userIndex++;
            }

            console.log(`  ✓ ${team.name} (${teamSize} участников)`);
        }

        console.log('✅ Создано команд:', createdTeams.length);

        // Статистика
        console.log('\n📊 Статистика:');
        const totalParticipants = await UserModel.count({ where: { role: 'participant' } });
        const activatedParticipants = await UserModel.count({ where: { role: 'participant', isActivated: true } });
        const withTeam = await UserModel.count({ where: { role: 'participant', teamId: { [require('sequelize').Op.ne]: null } } });
        const individualFormat = await UserModel.count({ where: { role: 'participant', participation_format: 'individual' } });
        const teamFormat = await UserModel.count({ where: { role: 'participant', participation_format: 'team' } });
        const teamFormatWithoutTeam = await UserModel.count({ 
            where: { 
                role: 'participant', 
                participation_format: 'team',
                teamId: null
            } 
        });

        console.log(`  • Всего участников: ${totalParticipants}`);
        console.log(`  • Активированных: ${activatedParticipants}`);
        console.log(`  • Команд: ${createdTeams.length}`);
        console.log(`  • Участников в командах: ${withTeam}`);
        console.log(`  • Формат "team": ${teamFormat} (из них без команды: ${teamFormatWithoutTeam})`);
        console.log(`  • Формат "individual": ${individualFormat}`);

        console.log('\n🎉 Тестовые данные успешно созданы!');
        console.log('\n📧 Данные для входа:');
        console.log('\n  👤 Лидер команды (может управлять командой):');
        console.log('     Email: ivan.ivanov@test.com');
        console.log('     Пароль: password123');
        console.log('\n  👥 Участник команды (не лидер):');
        console.log('     Email: petr.petrov@test.com');
        console.log('     Пароль: password123');
        console.log('\n  🔍 Участник с форматом "team" БЕЗ команды (может присоединиться):');
        console.log('     Email: gennadiy.gerasimov@test.com');
        console.log('     Пароль: password123');
        console.log('\n  ⭐ Участник с форматом "individual":');
        console.log('     Email: denis.denisov@test.com');
        console.log('     Пароль: password123');
        console.log('\n  👑 Админ:');
        console.log('     Email: admin@it-vysotka.ru');
        console.log('     Пароль: admin123 (или из .env)');

    } catch (error) {
        console.error('❌ Ошибка при создании тестовых данных:', error);
    } finally {
        process.exit(0);
    }
}

seedTestData();

