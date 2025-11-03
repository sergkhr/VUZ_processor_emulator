// ====================================================
//              ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ====================================================
let PC = 0;             // 0
const PC_ui = document.getElementById("pc")          

let ass_code = [];      // Массив с кодом ассемблера по строкам
let speed = 0;          // Шагов (строк) программы в секунду
let isRunning = false;  // Флаг режима выполнения кода по шагам
let timeoutId = null;   // id таймера














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

/**
 * gets the code of command
 * @param {string} command_name 
 * @returns {string} - 4 byte string - code of the command, if not found will return ----
 */
function getCommandCode(command_name) {
    const index = command_db.findIndex(cmd => cmd[0] === command_name);
    if (index === -1) {
        console.error("Unknown command:", command_name);
        return "----";
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
        return "UNKNOWN";
    }

    return command_db[index][0]; // возвращаем имя команды
}






//БАЗА ДАННЫХ РЕГИСТРОВ
//название - значение
let register_db = [
    ["reg1",  0],
    ["reg2",  0],
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
    ["reg16", 0]
];

/**
 * gets the 8-bit binary code of a register name
 * @param {string} name 
 * @returns {string} - 8-bit binary code (e.g., "00000000"), or "--------" if not found
 */
function getRegisterCode(name) {
    const index = register_db.findIndex(reg => reg[0] === name);
    if (index === -1) {
        console.error("Unknown register:", name);
        return "--------";
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
 * Gets the value of a register by its name
 * @param {string} name - register name (e.g., "reg1")
 * @returns {number|null} - value of the register, or null if not found
 */
function getRegisterValue(name) {
    const entry = register_db.find(reg => reg[0] === name);
    if (!entry) {
        console.error("Unknown register:", name);
        return null;
    }
    return entry[1];
}

/**
 * Gets the value of a register by its 8-bit binary code
 * @param {string} code - 8-bit binary string (e.g., "00000000")
 * @returns {number|null} - value of the register, or null if not found
 */
function getRegisterValueByCode(code) {
    const index = parseInt(code, 2);
    if (isNaN(index) || index < 0 || index >= register_db.length) {
        console.error("Invalid register code:", code);
        return null;
    }
    return register_db[index][1];
}





// БАЗА ДАННЫХ ПАМЯТИ
// название (строка) — значение (число)
let memory_db = [];

/**
 * gets the 8-bit binary code of a memory address
 * @param {string|number} address 
 * @returns {string} - 8-bit binary code (e.g., "00000000"), or "--------" if not found
 */
function getMemoryCode(address) {
    const index = memory_db.findIndex(cell => cell[0] === address);
    if (index === -1) {
        console.error("Unknown memory address:", address);
        return "--------";
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
 * Gets the value stored at a memory address
 * @param {string|number} address 
 * @returns {number|null}
 */
function getMemoryValue(address) {
    const entry = memory_db.find(cell => cell[0] === address);
    if (!entry) {
        console.error("Unknown memory address:", address);
        return null;
    }
    return entry[1];
}

/**
 * Gets the value of memory cell by its 8-bit binary code (index)
 * @param {string} code - 8-bit binary string
 * @returns {number|null}
 */
function getMemoryValueByCode(code) {
    const index = parseInt(code, 2);
    if (isNaN(index) || index < 0 || index >= memory_db.length) {
        console.error("Invalid memory code:", code);
        return null;
    }
    return memory_db[index][1];
}









// БАЗА ДАННЫХ МЕТОК (MARK)
// имя метки — позиция (число)
let mark_db = [];

/**
 * gets the 8-bit binary code of a mark name
 * @param {string} name 
 * @returns {string} - 8-bit binary code (e.g., "00000000"), or "--------" if not found
 */
function getMarkCode(name) {
    const index = mark_db.findIndex(mark => mark[0] === name);
    if (index === -1) {
        console.error("Unknown mark:", name);
        return "--------";
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
 * Gets the position of a mark by its name
 * @param {string} name - mark name (e.g., "loop")
 * @returns {number|null}
 */
function getMarkPosition(name) {
    const entry = mark_db.find(mark => mark[0] === name);
    if (!entry) {
        console.error("Unknown mark:", name);
        return null;
    }
    return entry[1];
}

/**
 * Gets the position of a mark by its 8-bit binary code
 * @param {string} code - 8-bit binary string
 * @returns {number|null}
 */
function getMarkPositionByCode(code) {
    const index = parseInt(code, 2);
    if (isNaN(index) || index < 0 || index >= mark_db.length) {
        console.error("Invalid mark code:", code);
        return null;
    }
    return mark_db[index][1];
}









// БАЗА ДАННЫХ ФЛАГОВ
// название флага — значение (0 или 1)
let flag_db = [
    ["ZF", 0],
    ["CF", 0]
];

/**
 * gets the 4-bit binary code of a flag name
 * @param {string} name 
 * @returns {string} - 4-bit binary code (e.g., "0000"), or "----" if not found
 */
function getFlagCode(name) {
    const index = flag_db.findIndex(flag => flag[0] === name);
    if (index === -1) {
        console.error("Unknown flag:", name);
        return "----";
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

/**
 * Gets the value of a flag by its name
 * @param {string} name 
 * @returns {number|null} - 0 or 1
 */
function getFlagValue(name) {
    const entry = flag_db.find(flag => flag[0] === name);
    if (!entry) {
        console.error("Unknown flag:", name);
        return null;
    }
    return entry[1];
}

/**
 * Gets the value of a flag by its 4-bit binary code
 * @param {string} code 
 * @returns {number|null}
 */
function getFlagValueByCode(code) {
    const index = parseInt(code, 2);
    if (isNaN(index) || index < 0 || index >= flag_db.length) {
        console.error("Invalid flag code:", code);
        return null;
    }
    return flag_db[index][1];
}













// ====================================================
//                   ДЛЯ КОМПИЛЯТОРА
// ====================================================




// "имя" -> "бинарный код"

const COMMAND_TO_BINARY = {
    "MOV":            "0000",
    "MOV_LIT":        "0001",
    "ADD":            "0010",
    "CMP":            "0011",
    "JMP":            "0100",
    "JZ":             "0101",
    "JNZ":            "0110",
    "MARK":           "0111",
    "VAR":            "1000",
    "ARR_ALLOC":      "1001",
    "SET_MEM_OFFSET": "1010",
    "MOV_MEM_OFFSET": "1011"
};

const REGISTER_TO_BINARY = {
    "reg1":  "00000000",
    "reg2":  "00000001",
    "reg3":  "00000010",
    "reg4":  "00000011",
    "reg5":  "00000100",
    "reg6":  "00000101",
    "reg7":  "00000110",
    "reg8":  "00000111",
    "reg9":  "00001000",
    "reg10": "00001001",
    "reg11": "00001010",
    "reg12": "00001011",
    "reg13": "00001100",
    "reg14": "00001101",
    "reg15": "00001110",
    "reg16": "00001111"
};

const FLAG_TO_BINARY = {
    "ZF": "0000",
    "CF": "0001"
};

let MARK_TO_BINARY = {};

let MEMORY_TO_BINARY = {};


// ====================================================
//                      ПАМЯТЬ
// ====================================================


// "бинарный код" -> "значение"

let REGISTER_BINARY_TO_STATE = {
    "00000000": 0, // reg1
    "00000001": 0, // reg2
    "00000010": 0, // reg3
    "00000011": 0, // reg4
    "00000100": 0, // reg5
    "00000101": 0, // reg6
    "00000110": 0, // reg7
    "00000111": 0, // reg8
    "00001000": 0, // reg9
    "00001001": 0, // reg10
    "00001010": 0, // reg11
    "00001011": 0, // reg12
    "00001100": 0, // reg13
    "00001101": 0, // reg14
    "00001110": 0, // reg15
    "00001111": 0  // reg16
};

// в значении: 0 или 1
// TODO: либо сделать boolean true/false
let FLAG_BINARY_TO_STATE = {
    "0000": 0, // ZF
    "0001": 0 // CF
};

let MARK_BINARY_TO_STATE = {};

let MEMORY_BINARY_TO_STATE = {};

let _dict_name_to_binary = {
    "command": COMMAND_TO_BINARY,
    "register": REGISTER_TO_BINARY,
    "flag": FLAG_TO_BINARY,
    "mark": MARK_TO_BINARY,
    "memory": MEMORY_TO_BINARY
}

let _dict_name_binary_to_state = {
    "register": REGISTER_BINARY_TO_STATE,
    "flag": FLAG_BINARY_TO_STATE,
    "mark": MARK_BINARY_TO_STATE,
    "memory": MEMORY_BINARY_TO_STATE
}

// TODO: возможно претерпит изменения, но должен пригодиться...
/**
 * Поиск в словарях перевода в бинарные значения
 * @param {string} dict_name - название чему принадлежит "command"/"register"/"flag"/"mark"/"memory"
 * @param {string} op - название команды/регистра/флага/марки/переменной_в_памяти
 * @returns {string} - бинарное значение из нужного словаря
 */
function findFromNameToBinary(dict_name, op) {
    return _dict_name_to_binary[dict_name][op];
}

// TODO: возможно претерпит изменения, но должен пригодиться...
/**
 * Поиск/проверка в словарях значения ячейки
 * @param {string} dict_name - название чему принадлежит "command"/"register"/"flag"/"mark"/"memory"
 * @param {string} op - бинарное значение
 * @returns {string} - значение ячейки из нужного словаря
 */
function findFromBinaryToState(dict_name, op) {
    if (op in _dict_name_binary_to_state[dict_name]){
        return _dict_name_binary_to_state[dict_name][op];
    }
    return undefined;
}

// TODO: возможно претерпит изменения, но должен пригодиться...
/**
 * Значение из имени
 * @param {string} dict_name - название чему принадлежит "command"/"register"/"flag"/"mark"/"memory"
 * @param {string} op - название команды/регистра/флага/марки/переменной_в_памяти
 * @returns {string} - значение ячейки из нужного словаря
 */
function getValueByName(dict_name, op) {
    return findFromBinaryToState(dict_name, findFromNameToBinary(dict_name, op));
}

// TODO: возможно претерпит изменения, но должен пригодиться...
/**
 * Значение из имени
 * @param {string} dict_name - название чему принадлежит "command"/"register"/"flag"/"mark"/"memory"
 * @param {string} binary - бинарное значение
 * @returns {string} - название команды/регистра/флага/марки/переменной_в_памяти
 */
function getNameByBinary(dict_name, binary) {
    const object = _dict_name_to_binary[dict_name];
    return Object.keys(object).find(key => object[key] === binary);
}




// TODO: возможно претерпит изменения, но должен пригодиться...
/**
 * Значение из имени
 * @param {string} dict_name - название чему принадлежит "command"/"register"/"flag"/"mark"/"memory"
 * @param {string} op - название команды/регистра/флага/марки/переменной_в_памяти
 * @param {value} value - устанавливаемое значение
 * @returns {string} - успешность операции
 */
function setValueByName(dict_name, op, value) {
    _dict_name_binary_to_state[dict_name][findFromNameToBinary(dict_name, op)] = value;
    return true; //если кто-то хочет может сделать нормальную проверку успешности
}


/**
 * Установка значения по бинарному
 * @param {string} dict_name - название чему принадлежит "command"/"register"/"flag"/"mark"/"memory"
 * @param {string} op - бинарное значение
 * @param {BigInteger} value - значение, которое кладем 
 * @returns {boolean} - успешность операции 
 */
function setValueByBinary(dict_name, op, value) {
    _dict_name_binary_to_state[dict_name][op] = value;
    return true; //если кто-то хочет может сделать нормальную проверку успешности
}


/**
 * Сброс:
 * - регистров,
 * - памяти,
 * - флагов,
 * - счетчика команд.
 */
function resetRegMemFlagPC() {
    //регистры в ноль
    Object.keys(REGISTER_BINARY_TO_STATE).forEach(key => {
        REGISTER_BINARY_TO_STATE[key] = 0;
    });
    //флаги в ноль
    Object.keys(FLAG_BINARY_TO_STATE).forEach(key => {
        FLAG_BINARY_TO_STATE[key] = 0;
    });

    MARK_BINARY_TO_STATE = {};
    MEMORY_BINARY_TO_STATE = {};
    
    PC = -1;
    incrementPC();
}