// ====================================================
//              ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ====================================================
let PC = 0;             // 0
const PC_ui = document.getElementById("pc")          

let ass_code = [];      // Массив с кодом ассемблера по строкам
let speed = 0;          // Шагов (строк) программы в секунду
let isRunning = false;  // Флаг режима выполнения кода по шагам
let timeoutId = null;   // id таймера


// example: register_db[i][DB.value] == 0
const DB = {
    name: 0,
    value: 1,
    call: 1,
    compile: 2,
}






// ====================================================
//              НОВЫЙ СПОСОБ ВЕДЕНИЯ ДАННЫХ
// ====================================================




//БАЗА ДАННЫХ КОМАНД
//название - функция эмулятора - функция компилятора
const command_db = [
    ["MOV",            MOV,            compile_MOV],
    ["MOV_LIT",        MOV_LIT,        compile_MOV_LIT],
    ["ADD",            ADD,            compile_ADD],
    ["CMP",            CMP,            compile_CMP],
    ["JMP",            JMP,            compile_JMP],
    ["JZ",             JZ,             compile_JZ],
    ["JNZ",            JNZ,            compile_JNZ],
    ["MARK",           MARK,           compile_MARK],
    ["VAR",            VAR,            compile_VAR],
    ["ARR_ALLOC",      ARR_ALLOC,      compile_ARR_ALLOC],
    ["SET_MEM_OFFSET", SET_MEM_OFFSET, compile_SET_MEM_OFFSET],
    ["MOV_MEM_OFFSET", MOV_MEM_OFFSET, compile_MOV_MEM_OFFSET],
];


//БАЗА ДАННЫХ РЕГИСТРОВ
//название - значение
let register_db = [
    ["sum",  0],
    ["iterator",  0],
    ["reg3",  0],
    ["reg4",  0],
    ["reg5",  0],
    ["reg6",  0],
    ["reg7",  0],
    ["reg8",  0],
    ["reg9",  0],
    ["reg10", 0],
    ["reg11", 0],
    ["reg12", 0],
    ["reg13", 0],
    ["reg14", 0],
    ["reg15", 0],
    ["result", 0]
];


// БАЗА ДАННЫХ ПАМЯТИ   (аллокация на компиляции)
// название (строка) - значение (число, ? - аллоцировано, но не знадано пока)
let memory_db = [];


// БАЗА ДАННЫХ МЕТОК (MARK)
// имя метки - позиция (число, если ?, то ошибка компиляции)
let mark_db = [];


// БАЗА ДАННЫХ ФЛАГОВ
// название флага - значение (0 или 1)
let flag_db = [
    ["ZF", 0],
    ["CF", 0]
];


let _dict_name_db = {
    "command": command_db,
    "register": register_db,
    "flag": flag_db,
    "mark": mark_db,
    "memory": memory_db
}



// ====================================================
//              ФУНКЦИИ ДЛЯ БАЗ ДАННЫХ
// ====================================================



/**
 * gets the code of command
 * @param {string} command_name 
 * @returns {string} - 4 byte string - code of the command, if not found will return ----
 */
function getCommandCode(command_name) {
    const index = command_db.findIndex(cmd => cmd[0] === command_name);
    if (index === -1) {
        console.error("Unknown command:", command_name);
        return undefined;
    }

    // Преобразуем индекс в двоичный формат с заполнением нулями до 4 бит
    return index.toString(2).padStart(4, "0");
}

/**
 * gets the full command entry from command_db
 * @param {string} command_name 
 * @returns {Array|null} - full command array [name, runtimeFn, compileFn] or null if not found
 */
function getCommandByName(command_name) {
    const index = command_db.findIndex(cmd => cmd[0] === command_name);
    if (index === -1) {
        console.error("Unknown command:", command_name);
        return null;
    }

    return command_db[index];
}

/**
 * gets the name of command by its 4-bit binary code
 * @param {string} code - 4-bit binary string (e.g. "0000")
 * @returns {string} - command name, or "UNKNOWN" if not found
 */
