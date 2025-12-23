VAR n 5 0
ARR_ALLOC A 5 0
ARR_ALLOC B 5 0

MOV_LIT reg3 127 0
SET_MEM_OFFSET A reg3 0
MOV_LIT reg3 100 0
SET_MEM_OFFSET A reg3 1
MOV_LIT reg3 50 0
SET_MEM_OFFSET A reg3 2
MOV_LIT reg3 20 0
SET_MEM_OFFSET A reg3 3
MOV_LIT reg3 10 0
SET_MEM_OFFSET A reg3 4

MOV_LIT reg3 -100 0
SET_MEM_OFFSET B reg3 0
SET_MEM_OFFSET B reg3 1
SET_MEM_OFFSET B reg3 2
SET_MEM_OFFSET B reg3 3
MOV_LIT reg3 -50 0
SET_MEM_OFFSET B reg3 4

MOV_LIT reg12 0 0
MOV_LIT reg13 0 0
MOV_LIT iterator 0 0
MOV_MEM_OFFSET reg4 n 0
MOV_LIT reg5 1 0

MARK LOOP 0 0

MOV_MEM_OFFSET_REG reg6 A iterator
MOV_MEM_OFFSET_REG reg7 B iterator

MUL reg8 reg6 reg7

MOV reg9 EXT 0

ADD reg12 reg12 reg8
ADC reg13 reg13 reg9

ADD iterator iterator reg5
CMP 0 iterator reg4
JNZ LOOP 0 0

MOV result reg12 0
MOV result_EXT reg13 0




; -------------------------------------------------------------




; Выделение памяти для числа n массивов A и B
VAR n 5 0
ARR_ALLOC A 5 0
ARR_ALLOC B 5 0

; Инициализация A: [127, 100, 50, 20, 10]
MOV_LIT reg3 127 0
SET_MEM_OFFSET A reg3 0
MOV_LIT reg3 100 0
SET_MEM_OFFSET A reg3 1
MOV_LIT reg3 50 0
SET_MEM_OFFSET A reg3 2
MOV_LIT reg3 20 0
SET_MEM_OFFSET A reg3 3
MOV_LIT reg3 10 0
SET_MEM_OFFSET A reg3 4

; Инициализация B: [-100, -100, -100, -100, -50]
MOV_LIT reg3 -100 0
SET_MEM_OFFSET B reg3 0
SET_MEM_OFFSET B reg3 1
SET_MEM_OFFSET B reg3 2
SET_MEM_OFFSET B reg3 3
MOV_LIT reg3 -50 0
SET_MEM_OFFSET B reg3 4

; ПОДГОТОВКА
MOV_LIT reg12 0 0       ; Low Byte (Accumulator)
MOV_LIT reg13 0 0       ; High Byte (Accumulator)
MOV_LIT iterator 0 0    ; Индекс
MOV_MEM_OFFSET reg4 n 0 ; Длина массива
MOV_LIT reg5 1 0        ; Шаг

; ЦИКЛ
MARK LOOP 0 0

; 1. Загрузка пары
MOV_MEM_OFFSET_REG reg6 A iterator
MOV_MEM_OFFSET_REG reg7 B iterator

; 2. Умножение
; Результат 16 бит: Low -> reg8, High -> EXT
MUL reg8 reg6 reg7      

; 3. Сохраняем EXT
MOV reg9 EXT 0          

; 4. Сложение (Длинная арифметика)
ADD reg12 reg12 reg8    ; Складываем младшие части
ADC reg13 reg13 reg9    ; Складываем старшие части с учетом переноса

; 5. Инкремент
ADD iterator iterator reg5
CMP 0 iterator reg4
JNZ LOOP 0 0
; КОНЕЦ ЦИКЛА

; Вывод результата в таблицу регистров и строку статуса
MOV result reg12 0
MOV result_EXT reg13 0




; -------------------------------------------------------------




; =============================================================
; ТЕСТ: ПРЕДЕЛЬНАЯ ОТРИЦАТЕЛЬНАЯ СВЕРТКА (16 bit limit)
; Цель: Получить результат близкий к -32768 (Min 16-bit int)
; Результат: -30200 (Hex: 0x8A08)
; =============================================================

; 1. Выделение памяти
VAR n 5 0
ARR_ALLOC A 5 0
ARR_ALLOC B 5 0

; --- Инициализация A: [127, 100, 50, 20, 10] ---
MOV_LIT reg3 127 0
SET_MEM_OFFSET A reg3 0

MOV_LIT reg3 100 0
SET_MEM_OFFSET A reg3 1

MOV_LIT reg3 50 0
SET_MEM_OFFSET A reg3 2

MOV_LIT reg3 20 0
SET_MEM_OFFSET A reg3 3

MOV_LIT reg3 10 0
SET_MEM_OFFSET A reg3 4

; --- Инициализация B: [-100, -100, -100, -100, -50] ---
; Используем одинаковые множители для удобства подсчета
MOV_LIT reg3 -100 0
SET_MEM_OFFSET B reg3 0
SET_MEM_OFFSET B reg3 1
SET_MEM_OFFSET B reg3 2
SET_MEM_OFFSET B reg3 3

MOV_LIT reg3 -50 0
SET_MEM_OFFSET B reg3 4


; --- ПОДГОТОВКА ---
MOV_LIT reg12 0 0       ; Low Byte (Accumulator)
MOV_LIT reg13 0 0       ; High Byte (Accumulator)

MOV_LIT iterator 0 0    ; Индекс
MOV_MEM_OFFSET reg4 n 0 ; Длина массива
MOV_LIT reg5 1 0        ; Шаг


; --- ЦИКЛ ---
MARK LOOP 0 0

; 1. Загрузка пары
MOV_MEM_OFFSET_REG reg6 A iterator
MOV_MEM_OFFSET_REG reg7 B iterator

; 2. Умножение
; Результат 16 бит: Low -> reg8, High -> EXT
MUL reg8 reg6 reg7      

; 3. Сохраняем EXT
MOV reg9 EXT 0          

; 4. Сложение (Длинная арифметика)
; Складываем младшие части
ADD reg12 reg12 reg8    
; Складываем старшие части с учетом переноса (Carry)
ADC reg13 reg13 reg9    

; 5. Инкремент
ADD iterator iterator reg5
CMP 0 iterator reg4
JNZ LOOP 0 0


; --- ФИНАЛ ---
; Вывод результата в таблицу и строку статуса
MOV result reg12 0
MOV result_EXT reg13 0

; ОЖИДАЕМЫЙ РЕЗУЛЬТАТ В СТРОКЕ СТАТУСА:
; Result: -30200
; HEX:    0x8A08
; BIN:    10001010 00001000
