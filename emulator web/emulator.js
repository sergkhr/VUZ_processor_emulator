$(document).ready(function () {
    initRegistryTable();
    initMemoryTable();
});


function initRegistryTable() {
    const $table = $('#registry-table');
    $table.empty(); // очищаем на всякий случай

    for (const [name, value] of Object.entries(registry)) {
        // const $li = $('<li></li>');
        const $nameSpan = $('<span class="registry-name"></span>').text(name);
        const $dataSpan = $('<span class="registry-data"></span>').text(value).attr('data-registry-key', name);

        // $li.append($nameSpan).append($dataSpan);
        $table.append($nameSpan).append($dataSpan);
    }
}

function updateRegistryTable() {
    for (const [name, value] of Object.entries(registry)) {
        $(`#registry-table>.registry-data[data-registry-key="${name}"]`).text(value);
    }
}

function initMemoryTable() {
    const $table = $('#memory-table');
    $table.empty(); // очищаем на всякий случай

    for (const [name, value] of Object.entries(memory)) {
        // const $li = $('<li></li>');
        const $nameSpan = $('<span class="registry-name"></span>').text(name);
        const $dataSpan = $('<span class="registry-data"></span>').text(value).attr('data-registry-key', name);

        // $li.append($nameSpan).append($dataSpan);
        $table.append($nameSpan).append($dataSpan);
    }
}

function updateMemoryTable() {
    for (const [name, value] of Object.entries(memory)) {
        $(`#memory-table>.registry-data[data-registry-key="${name}"]`).text(value);
    }
}

function updateTables(){
    updateRegistryTable();
    initMemoryTable();
}




// Дальше бога нет (эмулятор)

// Регистры памяти
let registry = {
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
    "reg16": 0,
};

let memory = {};

let ass_code;


// Флаги
let ZF = 0;


// Регистры команд
let command_registry = {
    "MOV": 0,
    "MOV_OFFSET": 1,
    "ADD": 2,
    "CMP": 3,
    "JMP": 4,
    "JZ": 5,
    "JNZ": 6,
};

let PC = 0; // 0


// Команды (в command нужно класть числа - получаемые из регистра команд)
function call_command(command, res_address, first_operand, second_operand) {
    switch (command) {
        case command_registry["MOV"]:
            MOV(res_address, first_operand);
            break;
        case command_registry["MOV_OFFSET"]:
            MOV_OFFSET(res_address, first_operand, second_operand);
            break;
        case command_registry["ADD"]:
            ADD(res_address, first_operand, second_operand);
            break;
        case command_registry["CMP"]:
            CMP(first_operand, second_operand);
            break;
        case command_registry["JMP"]:
            JMP(res_address);
            break;
        case command_registry["JZ"]:
            JZ(res_address);
            break;
        case command_registry["JNZ"]:
            JNZ(res_address);
            break;
        default:
            console.log("ERROR, lohundra\n" + command + " PC: " + PC);
    }
}


function type_transformer(param, type) {
    let res;
    if (type == 'string') {
        res = param.toString();
    }
    else if (type == 'number') {
        res = +param
    }
    return res
}


function MOV(res_address, operand) {
    // registry[res_address] = typeof operand === "string" ? registry[operand] : operand;
    registry[res_address] = getValue(operand);
}


function MOV_OFFSET(res_address, operand, offset) {
    registry[res_address] = getValue(operand)[getValue(offset)]; // возможен конфликт, если operand — строка
}


// Для АЛУ
function ADD(res_address, first_operand, second_operand) {
    let tmp = getValue(first_operand) + getValue(second_operand);
    // setting flags
    // if(tmp === 0) ZF = 1;
    // else ZF = 0;
    ZF = tmp === 0 ? 1 : 0; // говорят тернарный чуть более эффективен)
    registry[res_address] = tmp;
}


