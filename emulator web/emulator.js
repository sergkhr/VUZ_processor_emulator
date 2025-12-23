

// Дальше бога нет (эмулятор)

// ====================================================
//              ИНИЦИАЛИЗАЦИЯ
// ====================================================


document.addEventListener('DOMContentLoaded', () => {

    // ссылки на кнопки
    const runBtn     = document.getElementById('runBtn');
    const stepBtn    = document.getElementById('stepBtn');
    const resetBtn   = document.getElementById('resetBtn');
    const speedInput = document.getElementById('speedInput');

    // обработчики событий
    runBtn.addEventListener('click', runCode);
    stepBtn.addEventListener('click', executeStep);
    resetBtn.addEventListener('click', reset);
    speedInput.addEventListener('change', processExecSpeed);

    // сбрасываем все состояния
    reset();
})



/**
 * Полный сброс состояний эмулятора и интерфейса
 */
function reset() {
    isRunning = false;

    resetRegMemFlagPC();
    ass_code = [];


    const codeInput = document.getElementById('codeInput');
    
    codeInput.readOnly = false; // можем редактировать асс-код
    highlightCurrentLine(-1);   // убираем подсветку
    
    document.getElementById('output').textContent = 'Program ready. Please, enter "Run".';

    updateStateTables();
    setButtonsDisabled(false);

    processExecSpeed();
}



// ====================================================
//              ЛОГИКА УПРАВЛЕНИЯ ВЫПОЛНЕНИЕМ
// ====================================================



/**
 * Главная функция выполнения программы
 */
function runCode() {
    resetRegMemFlagPC();
    
    // Парсим код из textarea
    let compilerResult = compileCodeInput();
    // console.log(compilerResult);
    // console.log(memory_db);
    // console.log(mark_db);
    if(!compilerResult.done) return false;
    ass_code = compilerResult.code;

    updateCompiledOutput(compilerResult);
    updateStateTables();
    highlightCurrentLine(0); // начало подсветки
    syncScroll(document.getElementById('highlighter-code'), document.getElementById('codeInput'));
    syncScroll(document.getElementById('highlighter-compile'), document.getElementById('compileOutput'));
    document.getElementById('codeInput').readOnly = true;

    // Выполняеммммм
    if (getExecSpeed() > 0) {
        isRunning = true;
        // Блочим кнопки, пока прога выполняется
        setButtonsDisabled(true);
        executeAutomatically();
    } else {
        document.getElementById('output').textContent = 'Step-by-step mode. Click the "Next step".';
    }

    return true;
}


/**
 * Выполнение одного шага программы && обновление UI
 */
function executeStep() {
    if (ass_code.length === 0) {
        const codeLoaded = runCode();
        if (codeLoaded && isRunning) {}
        return;
    }
    if (PC >= ass_code.length) {
        document.getElementById('output').textContent = "The program is completed!";
        document.getElementById('stepBtn').disabled = true;
        document.getElementById('resetBtn').disabled = false;
        document.getElementById('runBtn').disabled = false;
        document.getElementById('codeInput').readOnly = false;
        highlightCurrentLine(-1);
        isRunning = false;
        return;
    }


    const command_line = ass_code[PC];
    call_command(command_line[0], command_line[1], command_line[2], command_line[3]);


    updateStateTables();
    highlightCurrentLine(PC);
}


/**
 * Выполнение программы - автоматическое
 */
async function executeAutomatically() {
    while (isRunning && PC < ass_code.length) {
        document.getElementById('output').textContent = "The program is running...";
        
        // Сначала задержка, потом шаг программы
        const delay = 1000 / getExecSpeed();
        await new Promise(resolve => setTimeout(resolve, delay));
        executeStep();
    }

    if (isRunning) {
        document.getElementById('output').textContent = "The program has been completed!";
    }
    setButtonsDisabled(false);
    processExecSpeed();
    isRunning = false;
    document.getElementById('codeInput').readOnly = false;
    highlightCurrentLine(-1);
}


/**
 * Обработка скорости выполнения
 */
