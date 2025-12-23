; =============================================================
; ТЕСТ 1: Инициализация памяти и чтение по смещению
; =============================================================

; 1. Выделяем память под массив (5 ячеек)
ARR_ALLOC array 5

; 2. Заполняем массив вручную значениями [3, 2, 1, 4, 2],
; так как компилятор не умеет делать это одной строкой.
; Используем reg3 как буфер для значения.

MOV_LIT reg3 3
SET_MEM_OFFSET array reg3 0  ; array[0] = 3

MOV_LIT reg3 2
SET_MEM_OFFSET array reg3 1  ; array[1] = 2

MOV_LIT reg3 1
SET_MEM_OFFSET array reg3 2  ; array[2] = 1

MOV_LIT reg3 4
SET_MEM_OFFSET array reg3 3  ; array[3] = 4

MOV_LIT reg3 2
SET_MEM_OFFSET array reg3 4  ; array[4] = 2

; 3. Подготовка регистров
MOV_LIT sum 0           ; reg1 (аккумулятор)
MOV_LIT iterator 0      ; reg2 (индекс)

; 4. Чтение из памяти: reg3 = array[iterator]
MOV_MEM_OFFSET_REG reg3 array iterator
