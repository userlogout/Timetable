$(document).ready(() => {
    function getDataForAddingAttendance(){

        // получаем идентификатор выбранной в списке студенческой группы
        var student_group_id = $("#student_group_id").val();
    
        // получаем выбранную дату
        var date_pair = $("#date_pair").val();
    
        // записываем выбранные данные в параметры, которые будем отправлять на сторону сервера в теле запроса
        var param = {
            student_group_id: student_group_id,
            date_pair: date_pair
        };
        // удаляем содержимое таблицы
        $("#attendance_table_id").empty();
    
        // делаем запрос к серверу при помощи AJAX
        $.ajax({
            type: "POST", // указываем тип запроса
            url: "/getDataForAddingAttendance", // указываем адрес обработчика
            data: param, // передаём параметры
            dataType: "json" // тип данных, которые ожидаются от сервера
        }).done((data) => { // обрабатываем результат
            var disciplineTeacher = data.disciplineTeacher;
            var students = data.students;
    
            // показывать таблицу будем только в случае, когда есть занятия на выбранный день недели
            if (disciplineTeacher.length) {
                // далее при помощи конструкции ${ } подставляем параметры в шаблоны
                // выводим учебные дисциплины в шапке таблицы
                var strDiscipline = "";
                for (var i in disciplineTeacher) {
                    strDiscipline = strDiscipline +
                        `<th>
                            ${disciplineTeacher[i].discipline_name}
                            <input name="schedule_id" type="hidden" value=${disciplineTeacher[i].schedule_id}>
                        </th>`
                    ;
                }
    
                // выводим преподавателей в шапке таблицы
                var strTeacher = "";
                for (var i in disciplineTeacher) {
                    strTeacher = strTeacher +
                        `<th>
                            ${disciplineTeacher[i].teacher_name}
                        </th>`
                    ;
                }
                // формируем строки таблицы
                var tbody = "";
                var n = 1;
                for (var i = 0; i < students.length; i++) {
                    // добавляем возможность устанавливать отметки посещаемости
                    var attendance = "";
                    for (var j = 0; j < disciplineTeacher.length; j++) {
                        attendance = attendance +
                            `<td>
                                <input name="attendance${i}${j}"  type="checkbox">
                            </td>`
                        ;
                    }
                    tbody = tbody +
                        `<tr>
                            <td>
                                ${n++}
                            </td>
                            <td>
                                ${students[i].name}
                                <input name="array_students_id" type="hidden" value=${students[i].id}>
                            </td>
                            ${attendance}
                        </tr>`
                    ;
                }
    
                // формируем таблицу
                $("#attendance_table_id").append(
                    `<table border="1" border="1" class="table table-bordered table-striped mt-3">
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
                                    <th colspan=${disciplineTeacher.length}>
                                    Посещаемость
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tbody}
                        </tbody>
                    </table>`
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