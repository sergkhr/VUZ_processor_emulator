/**
 * TODO: TASKS
 * ++ вывод PC на UI;
 * -- прослойка биты-байты:
 *          асс-код
 *              |
 *          перевод в биты-байты (0 и 1) из асс-кода
 *              |
 *          обработка 0 и 1;
 * ?? нужен стек;
 */




// Дальше бога нет (эмулятор)
// или иначе
// ====================================================
//              ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ====================================================


let registry = {};      // Регистры "процессора"
let memory = {};        // Память для данных
let mark_registry = {}; // Регистр меток для переходов
let PC = 0;             // 0

// Флаги
let flag_registry = {
    "ZF": 0,            // Флаг нуля (Zero Flag)
}            

let ass_code = [];      // Массив с кодом ассемблера по строкам
let speed = 0;          // Шагов (строк) программы в секунду
let isRunning = false;  // Флаг режима выполнения кода по шагам
let timeoutId = null;   // id таймера

// Регистры команд
let command_registry = {
    "MOV": 0,
    "MOV_MEM_OFFSET": 1,
    "ADD": 2,
    "CMP": 3,
    "JMP": 4,
    "JZ": 5,
    "JNZ": 6,
    "MARK": 7,
};


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
 * Сброс:
 * - регистров,
 * - памяти,
 * - флагов,
 * - счетчика команд.
 */
function resetRegMemFlagPC() {
    registry = {
        "reg1": 0,
        "reg2": 0,
        "reg3": 0,
        "reg4": 0,
        "reg5": 0,
        "reg6": 0,
        "reg7": 0,
        "reg8": 0,
        "reg9": 0,
        "reg10": 0,
        "reg11": 0,
        "reg12": 0,
        "reg13": 0,
        "reg14": 0,
        "reg15": 0,
        "reg16": 0
    };
    memory = {};
    mark_registry = {};
    flag_registry = {
        "ZF": 0,
    };
    PC = 0;
}


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

    // TODO: устанавливаем правильное состояние кнопки "Шаг"
    processExecSpeed();
}


/**
 * 
 */
function incrementPC() {
    PC++;
    document.getElementById("pc").textContent = PC;
}

// ====================================================
//              ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
// ====================================================


/**
 * Создание/обновление таблиц регистров и памяти
 */
function updateStateTables() {
    const regTable = document.getElementById('registry-table');
    const memTable = document.getElementById('memory-table');
    const flagTable = document.getElementById('flags-table');
    const markTable = document.getElementById('marks-table');
    regTable.innerHTML = '';
    memTable.innerHTML = '';
    flagTable.innerHTML = '';
    markTable.innerHTML = '';

    for (const [name, value] of Object.entries(registry)) {
        regTable.innerHTML += `<span class="state-name">${name}:</span><span class="state-data">${value}</span>`;
    }
    for (const [name, value] of Object.entries(memory)) {
        memTable.innerHTML += `<span class="state-name">${name}:</span><span class="state-data">${value}</span>`;
    }
    for (const [name, value] of Object.entries(flag_registry)) {
        flagTable.innerHTML += `<span class="state-name">${name}:</span><span class="state-data">${value}</span>`;
    }
    for (const [name, value] of Object.entries(mark_registry)) {
        markTable.innerHTML += `<span class="state-name">${name}:</span><span class="state-data">${value}</span>`;
    }
}


/**
 * Подсветка выполнЯЕМОЙ строки кода (== PC)
 */
function highlightCurrentLine(lineNumber) {
    const codeInput = document.getElementById('codeInput');
    const highlighter = document.getElementById('highlighter');
    
    if (lineNumber < 0) {
        highlighter.style.display = 'none';
        return
    }

    const lineHeight = parseFloat(getComputedStyle(codeInput).lineHeight);
    const newTop = lineNumber * lineHeight + 17; // padding-top=15 + для-красоты=2

    highlighter.style.top = `${newTop}px`;
    highlighter.style.display = 'block';
    //TODO: добавить после подсветки строки асс-кода подсветку измененного регистра или памяти
}

/**
 * Синхронизация позиции подсветки при скорлле
 */
function syncScroll() {
    // TODO: есть баги, подсветка отображается у невидимых строк
    const codeInput = document.getElementById('codeInput');
    const highlighter = document.getElementById('highlighter');

    highlighter.style.transform = `translateY(-${codeInput.scrollTop}px)`;
}

// ====================================================
//              ЛОГИКА УПРАВЛЕНИЯ ВЫПОЛНЕНИЕМ
// ====================================================


/**
 * Главная функция выполнения программы
 */
