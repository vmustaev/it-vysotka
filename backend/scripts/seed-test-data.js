const bcrypt = require('bcrypt');
const UserModel = require('../models/user-model');
const TeamModel = require('../models/team-model');
const sequelize = require('../db');

// Тестовые данные
const testParticipants = [
    { lastName: 'Иванов', firstName: 'Иван', secondName: 'Иванович', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Петров', firstName: 'Петр', secondName: 'Петрович', grade: 10, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Сидоров', firstName: 'Сидор', secondName: 'Сидорович', grade: 11, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Козлов', firstName: 'Андрей', secondName: 'Андреевич', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Северобайкальск' },
    { lastName: 'Смирнова', firstName: 'Анна', secondName: 'Александровна', grade: 10, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Кузнецов', firstName: 'Дмитрий', secondName: 'Дмитриевич', grade: 11, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Новиков', firstName: 'Николай', secondName: 'Николаевич', grade: 8, language: 'Python', region: 'Республика Бурятия', city: 'Гусиноозерск' },
    { lastName: 'Морозова', firstName: 'Мария', secondName: 'Михайловна', grade: 9, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Соколов', firstName: 'Алексей', secondName: 'Алексеевич', grade: 10, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Лебедев', firstName: 'Сергей', secondName: 'Сергеевич', grade: 11, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Волкова', firstName: 'Ольга', secondName: 'Олеговна', grade: 9, language: 'Java', region: 'Республика Бурятия', city: 'Закаменск' },
    { lastName: 'Семенов', firstName: 'Семен', secondName: 'Семенович', grade: 10, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Егоров', firstName: 'Егор', secondName: 'Егорович', grade: 8, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Павлова', firstName: 'Екатерина', secondName: 'Павловна', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Федоров', firstName: 'Федор', secondName: 'Федорович', grade: 11, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Романов', firstName: 'Роман', secondName: 'Романович', grade: 10, language: 'C++', region: 'Республика Бурятия', city: 'Кяхта' },
    { lastName: 'Васильева', firstName: 'Вера', secondName: 'Васильевна', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Михайлов', firstName: 'Михаил', secondName: 'Михайлович', grade: 11, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Александрова', firstName: 'Александра', secondName: 'Александровна', grade: 10, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Никитин', firstName: 'Никита', secondName: 'Никитович', grade: 8, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Григорьев', firstName: 'Григорий', secondName: 'Григорьевич', grade: 9, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Борисова', firstName: 'Борислава', secondName: 'Борисовна', grade: 10, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Яковлев', firstName: 'Яков', secondName: 'Яковлевич', grade: 11, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Давыдова', firstName: 'Дарья', secondName: 'Давыдовна', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Герасимов', firstName: 'Геннадий', secondName: 'Геннадьевич', grade: 10, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Тихонова', firstName: 'Татьяна', secondName: 'Тихоновна', grade: 8, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Макаров', firstName: 'Максим', secondName: 'Максимович', grade: 9, language: 'C++', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Антонова', firstName: 'Антонина', secondName: 'Антоновна', grade: 11, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Денисов', firstName: 'Денис', secondName: 'Денисович', grade: 10, language: 'Java', region: 'Республика Бурятия', city: 'Улан-Удэ' },
    { lastName: 'Степанова', firstName: 'Степанида', secondName: 'Степановна', grade: 9, language: 'Python', region: 'Республика Бурятия', city: 'Улан-Удэ' }
];

const schools = [
    'МАОУ "Гимназия №33 г. Улан-Удэ"',
    'МБОУ "СОШ №9 г. Улан-Удэ"',
    'МБОУ "СОШ №19 г. Улан-Удэ"',
    'МБОУ "Лицей №27 г. Улан-Удэ"',
    'МАОУ "СОШ №65 г. Улан-Удэ"'
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
    'Algorithm Heroes'
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

        for (let i = 0; i < testParticipants.length; i++) {
            const participant = testParticipants[i];
            const email = `${participant.firstName.toLowerCase()}.${participant.lastName.toLowerCase()}@test.ru`;
            const phone = `+7 (${900 + i}) ${100 + i}-${10 + i}-${20 + i}`;
            const school = schools[i % schools.length];

            // Назначаем формат участия: первые 15 участников - команды, остальные - индивидуально
            const participationFormat = i < 15 ? 'team' : 'individual';

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

        for (let i = 0; i < 10; i++) {
            const team = await TeamModel.create({
                name: teams[i],
                inviteToken: `test-token-${i + 1}-${Date.now()}`
            });
            createdTeams.push(team);

            // Добавляем 2-3 участника в команду
            const teamSize = 2 + (i % 2); // 2 или 3 участника
            const startIdx = i * 3;

            for (let j = 0; j < teamSize && (startIdx + j) < createdUsers.length; j++) {
                const user = createdUsers[startIdx + j];
                user.teamId = team.id;
                user.isLead = j === 0; // Первый участник - лидер
                await user.save();
            }

            console.log(`  ✓ ${team.name} (${teamSize} участников)`);
        }

        console.log('✅ Создано команд:', createdTeams.length);

        // Статистика
        console.log('\n📊 Статистика:');
        const totalParticipants = await UserModel.count({ where: { role: 'participant' } });
        const activatedParticipants = await UserModel.count({ where: { role: 'participant', isActivated: true } });
        const withTeam = await UserModel.count({ where: { role: 'participant', teamId: { [require('sequelize').Op.ne]: null } } });
        const withoutTeam = totalParticipants - withTeam;
        const individualFormat = await UserModel.count({ where: { role: 'participant', participation_format: 'individual' } });
        const teamFormat = await UserModel.count({ where: { role: 'participant', participation_format: 'team' } });

        console.log(`  • Всего участников: ${totalParticipants}`);
        console.log(`  • Активированных: ${activatedParticipants}`);
        console.log(`  • В командах: ${withTeam}`);
        console.log(`  • Без команды: ${withoutTeam}`);
        console.log(`  • Команд: ${createdTeams.length}`);
        console.log(`  • Формат участия (индивидуальное): ${individualFormat}`);
        console.log(`  • Формат участия (командное): ${teamFormat}`);

        console.log('\n🎉 Тестовые данные успешно созданы!');
        console.log('\n📧 Данные для входа (любой участник):');
        console.log('   Email: ivan.ivanov@test.ru');
        console.log('   Пароль: password123');
        console.log('\n📧 Админ:');
        console.log('   Email: admin@it-vysotka.ru');
        console.log('   Пароль: admin123 (или из .env)');

    } catch (error) {
        console.error('❌ Ошибка при создании тестовых данных:', error);
    } finally {
        process.exit(0);
    }
}

seedTestData();

