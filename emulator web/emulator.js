

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
    // if (timeoutId) {
    //     clearTimeout(timeoutId);
    //     // timeoutId = null;
    // }
    isRunning = false;

    // Сброс состояний "процессора"
    resetRegMemFlagPC();
    ass_code = [];

    // Сброс интерфейса
    const codeInput = document.getElementById('codeInput');
    // codeInput.value = "MOV reg1 10\nMOV reg2 5 0\nADD reg3 reg1 reg2\nCMP 0 reg3 15\nJZ 5 0 0\nJMP 6 0 0\nMOV reg4 1 0";
    
    codeInput.readOnly = false; // можем редактировать асс-код
    highlightCurrentLine(-1);   // убираем подсветку
    
    document.getElementById('output').textContent = 'Program ready. Please, enter "Run".';

    updateStateTables();
    setButtonsDisabled(false);

    // устанавливаем правильное состояние кнопки "Шаг"
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

    const line = ass_code[PC];
    const operation = line[0].toUpperCase();
    
    // ПЕРЕДЕЛАТЬ
    if (operation === '') {
        incrementPC(); // оптимизация да, но лишнее
    } else if (operation in COMMAND_TO_BINARY) {
        const command = COMMAND_TO_BINARY[operation];
        call_command(command, line[1], line[2], line[3]);
    } else {
        memory[line[0]] = line.slice(1).join(' ');
        incrementPC(); //теперь не будет нужен, так как каждый шаг должен вызывать call_command
    }

    updateStateTables();
    highlightCurrentLine(PC); // Переход подсветки
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
function call_command(command, res_op1, op2, op3) {
    const old_PC = PC;

    const command_dict = { // я вообще не знаю насколько это лучше switch case, но так удобнее
        "":               incrementPC(),
        "MOV":            MOV(res_op1, op2),
        "MOV_LIT":        MOV_LIT(res_op1, op2),
        "ADD":            ADD(res_op1, op2, op3),
        "CMP":            CMP(op2, op3),
        "JMP":            JMP(res_op1),
        "JZ":             JZ(res_op1),
        "JNZ":            JNZ(res_op1),
        "MARK":           MARK(res_op1),
        "VAR":            VAR(res_op1, op2),
        "ARR_ALLOC":      ARR_ALLOC(res_op1, op2),
        "SET_MEM_OFFSET": SET_MEM_OFFSET(res_op1, op2, op3),
        "MOV_MEM_OFFSET": MOV_MEM_OFFSET(res_op1, op2, op3)
    }

    const command_name = getNameByBinary("command", command);
    
    if(command_name in command_dict) command_dict[command_name];
    else console.error("Unknown command: ", command, " named: ", command_name);

    if (PC === old_PC) incrementPC(); //этого достаточно, это основное перемещение программы
}

/**
 * Получить значение из регистра/число...
 */
function getValue(operand) {
    if (operand in registry) {
        return registry[operand];
    }
    if (operand in memory) {
        return memory[operand];
    }
    const num = parseInt(operand, 10);
    return isNaN(num) ? 0 : num;
}

function updateFlags(last_command_result){
    setValueByName("flag", "ZF", (last_command_result === 0) ? 1 : 0);
    //TODO CF
    return last_command_result;
}

// Реализация команд

function MOV(res_reg, reg) {
    registry[res_reg] = getValue(reg);
}

function MOV_LIT(res_op1, literal){
    console.log("mov literal todo");
}

function ADD(res_reg, reg1, reg2) {
    let result = getValue(reg1) + getValue(reg2);
    registry[res_reg] = updateFlags(result);
}

function CMP(op2, op3) {
    let result = getValue(op2) - getValue(op3);
    updateFlags(result);
}


// PC++ after successfull jump i needed to not execute the MARK command again
function JMP(where_to_jump) {
    if(where_to_jump in mark_registry){
        let jump_pos = mark_registry[where_to_jump];
        PC = parseInt(jump_pos, 10);
    } 
    incrementPC();
}

function JZ(where_to_jump) {
    if (getValueByName("flag", "ZF") === 1) {
        if(where_to_jump in mark_registry){
            let jump_pos = mark_registry[where_to_jump];
            PC = parseInt(jump_pos, 10);
        } 
        incrementPC();
    }
}

function JNZ(where_to_jump) {
    if (getValueByName("flag", "ZF") === 0) {
        if(where_to_jump in mark_registry){
            let jump_pos = mark_registry[where_to_jump];
            PC = parseInt(jump_pos, 10);
        } 
        incrementPC();
    }
}

function MARK(mark_name) {
    mark_registry[mark_name] = PC;
}

function VAR(memory_address, literal){
    console.log("var todo");
}

function ARR_ALLOC(memory_address, length){
    console.log("array alloc todo");
}

function SET_MEM_OFFSET(memory_address, literal, offset){
    console.log("set memory offset todo");
}

function MOV_MEM_OFFSET(res_op1, memory_op2, offset_op3) {
    if (memory_op2 in memory){
        let array = memory[memory_op2].trim().split(' ')
        registry[res_op1] = getValue(array[getValue(offset_op3)]);
    }
    else registry[res_op1] = getValue(memory_op2);
}
