; =============================================================
; ТЕСТ 2: Шаг суммирования массива
; =============================================================

; --- Блок инициализации (тот же, что и выше) ---
ARR_ALLOC array 5

MOV_LIT reg3 3
SET_MEM_OFFSET array reg3 0
MOV_LIT reg3 2
SET_MEM_OFFSET array reg3 1
MOV_LIT reg3 1
SET_MEM_OFFSET array reg3 2
MOV_LIT reg3 4
SET_MEM_OFFSET array reg3 3
MOV_LIT reg3 2
SET_MEM_OFFSET array reg3 4

; --- Основная логика ---

MOV_LIT sum 0           ; reg1 = 0
MOV_LIT iterator 0      ; reg2 = 0
MOV_LIT reg4 1          ; reg4 = 1 (константа для инкремента)

; Чтение: reg3 = array[iterator] (должно быть 3)
MOV_MEM_OFFSET_REG reg3 array iterator

; Сложение: sum = sum + reg3
ADD sum sum reg3

; Инкремент: iterator = iterator + 1
; (ADD работает только с регистрами, поэтому используем reg4)
ADD iterator iterator reg4