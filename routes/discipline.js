var express = require("express");
// Вызываем функцию Router(), чтобы создать новый объект маршрутизации. Основной уже располагается в app.js
var router = express.Router();
var db = require("./database.js");
var isAuth = require('./isAuth');

// Указание, что модуль является экспортируемым (теперь его можно подключать в другие модули)
module.exports = router;

router.get("/listDisciplines",  isAuth.isAuthenticated, function(req, res)  {
    db.all(`SELECT * FROM discipline`, (err, rows) => {
        if (err) {
            throw err;
        }
        res.render("discipline/listDisciplines", {
            disciplines: rows,
            title: "Список курсов"
        });
    });

});

router.route("/addDiscipline")
.get((req, res) => {
    // получаем все группы для вывода в выпадающий список
        res.render("discipline/addDiscipline", {
            title: "Добавление курса"
        })
})
.post((req, res) => {
    db.run(
        `INSERT INTO discipline(name) VALUES (?)`,[req.body.name],
        (err) => {
            if (err) {
                throw err;
            }
            res.redirect('/listDisciplines');
        }
    );
});


router.post("/updateDiscipline/:id", (req, res) => {
    db.run(
        `UPDATE discipline SET name=? WHERE id=?`,[req.body.name, req.params.id],
        (err) => {
            if (err) {
                throw err;
            }
            res.redirect('/listDisciplines');
        }
    );
});

router.post("/deleteDiscipline/:id", (req, res) => {
    db.run('DELETE FROM discipline WHERE id=?', [req.params.id],
        (err) => {
            if (err) {
                throw err;
            }
            res.redirect('/listDisciplines');
        }
    );
});



router.get("/discipline/:id", function(req, res)  {
    // получение id студента из параметров запроса
    var discipline_id = req.params.id;

    db.get(`SELECT * FROM discipline WHERE id=?`, [discipline_id], (err, rows) => {
        if (err) {
            throw err;
        }
        res.render("discipline/discipline", {
            discipline: rows
        });
    });

}); 