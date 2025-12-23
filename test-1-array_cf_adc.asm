; =============================================================
; ТЕСТ: 16-битная свертка (Long Arithmetic Convolution)
; A = [100, 50]
; B = [4, 10]
; Result = ((-100)*(-4)) + ((-50)*(-10)) = 400 + 500 = 900
; 900 decimal = 00000011 10000100 binary (Hi: 3, Lo: 132)
; =============================================================

ARR_ALLOC A 2 0
ARR_ALLOC B 2 0

; --- Инициализация A ---
MOV_LIT reg3 -100 0
SET_MEM_OFFSET A reg3 0
MOV_LIT reg3 -50 0
SET_MEM_OFFSET A reg3 1

; --- Инициализация B ---
MOV_LIT reg3 -4 0
SET_MEM_OFFSET B reg3 0
MOV_LIT reg3 -10 0
SET_MEM_OFFSET B reg3 1


; --- ПОДГОТОВКА ---
; Используем ПАРУ регистров для результата
MOV_LIT reg12 0 0       ; sum_L (Младший байт суммы)
MOV_LIT reg13 0 0       ; sum_H (Старший байт суммы)

MOV_LIT iterator 0 0    ; Индекс
MOV_LIT reg4 2 0        ; Длина массива
MOV_LIT reg5 1 0        ; Шаг (+1)


; --- ЦИКЛ ---
MARK LOOP 0 0

; 1. Читаем значения
MOV_MEM_OFFSET_REG reg6 A iterator   ; reg6 = A[i]
MOV_MEM_OFFSET_REG reg7 B iterator   ; reg7 = B[i]

; 2. Умножаем (Result -> reg8, HighByte -> EXT)
MUL reg8 reg6 reg7      
; В этот момент:
; reg8 содержит младшие 8 бит произведения
; EXT  содержит старшие 8 бит произведения

; 3. Сохраняем EXT во временный регистр, пока не затерли
MOV reg9 EXT 0          ; reg9 = HighByte произведения

; 4. ДЛИННОЕ СЛОЖЕНИЕ (16-bit Accumulation)
; Сначала складываем младшие части. Это может вызвать CF=1.
ADD reg12 reg12 reg8    ; sum_L = sum_L + prod_L

; Затем складываем старшие части + перенос от младших
ADC reg13 reg13 reg9    ; sum_H = sum_H + prod_H + CF


; 5. Итерация
ADD iterator iterator reg5
CMP 0 iterator reg4
JNZ LOOP 0 0

; --- РЕЗУЛЬТАТ ---
; Результат лежит в паре reg13:reg12
; Для наглядности переложим в result (младший байт)
;   и в result_EXT (старший байт)
MOV result reg12 0
MOV result_EXT reg13 0

; ПРОВЕРКА:
; Посмотрите в таблицу регистров:
; result (Low)  должен быть:     | 124 | 124 | 7C | 01111100
; result_EXT (High) должен быть: |  -4 | 252 | FC | 11111100
