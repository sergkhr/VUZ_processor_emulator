

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
    // Убедитесь, что вы добавили "SF" в flag_db в файле dicts.js!
    let sf_code = getFlagCode("SF");
    if (sf_code) getFlagByCode(sf_code)[DB.value] = ((last_command_result < 0) ? 1 : 0);

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
    
    let result = val1 + val2;
    // updateFlags обрежет лишние биты и выставит флаги
    getRegisterByCode(res_reg_code)[DB.value] = updateFlags(result);
}

function MUL(res_reg_code, reg1_code, reg2_code) {
    // Получаем значения из регистров (они уже могут быть отрицательными благодаря parseSignedByte)
    let val1 = getRegisterByCode(reg1_code)[DB.value];
    let val2 = getRegisterByCode(reg2_code)[DB.value];
    
    // Умножаем
    let result = val1 * val2;
    
    // Функция updateFlags автоматически:
    // 1. Обрежет результат до 8 бит (эмуляция переполнения)
    // 2. Обновит флаги ZF (ноль) и SF (знак)
    getRegisterByCode(res_reg_code)[DB.value] = updateFlags(result);
}

function CMP(placeholder, reg1_code, reg2_code) {
    let val1 = getRegisterByCode(reg1_code)[DB.value];
    let val2 = getRegisterByCode(reg2_code)[DB.value];
    
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
