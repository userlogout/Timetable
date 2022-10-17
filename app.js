// Подключение модуля express
var express = require("express");

// Создание объекта  express
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var passport = require('passport');
var expressSession = require('express-session');
var flash = require('connect-flash');
var pp = require('./passport');

app.use(flash());
app.use(expressSession({secret: "key"}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.username = req.user ? req.user.username : "";
  next();
});

var studentGroup = require('./routes/studentGroup');
app.use('/', studentGroup);

// Указание, что каталог public используется для хранения статических файлов
app.use(express.static("public"));
// Подключение шаблонизаторов Ejs и Handlebars.
app.set("view engine", "ejs");
app.set("view engine", "hbs");
// Подключение шаблонизатора Pug.
app.set("view engine", "pug");

// Указание пути к каталогу, который хранит шаблоны в формате Pug.
app.set("views", "./views");

// Указание номера порта, через который будет запускаться приложение.
app.listen(3000);

// Определение обработчика для маршрута "/".
// request — HTTP-запрос, свойствами которого являются строки запроса, параметры, тело запроса, заголовки HTTP.
// response — HTTP-ответ, который приложение Express отправляет при получении HTTP-запроса.
app.get("/", function(request, response)  {
   // render() — функция, которая на основе шаблона (в данном случае шаблона index.pug) генерирует страницу html, которая отправляется пользователю.
    response.render("index");
});

// Определение обработчикв для маршрута "/test"
app.get("/test", function(request, response)  {
   
    response.render("test",{description:"Описание страницы"});
});

app.get("/information", function(request, response)  {
 
    response.render("test", {description: "На этой странице будет описание проекта"});
  });

  // подключение модуля student.js
var student = require('./routes/student');
app.use('/', student);

var teacher = require('./routes/teacher');
app.use('/', teacher);

var discipline = require('./routes/discipline');
app.use('/', discipline);

var schedule = require('./routes/schedule');
app.use('/', schedule);

var journal = require('./routes/journal');
app.use('/', journal);

var authentication = require('./routes/authentication');
app.use('/', authentication);