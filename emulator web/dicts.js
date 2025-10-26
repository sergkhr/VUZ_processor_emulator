// ====================================================
//              СЛОВАРИ ДЛЯ БИНАРНЫХ ПЕРЕХОДОВ
// ====================================================


// "имя" -> "бинарный код"

const COMMAND_TO_BINARY = {
    "MOV":            "0000",
    "MOV_MEM_OFFSET": "0001",
    "ADD":            "0010",
    "CMP":            "0011",
    "JMP":            "0100",
    "JZ":             "0101",
    "JNZ":            "0110",
    "MARK":           "0111"
};

const REGISTER_TO_BINARY = {
    "reg1":  "0000",
    "reg2":  "0001",
    "reg3":  "0010",
    "reg4":  "0011",
    "reg5":  "0100",
    "reg6":  "0101",
    "reg7":  "0110",
    "reg8":  "0111",
    "reg9":  "1000",
    "reg10": "1001",
    "reg11": "1010",
    "reg12": "1011",
    "reg13": "1100",
    "reg14": "1101",
    "reg15": "1110",
    "reg16": "1111"
};

const FLAG_TO_BINARY = {
    "ZF": "0000",
    "CF": "0001"
};

let MARK_TO_BINARY = {};

let MEMORY_TO_BINARY = {};

// "бинарный код" -> "значение"

let REGISTER_BINARY_TO_STATE = {
    "0000": 0, // reg1
    "0001": 0, // reg2
    "0010": 0, // reg3
    "0011": 0, // reg4
    "0100": 0, // reg5
    "0101": 0, // reg6
    "0110": 0, // reg7
    "0111": 0, // reg8
    "1000": 0, // reg9
    "1001": 0, // reg10
    "1010": 0, // reg11
    "1011": 0, // reg12
    "1100": 0, // reg13
    "1101": 0, // reg14
    "1110": 0, // reg15
    "1111": 0  // reg16
};

// в значении: 0 или 1
// TODO: либо сделать boolean true/false
let FLAG_BINARY_TO_STATE = {
    "0000": 0 // ZF
};

let MARK_BINARY_TO_STATE = {};

let MEMORY_BINARY_TO_STATE = {};

_dict_name_to_binary = {
    "command": COMMAND_TO_BINARY,
    "register": REGISTER_TO_BINARY,
    "flag": FLAG_TO_BINARY,
    "mark": MARK_TO_BINARY,
    "memory": MEMORY_TO_BINARY
}

_dict_name_binary_to_state = {
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
    return _dict_name_binary_to_state[dict_name][op];
}