function getExecSpeed() {
    let speed = parseFloat(document.getElementById("speedInput").value);
    return isNaN(speed) || speed < 0 ? 0 : speed;
}

function processExecSpeed() {
    // Скорость 0 -> пошаговый режим
    // TODO: возможно поменять на что-то иное
    document.getElementById('stepBtn').disabled =  getExecSpeed() > 0;
}












// ====================================================
//              ЛОГИКА КОМАНД ПРОЦЕССОРА
// ====================================================

/**
 * Увеличение счетчика команд и обновление отображения на форме 
 */
function incrementPC() {
    PC++;
    PC_ui.textContent = PC;
}

/**
 * Маршрутизатор команд
 */
function call_command(command_code, res_op1, op2, op3) {
    if (command_code === ""){
        incrementPC();
        return;
    } 

    const old_PC = PC;
    const command = getCommandByCode(command_code);
    
    if(command) command[DB.call](res_op1, op2, op3);
    else console.error("Unknown command: ", command_code);        // TODO: console error

    if (PC === old_PC) incrementPC(); //этого достаточно, это основное перемещение программы
}

/**
 * Преобразует 8-битную бинарную строку в знаковое число (-128...127)
 * "00000001" -> 1
 * "11111111" -> -1
 */
function parseSignedByte(binaryString) {
    let val = parseInt(binaryString, 2);
    // Если старший бит (128) установлен, значит число отрицательное
    if (val > 127) {
        val -= 256;
    }
    return val;
}

/**
 * Сохраняет 16-битный результат:
 * Младший байт -> в целевой регистр (res_reg_code)
 * Старший байт -> в регистр EXT
 */
function writeDoubleByteResult(res_reg_code, fullResult) {
    // 1. Обработка JS-числа в 16-битное целое (обрезаем лишнее)
    // Это работает и для отрицательных чисел (Two's complement)
    let safeResult = fullResult & 0xFFFF; 

    // 2. Выделяем младший байт (Low Byte)
    // Если число было отрицательным, здесь получится его 8-битное представление
    let lowByte = safeResult & 0xFF;

    // 3. Выделяем старший байт (High Byte)
    let highByte = (safeResult >> 8) & 0xFF;

    // 4. Корректируем знаки для JS (чтобы в регистрах лежали числа -128..127, а не 128..255)
    // Используем вспомогательную логику (можно упростить, если parseSignedByte уже есть)
    if (lowByte > 127) lowByte -= 256;
    if (highByte > 127) highByte -= 256;

    // 5. Запись младшего байта в целевой регистр
    getRegisterByCode(res_reg_code)[DB.value] = lowByte;

    // 6. Запись старшего байта в регистр EXT
    // Находим код регистра EXT динамически
    let ext_code = getRegisterCode("EXT");
    if (ext_code) {
        getRegisterByCode(ext_code)[DB.value] = highByte;
    }

    // 7. Обновляем флаги (по младшему байту или по полному результату - зависит от архитектуры)
    // Обычно флаги ставятся по результату, записанному в целевой регистр (Low Byte)
    return updateFlags(lowByte); 
}









function updateFlags(last_command_result){
    // Эмуляция 8-битного переполнения.
    // Если результат 128, он должен стать -128.
    // Если результат -129, он должен стать 127.
    while (last_command_result > 127) last_command_result -= 256;
    while (last_command_result < -128) last_command_result += 256;

    // Zero Flag (ZF) - если результат 0
    let zf_code = getFlagCode("ZF");
    if (zf_code) getFlagByCode(zf_code)[DB.value] = ((last_command_result === 0) ? 1 : 0);
    
    // Sign Flag (SF) - если результат отрицательный
    let sf_code = getFlagCode("SF");
    if (sf_code) getFlagByCode(sf_code)[DB.value] = ((last_command_result < 0) ? 1 : 0);

    // Carry Flag (CF) - обрабатывается в командах отдельно

    return last_command_result;
}



