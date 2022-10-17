var express = require("express");
var router = express.Router();

var db = require("./database.js");
var isAuth = require('./isAuth');

module.exports = router;

router.get("/listStudentGroups",  isAuth.isAuthenticated, (req, res) => {
    db.all('SELECT * FROM student_group', (err, rows) => {
        if (err) { // если произошла ошибка, то будет сгенерировано исключение (программа прекратит свою работу), можно предусмотреть другую обработку таких исключительных ситуаций
            throw err;
        }
        res.render("studentGroup/listStudentGroups", { // указываем, что шаблон listStudentGroups.pug находится в подкаталоге studentGroup, который располагается в каталоге views
            studentGroups: rows, // rows - результат запроса
            title: "Список студенческих групп"
        });
    });
});

// переход к странице добавления студенческой группы
router.route("/addStudentGroup")
    .get((req, res) => {
        res.render("studentGroup/addStudentGroup", {
            title: "Добавление студенческой группы"
        })
    })
    .post((req, res) => {
        db.run(`INSERT INTO student_group(number) VALUES (?)`, [req.body.number],
            (err) => {
                if (err) {
                    throw err;
                }
                // переход к списку студенческих групп после добавления записи
                res.redirect("/listStudentGroups");
            }
        );
    });

    // просмотр и обновление студенческой группы
router.get("/studentGroup/:id", (req, res) =>  {
    db.get(`SELECT * FROM student_group WHERE id=?`, [req.params.id], (err, rows) => {
        if (err) {
            throw err;
        }
        res.render("studentGroup/studentGroup", {
            studentGroup: rows,
            title: "Студенческая группа"
        });
    });
});

router.post("/updateStudentGroup/:id", (req, res) => {
    db.run(`UPDATE student_group SET number=? WHERE id=?`, [req.body.number, req.params.id],
        (err) => {
            if (err) {
                throw err;
            }
            // возвращаемся к списку студенческих групп
            res.redirect('/listStudentGroups');
        }
    );
});
//удалить запись
router.post("/deleteStudentGroup/:id", (req, res) => {
    db.run(`DELETE FROM student_group WHERE id=?`, [req.params.id],
        (err) => {
            if (err) {
                throw err;
            }
            res.redirect('/listStudentGroups');
        }
    );
});