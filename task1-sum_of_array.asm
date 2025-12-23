VAR n 5 0
ARR_ALLOC array 5 0
MOV_LIT reg5 3 0
SET_MEM_OFFSET array reg5 0
MOV_LIT reg5 2 0
SET_MEM_OFFSET array reg5 1
MOV_LIT reg5 1 0
SET_MEM_OFFSET array reg5 2
MOV_LIT reg5 4 0
SET_MEM_OFFSET array reg5 3
MOV_LIT reg5 2 0
SET_MEM_OFFSET array reg5 4

MOV_LIT sum 0 0

MOV_LIT iterator 0 0
MOV_MEM_OFFSET reg4 n 0
MOV_LIT reg5 1 0

MARK M0 0 0
MOV_MEM_OFFSET_REG reg3 array iterator
ADD sum sum reg3
ADD iterator iterator reg5
CMP 0 iterator reg4
JNZ M0 0 0

MOV result sum 0




---------------------------------------------------------




; Выделение памяти для числа n и массива array
VAR n 5 0
ARR_ALLOC array 5 0

; Инициализация array: [3, 2, 1, 4, 2]
MOV_LIT reg5 3 0
SET_MEM_OFFSET array reg5 0
MOV_LIT reg5 2 0
SET_MEM_OFFSET array reg5 1
MOV_LIT reg5 1 0
SET_MEM_OFFSET array reg5 2
MOV_LIT reg5 4 0
SET_MEM_OFFSET array reg5 3
MOV_LIT reg5 2 0
SET_MEM_OFFSET array reg5 4

; ПОДГОТОВКА
MOV_LIT sum 0 0         ; Сумма в 8 битах (Accumulator)
MOV_LIT iterator 0 0    ; Индекс
MOV_MEM_OFFSET reg4 n 0 ; Длина массива
MOV_LIT reg5 1 0        ; Шаг

MARK M0 0 0
MOV_MEM_OFFSET_REG reg3 array iterator
ADD sum sum reg3
ADD iterator iterator reg5
CMP 0 iterator reg4
JNZ M0 0 0

MOV result sum 0




---------------------------------------------------------




VAR n 5 0                 ; Объявляем переменную n = 5 (длина массива)
ARR_ALLOC array 5 0       ; Выделяем память под массив 'array' длиной 5 ячеек

MOV_LIT reg5 3 0             ; Загружаем 3 во временный регистр reg5
SET_MEM_OFFSET array reg5 0  ; Пишем значение из reg5 в array[0]

MOV_LIT reg5 2 0             ; Загружаем 2
SET_MEM_OFFSET array reg5 1  ; Пишем в array[1]
; ... и так далее для остальных элементов
MOV_LIT reg5 1 0
SET_MEM_OFFSET array reg5 2
MOV_LIT reg5 4 0
SET_MEM_OFFSET array reg5 3
MOV_LIT reg5 2 0
SET_MEM_OFFSET array reg5 4

MOV_LIT sum 0 0         ; sum (reg0) = 0. Здесь будет накапливаться результат
MOV_LIT iterator 0 0    ; iterator (reg1) = 0. Это индекс текущего элемента

MOV_MEM_OFFSET reg4 n 0 ; reg4 = n (значение 5). Это граница цикла

MOV_LIT reg5 1 0        ; reg5 = 1. Используется как константа для инкремента (+1),
                        ; так как ADD работает только с регистрами

MARK M0 0 0                        ; Метка начала цикла

; 1. Чтение элемента массива по индексу
; reg3 = array[iterator]
MOV_MEM_OFFSET_REG reg3 array iterator 

; 2. Суммирование
; sum = sum + reg3
ADD sum sum reg3

; 3. Увеличение счетчика
; iterator = iterator + reg5 (то есть +1)
ADD iterator iterator reg5

; 4. Проверка условия выхода
; Сравниваем iterator (текущий шаг) и reg4 (длина массива n)
; CMP вычисляет (iterator - n) и обновляет флаг ZF
CMP 0 iterator reg4

; 5. Переход
; Если результат CMP не равен 0 (то есть iterator != n), прыгаем на M0.
; Как только iterator станет равен 5, ZF станет 1, и переход не выполнится.
JNZ M0 0 0

MOV result sum 0        ; Копируем итоговое значение в регистр 'result'
