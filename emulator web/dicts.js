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