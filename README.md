# Timetable
Web application that allows you to monitor the schedule at the university.
Node.js with database

Платформа Node.js
Node.js — платформа для создания серверной части веб-приложений.

Чтобы запустить веб приложение скачайте мой проект и откройте его в visual studio code. В терминале PowerShell установите
Node.js и следующие пакеты:

1. Установка платформы
Для загрузки установочного файла Node.js перейдите на официальный сайт: https://nodejs.org/

2. Далее установите пакеты
- npm install express
-  npm install pug (Установка шаблонизатора)
- npm install nodemon
- npm install sqlite3 (Для работы с СУБД Sqlite)
- npm install moment (Для работы с датой (необходима для извлечения номера дня недели из даты))
- npm install sqlite3-transactions
- npm install passport
- npm install passport-local (Для использования локальной стратегии аутентификации необходимо установить модуль passport-local)
- npm install express-session 
- npm install connect-flash
- npm install bcrypt



-- Запустите проект из корневого каталога командой npm start.
-- В адресной строке браузера введите localhost:3000

Теперь перейти на страницу по адресу http://localhost:3000/listStudents смогут только авторизованные пользователи.
При попытке перехода по этому адресу неавторизованные пользователи будут перенаправлены на страницу входа в систему (по маршруту http://localhost:3000/login)
