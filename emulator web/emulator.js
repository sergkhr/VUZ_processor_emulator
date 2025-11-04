

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
    const codeInput = document.getElementById('codeInput');

    // обработчики событий
    runBtn.addEventListener('click', runCode);
    stepBtn.addEventListener('click', executeStep);
    resetBtn.addEventListener('click', reset);
    speedInput.addEventListener('change', processExecSpeed);
    codeInput.addEventListener('scroll', syncScroll);

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
    // 1. Парсим код из textarea
    let compilerResult = compileCodeInput();
    if(!compilerResult.done) return false;
    ass_code = compilerResult.code;

    // 2. Сбрасываем состояния эмулятора, но не код, подсвечиваем, блочим на редактирование
    resetRegMemFlagPC();
    updateStateTables();
    highlightCurrentLine(0); // начало подсветки
    document.getElementById('codeInput').readOnly = true;

    // 3. Выполняеммммм
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
    if (command_code === "") incrementPC();

    const old_PC = PC;
    const command = getCommandByCode(command_code);
    
    if(command) command[DB.call](res_op1, op2, op3);
    else console.error("Unknown command: ", command_code, " named: ", command[DB.name]);

    if (PC === old_PC) incrementPC(); //этого достаточно, это основное перемещение программы
}









function updateFlags(last_command_result){
    getFlagByCode(getFlagCode("ZF"))[DB.value] = (last_command_result === 0) ? 1 : 0;
    //TODO CF
    return last_command_result;
}



function MOV(res_reg_code, reg_code) {
    getRegisterByCode(res_reg_code)[DB.value] = getRegisterByCode(reg_code)[DB.value];
}

function MOV_LIT(res_reg_code, literal){
    literal = parseInt(literal, 2);
    getRegisterByCode(res_reg_code)[DB.value] = literal;
}

function ADD(res_reg_code, reg1_code, reg2_code) {
    let result = getRegisterByCode(reg1_code)[DB.value] + getRegisterByCode(reg2_code)[DB.value];
    getRegisterByCode(res_reg_code)[DB.value] = updateFlags(result);
}

function CMP(reg1_code, reg2_code) {
    let result = getRegisterByCode(reg1_code)[DB.value] - getRegisterByCode(reg2_code)[DB.value];
    updateFlags(result);
}


// PC++ after successfull jump i needed to not execute the MARK command again
function JMP(mark_code) {
    let jump_pos = getMarkByCode(mark_code)[DB.value];
    PC = parseInt(jump_pos, 10);
    incrementPC();
}

function JZ(mark_code) {
    if (getFlagByCode(getFlagCode("ZF"))[DB.value] === 1) {
        let jump_pos = getMarkByCode(mark_code)[DB.value];
        PC = parseInt(jump_pos, 10);
        incrementPC();
    }
}

function JNZ(mark_code) {
    if (getFlagByCode(getFlagCode("ZF"))[DB.value] === 0) {
        let jump_pos = getMarkByCode(mark_code)[DB.value];
        PC = parseInt(jump_pos, 10);
        incrementPC();
    }
}

function MARK(mark_code) {
    console.log("зачем MARK выполняется после компиляции?");
}

function VAR(memory_code, literal){
    literal = parseInt(literal, 2);
    getMemoryByCode(memory_code)[DB.value] = literal;
}

function ARR_ALLOC(memory_code, length){
    console.log("зачем ARR_ALLOC выполняется, если аллокация на компиляции?");
}
function SET_MEM_OFFSET(memory_code, reg_code, offset){
    let index = parseInt(memory_code, 2);
    memory_db[index + offset][DB.value] = getRegisterByCode(reg_code)[DB.value];
}

function MOV_MEM_OFFSET(res_reg_code, memory_code, offset) {
    let index = parseInt(memory_code, 2);
    getRegisterByCode(res_reg_code)[DB.value] = memory_db[index + offset][DB.value];
}