function MOV(res_reg_code, reg_code, placeholder) {
    getRegisterByCode(res_reg_code)[DB.value] = getRegisterByCode(reg_code)[DB.value];
}

function MOV_LIT(res_reg_code, literal, placeholder){
    // Читаем литерал как знаковое число
    let val = parseSignedByte(literal);
    getRegisterByCode(res_reg_code)[DB.value] = val;
}

function ADD(res_reg_code, reg1_code, reg2_code) {
    let val1 = getRegisterByCode(reg1_code)[DB.value];
    let val2 = getRegisterByCode(reg2_code)[DB.value];
    
    // --- ЛОГИКА CARRY FLAG (CF) ---
    // Преобразуем текущие знаковые значения (-128..127) в беззнаковые (0..255)
    // Это изолирует логику CF от знака (SF), устраняя конфликт.
    let u1 = val1 & 0xFF;
    let u2 = val2 & 0xFF;
    let uSum = u1 + u2;

    // Если беззнаковая сумма не влезает в 8 бит (>255), ставим CF = 1
    let cf_code = getFlagCode("CF");
    if (cf_code) getFlagByCode(cf_code)[DB.value] = (uSum > 255) ? 1 : 0;

    // --- ЛОГИКА РЕЗУЛЬТАТА И SF ---
    // Обычное сложение для получения результата (сохраняем старую логику)
    let result = val1 + val2;
    
    // writeDoubleByteResult запишет результат и вызовет updateFlags(),
    // который обновит SF и ZF, но не тронет наш установленный CF.
    writeDoubleByteResult(res_reg_code, result);
}

// Функция сложения с учетом переноса (для старших байтов)
function ADC(res_reg_code, reg1_code, reg2_code) {
    let val1 = getRegisterByCode(reg1_code)[DB.value];
    let val2 = getRegisterByCode(reg2_code)[DB.value];
    
    // 1. Получаем текущий Carry Flag
    let cf_val = 0;
    let cf_code = getFlagCode("CF");
    if (cf_code) {
        cf_val = getFlagByCode(cf_code)[DB.value];
    }

    // 2. Считаем сумму как беззнаковую для вычисления НОВОГО флага CF
    // (Это работает верно и для отрицательных чисел в дополнительном коде)
    let u1 = val1 & 0xFF;
    let u2 = val2 & 0xFF;
    let uSum = u1 + u2 + cf_val;

    if (cf_code) {
        // Если сумма > 255, значит "выпал" 9-й бит -> это перенос
        getFlagByCode(cf_code)[DB.value] = (uSum > 255) ? 1 : 0;
    }

    // 3. Считаем знаковый результат для записи в регистр
    let result = val1 + val2 + cf_val;
    
    // writeDoubleByteResult запишет число и обновит SF и ZF.
    // SF здесь будет показывать ЗНАК ВСЕГО 16-БИТНОГО ЧИСЛА (так как это старший байт).
    writeDoubleByteResult(res_reg_code, result);
}

function MUL(res_reg_code, reg1_code, reg2_code) {
    // Получаем значения из регистров (они уже могут быть отрицательными благодаря parseSignedByte)
    let val1 = getRegisterByCode(reg1_code)[DB.value];
    let val2 = getRegisterByCode(reg2_code)[DB.value];
    
    let u1 = val1 & 0xFF;
    let u2 = val2 & 0xFF;
    let uMul = u1 * u2;

    let cf_code = getFlagCode("CF");
    if (cf_code) getFlagByCode(cf_code)[DB.value] = (uMul > 255) ? 1 : 0;

    let result = val1 * val2;
    
    // Записываем результат и обновляем флаги
    writeDoubleByteResult(res_reg_code, result);
}