function CMP(first_operand, second_operand) { // а мы оставляем тут первый адрес или нет?
    let tmp = getValue(first_operand) - getValue(second_operand);
    // setting flags
    ZF = tmp === 0 ? 1 : 0;
    console.warn(getValue(first_operand), getValue(second_operand), tmp)
}


function JMP(where_to_jump) {
    PC = parseInt(where_to_jump);
}


function JZ(where_to_jump) { 
    if (ZF === 1) {
        PC = parseInt(where_to_jump);
    }
}


function JNZ(where_to_jump) {
    if (ZF === 0) {
        PC = parseInt(where_to_jump);
    }
}


// programm that will be executed on the emulator... probably
// function main() {
//     // берем файл программы на ассемблере
//     const file_name = "array_sum_ass_code.txt";

//     const fs = require("fs");

//     // считаем файл асс-кода
//     const raw = fs.readFileSync(file_name, "utf8");
//     const ass_code = raw.split('\n').map(line => line.trim().split(' '));

//     console.log(ass_code);

//     // обработка файла асс-кода
//     for (const line of ass_code) {
//         if (line[0] === "") continue;
//         const operation = command_registry[line[0]] ?? -1;
//         if (operation === -1) {
//             console.log("ERR:", line.slice(1));
//             memory[line[0]] = line.slice(1);
//             continue;
//         }
//         console.log("TypeERR:", operation);
//         // передаём аргументы, даже если их может быть меньше
//         call_command(operation, line[1], line[2], line[3]);
//     }

//     console.log(registry["reg16"]);
// }


// Этот getValue хорош, I approve - irvindt
// В целом все надо переписать через getValue

// Вспомогательная функция
function getValue(operand) {
    if (operand in registry) {
        return registry[operand];
    }
    if (operand in memory) {
        return memory[operand];
    }
    const num = +operand;
    return isNaN(num) ? 0 : num;
}


// функция шага основного цикла
function read_line() {
    console.log(PC, " line");
    const line = ass_code[PC-1];
    if (line === "") return 'continue'; //надо проверить делает ли оно вообще свое дело
    const operation = command_registry[line[0]] ?? -1;
    if (operation === -1) {
        memory[line[0]] = line.slice(1).map(str => parseInt(str, 10));
        return 'continue';
    }
    call_command(operation, line[1], line[2], line[3]);


function runCode() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    const output = document.getElementById("output");

    if (!file) {
        output.textContent = "Файл не выбран.";
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const raw = e.target.result;
        const ass_code = raw.split('\n').map(line => line.trim().split(' '));

        // Сброс регистров и памяти перед выполнением
        for (let key in registry) registry[key] = 0;
        for (let key in memory) delete memory[key];
        ZF = 0;
        PC = 1;

        updateTables();

        // Основной цикл выполнения
        for (const line of ass_code) {
            if (line === "") continue; //надо проверить делает ли оно вообще свое дело
            const operation = command_registry[line[0]] ?? -1;
            if (operation === -1) {
                memory[line[0]] = line.slice(1).map(str => parseInt(str, 10));
                continue;
            }
            call_command(operation, line[1], line[2], line[3]);
            
            updateTables();
        }

        output.textContent = `Значение регистра reg16: ${registry["reg16"]}`;
    };


    // Сброс регистров и памяти перед выполнением
    for (let key in registry) registry[key] = 0;
    for (let key in memory) delete memory[key];
    ZF = 0;
    PC = 1;
    
    
    // Основной цикл выполнения
    // for (const line of ass_code) {
    //     if (line === "") continue; //надо проверить делает ли оно вообще свое дело
    //     const operation = command_registry[line[0]] ?? -1;
    //     if (operation === -1) {
    //         memory[line[0]] = line.slice(1).map(str => parseInt(str, 10));
    //         continue;
    //     }
    //     call_command(operation, line[1], line[2], line[3]);
    // }
    console.warn(ass_code.length);
    
    }

    output.textContent = `Значение регистра reg16: ${registry["reg16"]}`;

    reader.readAsText(file);
    console.log(registry);
    console.log(memory)
}

// main();