function getCommandByCode(code) {
    const index = parseInt(code, 2);
    if (isNaN(index) || index < 0 || index >= command_db.length) {
        console.error("Invalid code:", code);
        return undefined;
    }

    return command_db[index];
}



/**
 * gets the 8-bit binary code of a register name
 * @param {string} name 
 * @returns {string} - 8-bit binary code (e.g., "00000000"), or "--------" if not found
 */
function getRegisterCode(name) {
    const index = register_db.findIndex(reg => reg[0] === name);
    if (index === -1) {
        console.error("Unknown register:", name);
        return undefined;
    }
    return index.toString(2).padStart(8, "0");
}

/**
 * gets the register entry by its 8-bit binary code
 * @param {string} code 
 * @returns {[string, number] | null}
 */
function getRegisterByCode(code) {
    const index = parseInt(code, 2);
    if (isNaN(index) || index < 0 || index >= register_db.length) {
        console.error("Invalid register code:", code);
        return null;
    }
    return register_db[index];
}




/**
 * gets the first 8-bit binary code of a memory address
 * @param {string|number} address 
 * @returns {string} - 8-bit binary code (e.g., "00000000"), or "--------" if not found
 */
function getMemoryCode(name) {
    const index = memory_db.findIndex(cell => cell[DB.name] === name);
    if (index === -1) {
        console.error("Unknown memory address:", name);
        return undefined;
    }
    return index.toString(2).padStart(8, "0");
}

/**
 * gets the memory entry by its 8-bit binary code (index)
 * @param {string} code 
 * @returns {[string|number, number] | null}
 */
function getMemoryByCode(code) {
    const index = parseInt(code, 2);
    if (isNaN(index) || index < 0 || index >= memory_db.length) {
        console.error("Invalid memory code:", code);
        return null;
    }
    return memory_db[index];
}



/**
 * gets the 8-bit binary code of a mark name
 * @param {string} name 
 * @returns {string} - 8-bit binary code (e.g., "00000000"), or "--------" if not found
 */
function getMarkCode(name) {
    const index = mark_db.findIndex(mark => mark[0] === name);
    if (index === -1) {
        console.error("Unknown mark:", name);
        return undefined;
    }
    return index.toString(2).padStart(8, "0");
}

/**
 * gets the mark entry by its 8-bit binary code
 * @param {string} code 
 * @returns {[string, number] | null}
 */
function getMarkByCode(code) {
    const index = parseInt(code, 2);
    if (isNaN(index) || index < 0 || index >= mark_db.length) {
        console.error("Invalid mark code:", code);
        return null;
    }
    return mark_db[index];
}




/**
 * gets the 4-bit binary code of a flag name
 * @param {string} name 
 * @returns {string} - 4-bit binary code (e.g., "0000"), or "----" if not found
 */
function getFlagCode(name) {
    const index = flag_db.findIndex(flag => flag[0] === name);
    if (index === -1) {
        console.error("Unknown flag:", name);
        return undefined;
    }
    return index.toString(2).padStart(4, "0");
}

/**
 * gets the flag entry by its 4-bit binary code
 * @param {string} code 
 * @returns {[string, number] | null}
 */
function getFlagByCode(code) {
    const index = parseInt(code, 2);
    if (isNaN(index) || index < 0 || index >= flag_db.length) {
        console.error("Invalid flag code:", code);
        return null;
    }
    return flag_db[index];
}









// ====================================================
//                    ОБЩИЕ ФУНКЦИИ
// ====================================================




/**
 * Сброс:
 * - регистров,
 * - памяти,
 * - флагов,
 * - счетчика команд.
 */
function resetRegMemFlagPC() {
    //регистры в ноль
    register_db.forEach(reg => {
        reg[DB.value] = 0;
    });
    //флаги в ноль
    flag_db.forEach(flag => {
        flag[DB.value] = 0;
    });

    memory_db = [];
    mark_db = [];
    
    PC = -1;
    incrementPC();
}