function runCode() {
    // 1. Парсим код из textarea
    const rawCode = document.getElementById('codeInput').value;
    if (!rawCode) {
        document.getElementById('output').textContent = "ERROR: The code field is empty!";
        return false;
    }
    ass_code = rawCode.split('\n')
        // .map(line => line.split(';')[0].trim()) // убираем комментарии и пробелы
        // .filter(line => line)                   // убираем пустые строки
        .map(line => line.split(/\s+/));        // разделяем по пробелам
    
    if (ass_code.length === 0) {
        document.getElementById('output').textContent = "ERROR: No instruction was found!";
        return false;
    }

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
    
    // Существует команда или данные?? Иначе данные
    if (operation === '') {
        incrementPC();
    } else if (operation in command_registry) {
        const command = command_registry[operation];
        call_command(command, line[1], line[2], line[3]);
    } else {
        memory[line[0]] = line.slice(1).join(' ');
        incrementPC();
    }

    updateStateTables();
    highlightCurrentLine(PC); // Переход подсветки
}


/**
 * Выполнение программы - автоматическое
 */
async function executeAutomatically() {
    // if (!isRunning || PC >= ass_code.length) {
    //     if (isRunning) {
    //         document.getElementById('output').textContent = "The program has been completed!";
    //     }
    //     setButtonsDisabled(false);
    //     processExecSpeed();
    //     isRunning = false;
    //     document.getElementById('codeInput').readOnly = false;
    //     highlightCurrentLine(-1);
    //     return;
    // }
    // const delay = 1000 / getExecSpeed();

    // timeoutId = setTimeout(() => {
    //     executeStep();
    //     executeAutomatically();
    // }, delay);
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


/**
 * Блокировка/разблокировка кнопок управления
 */
function setButtonsDisabled(disabled) {
    document.getElementById('runBtn').disabled  = disabled;
    document.getElementById('stepBtn').disabled = disabled;
}


// ====================================================
//              ЛОГИКА КОМАНД ПРОЦЕССОРА
// ====================================================


/**
 * Маршрутизатор команд
 */
function call_command(command, res_op1, op2, op3) {
    const old_PC = PC;
    switch (command) {
        case command_registry["MOV"]: MOV(res_op1, op2); break;
        // case command_registry["MOV_OFFSET"]: MOV_OFFSET(res_op1, op2, op3); break;
        case command_registry["ADD"]: ADD(res_op1, op2, op3); break;
        case command_registry["CMP"]: CMP(op2, op3); break;
        case command_registry["JMP"]: JMP(res_op1); break;
        case command_registry["JZ"]:  JZ(res_op1); break;
        case command_registry["JNZ"]: JNZ(res_op1); break;
        case command_registry["MOV_MEM_OFFSET"]: MOV_MEM_OFFSET(res_op1, op2, op3); break;
        case command_registry["MARK"]: MARK(res_op1); break;
        default:
            console.error("Unknown command:", command);
    }
    if (PC === old_PC) incrementPC();
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
// function getValue(operand) {
//     if (operand in registry) return registry[operand];
//     const num = parseInt(operand, 10);
//     // если не чисто - вернем 0
//     return isNaN(num) ? 0 : num;
// }

// Реализация команд

function MOV(res_op1, op2) {
    registry[res_op1] = getValue(op2);
}

function MOV_MEM_OFFSET(res_op1, memory_op2, offset_op3) {
    if (memory_op2 in memory){
        let array = memory[memory_op2].trim().split(' ')
        registry[res_op1] = getValue(array[getValue(offset_op3)]);
    }
    else registry[res_op1] = getValue(memory_op2)
}

function ADD(res_op1, op2, op3) {
    let result = getValue(op2) + getValue(op3);
    registry[res_op1] = result;
    flag_registry["ZF"] = (result === 0) ? 1 : 0;
}

function CMP(op2, op3) {
    let result = getValue(op2) - getValue(op3);
    flag_registry["ZF"] = (result === 0) ? 1 : 0;
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
    if (flag_registry["ZF"] === 1) {
        if(where_to_jump in mark_registry){
            let jump_pos = mark_registry[where_to_jump];
            PC = parseInt(jump_pos, 10);
        } 
        incrementPC(); // TODO: why?..
    } else {
        incrementPC();
    }
}

function JNZ(where_to_jump) {
    if (flag_registry["ZF"] === 0) {
        if(where_to_jump in mark_registry){
            let jump_pos = mark_registry[where_to_jump];
            PC = parseInt(jump_pos, 10);
        } 
        incrementPC(); // TODO: why?..
    } else {
        incrementPC();
    }
}

function MARK(mark_name) {
    mark_registry[mark_name] = PC;
}
