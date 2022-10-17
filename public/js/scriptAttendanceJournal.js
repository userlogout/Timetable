$(document).ready(() => {
        function getDataForAddingAttendance(){
    
            // получаем идентификатор выбранной в списке студенческой группы
            var student_group_id = $("#student_group_id").val();
    
            // получаем выбранную дату
            var date_pair = $("#date_pair").val();
    
            // записываем параметры, которые будем отправлять на сторону сервера в теле запроса
            var param = {
                student_group_id: student_group_id,
                date_pair: date_pair
            };
            // удаляем содержимое таблицы
            $("#attendance_table_id").empty();
    
            // делаем запрос к серверу при помощи AJAX
            $.ajax({
                type: "POST", // указываем тип запроса
                url: "/attendanceJournal", // указываем адрес обработчика
                data: param, // передаём параметры
                dataType: "json" // тип данных, которые ожидаются от сервера
            }).done((data) => { // обрабатываем результат
                var journal = data.journal;
                var journalStudent = data.journalStudent;
    
                // показывать таблицу будем только в случае, когда есть данные о посещаемости на выбранную дату
                if (journalStudent.length) {
                    // выводим учебные дисциплины в шапке таблицы
                    // при помощи конструкции ${ } подставляем параметры в шаблоны
                    var strDiscipline = "";
                    for (var i in journal) {
                        strDiscipline = strDiscipline +
                            `<th>
                                ${journal[i].discipline_name}
                            </th>`
                        ;
                    }
    
                    // выводим преподавателей в шапке таблицы
                    var strTeacher = "";
                    for (var i in journal) {
                        strTeacher = strTeacher +
                            `<th>
                                ${journal[i].teacher_name}
                            </th>`
                        ;
                    }
                    // формируем строки таблицы
                    var tbody = "";
                    var k = journal.length;
                    var n = 0;
                    for (var i = 0; i < journalStudent.length / journal.length; i++) {
                        // выводим отметки посещаемости
                        var attendance = "";
                        for (var j = 0; j < journal.length; j++) {
                            console.log(journalStudent[j + n].attendance === 1 ? '' : null)
                            attendance = attendance +
                                `<td>
                                    <input name="attendance" ${i} ${j}  type="checkbox" ${journalStudent[j + n].attendance === 1 ? 'checked' : ''}>
                                </td>`
                            ;
                        }
                        // склеиваем данные строк
                        tbody = tbody +
                            `<tr>
                                <td>
                                   ${i+1}
                                </td>
                                <td>
                                    ${journalStudent[n].student_name}
                                </td>
                                ${attendance}
                            </tr>`
                        ;
                        n = n + k;
                    }
    
                    // формируем таблицу, но здесь используется "чистый" html
                    $("#attendance_table_id").append(
                        `<table border="1" class="table table-bordered table-striped mt-3">
                            <thead class="table-primary">
                                <tr>
                                    <td rowspan="2" colspan="2"></td>
                                    ${strDiscipline}
                                </tr>
                                <tr>
                                    ${strTeacher}
                                </tr>
                                <tr>
                                    <th>
                                        №
                                    </th>
                                     <th>
                                        Список студентов
                                    </th>
                                     <th colspan=${journal.length}>
                                        Посещаемость
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tbody}
                            </tbody>
                        </table>
                        <form action="/deleteAttendanceJournal/student_groupId=${student_group_id}/date_pair=${date_pair}" method="POST">
                            <input type="submit" value="Удалить" class="btn btn-danger">
                        </form>`
                    );
                }
            });
        }
    
        // при изменении группы подгружаем таблицу
        $("#student_group_id").change(() => {
            getDataForAddingAttendance();
        });
    
        // при изменении даты подгружаем таблицу
        $("#date_pair").change(() => {
            getDataForAddingAttendance();
        });
    
        // при загрузке страницы подгружаем таблицу
        getDataForAddingAttendance();
    });