var express = require("express");
var router = express.Router();

var db = require("./database.js");
var isAuth = require('./isAuth');

module.exports = router;

var moment = require('moment');
var TransactionDatabase = require("sqlite3-transactions").TransactionDatabase;
var dbTransaction = new TransactionDatabase(db);

router.route("/addAttendanceMark")
    .get((req, res) => {
        db.all(`SELECT * FROM student_group`, (err, rows) => {
            if (err) {
                throw err;
            }
            res.render("journal/addAttendanceMark", {
                studentGroups: rows,
                title: "Добавление отметки посещаемости"
            });
        });
    })
    .post((req, res) => {
        // получаем массив идентификаторов студентов, для которых нужно добавить отметку посещаемости
        var arrayStudents = req.body.array_students_id;
        // добавляем следующую проверку: если arrayStudents не является массивом и не имеет значение undefined, то значит в списке был один студент
        // если один студент, то отметка посещаемости тоже одна и в таком случае передаётся на сторону сервера только одно значение не в массиве
        // если отметок посещаемости несколько, то все они передаются в одном массиве
        if (Array.isArray(arrayStudents) == false && arrayStudents!==undefined){
            arrayStudents = [];
            arrayStudents.push(req.body.array_students_id);
        }
        // проверяем, что arrayStudents является массивом, поскольку, если в группе нет студентов, то arrayStudents будем иметь тип undefined
        if (Array.isArray(arrayStudents) == true ) {
    
            var schedule = req.body.schedule_id;
            if (Array.isArray(schedule) == false && schedule!==undefined){
                schedule = [];
                schedule.push(req.body.schedule_id);
            }
            var journal = [];
            for (var i = 0; i < schedule.length; i++) {
                journal.push(schedule[i], req.body.date_pair);
            }
            var placeholders = schedule.map(() => '(?, ?)').join(',');
            dbTransaction.beginTransaction((err, transaction) => {
                transaction.run(
                    `INSERT INTO journal(schedule_id, date_pair) VALUES ` + placeholders,
                    journal,
                    (err) => {
                        if (err) {
                            throw err;
                        }
                        var journal_student = [];
                        for (var i = 0; i < arrayStudents.length; i++) {
                            for (var j = 0; j < schedule.length; j++) {
                                // сначала добавляем идентификатор студента
                                journal_student.push(arrayStudents[i]);
                                // определяем отметку посещаемости
                                // если нашли в теле запроса отметку посещаемости, то значит была установлена галочка
                                // (если галочка не поставлена, то информация по отметке не отправляется из формы на сервер)
                                if (req.body["attendance" + i + "" + j] != null) {
                                    journal_student.push(1);
                                }
                                else {
                                    journal_student.push(0);
                                }
                            }
                        }
    
                        var placeholders = arrayStudents.map(() => {
                                return schedule.map((id) => `(?, ?, (SELECT id FROM journal WHERE schedule_id =  ${id} AND date_pair = "${req.body.date_pair}"))`)
                                    .join(',');
                            }).join(',')
                        ;
                        transaction.run(
                            `INSERT INTO journal_student(student_id, attendance, journal_id) VALUES ` + placeholders,
                            journal_student,
                            (err) => {
                                if (err) {
                                    throw err;
                                }
                                // фиксируем транзакцию
                                transaction.commit((err) => {
                                    if (err) {
                                        throw err;
                                    }
                                    // в случае успешного выполнения транзакции переходим к странице просмотра отметок посещаемости
                                    res.redirect("/attendanceJournal");
                                });
                            });
                    });
                });
            }
        });
    router.post("/getDataForAddingAttendance", function(req, res) {
        // Определим по дате номер дня недели.
        // В SQL есть функция WEEKDAY, но SQLite её не поддерживает, поэтому воспользуемся методами языка JavaScript.
        // Стандартные методы JavaScript позволяют определить номер дня недели по дате. Но по умолчанию считается, что неделя начинается с воскресенья,
        // тогда как в России (и во многих других странах) начинается с понедельника.
        // Поэтому воспользуемся библиотекой moment.js, которая позволяет получить номер дня недели из расчёта, что неделя начинается с понедельника.
        var date_pair = req.body.date_pair;
        var week_day = moment(date_pair).isoWeekday() - 1; // вычитаем единицу, так как 1 - понедельник, 7 - воскресенье, а у нас счёт начинается с 0, когда добавляем данные о посещаемости
        db.all(
            `SELECT schedule.id as schedule_id, discipline.id as discipline_id, discipline.name as discipline_name, 
            teacher.id as teacher_id, teacher.name as teacher_name 
            FROM discipline_teacher
            INNER JOIN schedule ON schedule.discipline_teacher_id=discipline_teacher.id
            INNER JOIN discipline ON discipline.id=discipline_teacher.discipline_id 
            INNER JOIN teacher ON teacher.id=discipline_teacher.teacher_id
            WHERE schedule.student_group_id=? AND schedule.week_day=?
            ORDER BY schedule.week_day, schedule.pair_number`,
            [req.body.student_group_id, week_day],
            (err, rows) => {
                if (err) {
                    throw err;
                }
                var disciplineTeacher = rows;
                db.all(`SELECT * FROM student WHERE student.student_group_id=?`,
                    [req.body.student_group_id],
                    (err, rows) => {
                        if (err) {
                            throw err;
                        }
                        var students = rows;
                        // метод send() позволяет отправить полученные данные на сторону клиента. При этом страница на стороне клиента не перезагружается
                        res.send(
                            JSON.stringify({
                                disciplineTeacher: disciplineTeacher,
                                students: students
                            })
                        );
                });
            });
    });
    //router.route("/deleteAttendanceMark/")
    router.post("/deleteAttendanceJournal/student_groupId=:student_group_id/date_pair=:date_pair", (req, res) => {
        db.run(`DELETE FROM journal WHERE date_pair=? AND schedule_id IN(SELECT schedule.id FROM schedule WHERE student_group_id=?)`, [req.params.date_pair,req.params.student_group_id],
            (err) => {
                if (err) {
                    throw err;
                }
                 res.redirect("/attendanceJournal");
            }
        );
    });


    router.route("/attendanceJournal")
    .get( isAuth.isAuthenticated, (req, res) => {
        db.all(`SELECT * FROM student_group`, (err, rows) => {
            if (err) {
                throw err;
            }
            res.render("journal/attendanceJournal", {
                studentGroups: rows,
                title: "Журнал посещаемости"
            });
        });
    })
    .post((req, res) => {
        db.all(
            `SELECT discipline.id as discipline_id, discipline.name as discipline_name, 
            teacher.id as teacher_id, teacher.name as teacher_name 
            FROM journal
            INNER JOIN schedule ON schedule.id=journal.schedule_id
            INNER JOIN discipline_teacher ON discipline_teacher.id=schedule.discipline_teacher_id
            INNER JOIN discipline ON discipline.id=discipline_teacher.discipline_id 
            INNER JOIN teacher ON teacher.id=discipline_teacher.teacher_id
            WHERE schedule.student_group_id=? AND journal.date_pair=?
            ORDER BY schedule.week_day, schedule.pair_number`,
            [req.body.student_group_id, req.body.date_pair],
            (err, rows) => {
                if (err) {
                    throw err;
                }
                // затем получаем записи из таблицы journal_student, в которой хранятся данные отметок посещаемости студентов
                var journal = rows;
                db.all(
                    `SELECT journal_student.attendance, student.id as student_id, student.name as student_name, journal.schedule_id 
                    FROM student
                    LEFT JOIN schedule ON schedule.student_group_id = student.student_group_id  
                    INNER JOIN journal ON journal.schedule_id = schedule.id
                    LEFT JOIN journal_student ON journal_student.journal_id = journal.id AND journal_student.student_id=student.id
                    WHERE student.student_group_id=? AND journal.date_pair=?
                    ORDER BY student.id`,
                    [req.body.student_group_id, req.body.date_pair],
                    (err, rows) => {
                        if (err) {
                            throw err;
                        }
                        var journalStudent = rows;
                        res.send(
                            JSON.stringify({
                                journal: journal,
                                journalStudent: journalStudent
                            })
                        );
                    });
            });
    });