function CMP(placeholder, reg1_code, reg2_code) {
    let val1 = getRegisterByCode(reg1_code)[DB.value];
    let val2 = getRegisterByCode(reg2_code)[DB.value];

    // --- ЛОГИКА ЗАИМСТВОВАНИЯ (CF в роли Borrow) ---
    let u1 = val1 & 0xFF;
    let u2 = val2 & 0xFF;
    
    let cf_code = getFlagCode("CF");
    if (cf_code) {
        // При вычитании (u1 - u2), если u1 < u2, происходит заимствование
        getFlagByCode(cf_code)[DB.value] = (u1 < u2) ? 1 : 0;
    }
    
    let result = val1 - val2;
    updateFlags(result); // Только обновляем флаги, результат не сохраняем
}


// PC++ after successfull jump i needed to not execute the MARK command again
function JMP(mark_code, placeholder, placeholder) {
    let jump_pos = getMarkByCode(mark_code)[DB.value];
    PC = parseInt(jump_pos, 10);
    incrementPC();
}

function JZ(mark_code, placeholder, placeholder) {
    if (getFlagByCode(getFlagCode("ZF"))[DB.value] === 1) {
        let jump_pos = getMarkByCode(mark_code)[DB.value];
        PC = parseInt(jump_pos, 10);
        incrementPC();
    }
}

function JNZ(mark_code, placeholder, placeholder) {
    if (getFlagByCode(getFlagCode("ZF"))[DB.value] === 0) {
        let jump_pos = getMarkByCode(mark_code)[DB.value];
        PC = parseInt(jump_pos, 10);
        incrementPC();
    }
}

function JS(mark_code, placeholder, placeholder) {
    let sf_code = getFlagCode("SF");
    // Если флаг SF установлен (результат предыдущей операции отрицательный)
    if (sf_code && getFlagByCode(sf_code)[DB.value] === 1) {
        let jump_pos = getMarkByCode(mark_code)[DB.value];
        PC = parseInt(jump_pos, 10);
        incrementPC();
    }
}

function MARK(mark_code, placeholder, placeholder) {
    // TODO: console log
    // console.log("зачем MARK выполняется после компиляции?");
}

function VAR(memory_code, literal, placeholder){
    // Инициализация переменной тоже должна понимать знак
    let val = parseSignedByte(literal);
    getMemoryByCode(memory_code)[DB.value] = val;
}

function ARR_ALLOC(memory_code, length, placeholder){
    // TODO: console log
    // console.log("зачем ARR_ALLOC выполняется, если аллокация на компиляции?");
}

function SET_MEM_OFFSET(memory_code, reg_code, offset){
    let index = parseInt(memory_code, 2);
    // Смещение тоже может быть отрицательным (теоретически)
    let offsetVal = parseSignedByte(offset); 
    
    // Проверка границ массива памяти, чтобы не крашнуть JS
    let targetIndex = index + offsetVal;
    if (memory_db[targetIndex]) {
        memory_db[targetIndex][DB.value] = getRegisterByCode(reg_code)[DB.value];
    } else {
        // TODO: console error
        console.error("Runtime Error: Memory access out of bounds");
    }
}

function MOV_MEM_OFFSET(res_reg_code, memory_code, offset) {
    let index = parseInt(memory_code, 2);
    let offsetVal = parseSignedByte(offset);
    
    let targetIndex = index + offsetVal;
    if (memory_db[targetIndex]) {
        getRegisterByCode(res_reg_code)[DB.value] = memory_db[targetIndex][DB.value];
    } else {
        // TODO: console error
        console.error("Runtime Error: Memory access out of bounds");
        getRegisterByCode(res_reg_code)[DB.value] = 0;
    }
}

function MOV_MEM_OFFSET_REG(res_reg_code, memory_code, offset_reg_code) {
    let index = parseInt(memory_code, 2);
    // Значение в регистре смещения уже знаковое (мы храним числа в JS формате)
    let offset = getRegisterByCode(offset_reg_code)[DB.value];
    
    let targetIndex = index + offset;
    if (memory_db[targetIndex]) {
        getRegisterByCode(res_reg_code)[DB.value] = memory_db[targetIndex][DB.value];
    } else {
        // TODO: console error
        console.error("Runtime Error: Memory access out of bounds");
        getRegisterByCode(res_reg_code)[DB.value] = 0;
    }
}
