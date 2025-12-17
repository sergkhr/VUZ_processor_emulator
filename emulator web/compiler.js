

function compileCodeInput(){
    const rawCode = document.getElementById('codeInput').value;
    if (!rawCode) {
        document.getElementById('output').textContent = "ERROR: The code field is empty!";
        return {done: false, code: ass_code};
    }
    let ass_code = rawCode.split('\n')          // разделяем по строкам
        .map(line => line.split(/\s+/));        // разделяем по пробелам
    
    if (ass_code.length === 0) {
        document.getElementById('output').textContent = "ERROR: No instruction was found!";
        return {done: false, code: ass_code};
    }

    let compiled_code = compileCode(ass_code);
    
    if(!compiled_code) return {done: false, code: compiled_code};
    mark_db.forEach(mark => {
        if(mark[DB.value] === "?"){
            alert("Error during compilation: mark", mark[DB.name], "not defined");
            return {done: false, code: compiled_code};
        }
    });

    _dict_name_db = { //обновление здесь 1 раз и после этого оно обновляется само... JS moment
        "command": command_db,
        "register": register_db,
        "flag": flag_db,
        "mark": mark_db,
        "memory": memory_db
    }
    return {done: true, code: compiled_code};
}

function compileCode(ass_code){
    let compiled_code = [];
    // console.log(ass_code);
    ass_code.forEach((code_line, index) => {
        const target_length = 4;
        for (let i = code_line.length; i < target_length; i++) code_line.push("");

        let command_line = compile_command(code_line[0], code_line[1], code_line[2], code_line[3], index);
        if(!command_line) {
            alert("Error during compilation at line " + (index+1).toString()); // не хорошо алертить тут, но пока так, а то поднимать индекс надо
            return undefined;
        };
        compiled_code.push(command_line);
    });

    return compiled_code;
}




// ====================================================
//                 ВЫДЕЛЕНИЕ ПАМЯТИ
// ====================================================

function setMark(mark_name, value="?"){
    let mark_code = getMarkCode(mark_name);
    if(!mark_code) mark_db.push([mark_name, "?"]);
    
    mark_code = getMarkCode(mark_name);
    if(value !== "?") getMarkByCode(mark_code)[DB.value] = value;
}



// ====================================================
//                 КОМПИЛЯЦИЯ КОММАНД
// ====================================================


function compile_command(command_name, res_op1, op2, op3, index) {
    if (command_name === "") return ["", "", "", "",];
    
    let command_line = [];
    const command_code = getCommandCode(command_name);
    if (!command_code) return ["", "", "", "",];

    command_line.push(command_code);
    const command = getCommandByCode(command_code);


    let compiled_command = command[DB.compile](res_op1, op2, op3, index);
    if (!compiled_command) return undefined;

    compiled_command.forEach(element => {
        command_line.push(element);
    });
    return command_line;
}




function compile_MOV(res_reg_name, reg_name, placeholder) {
    let command_tail = [];
    
    let res_reg_code = getRegisterCode(res_reg_name);
    if(!res_reg_code) return undefined;
    command_tail.push(res_reg_code);

    let reg_code = getRegisterCode(reg_name);
    if(!reg_code) return undefined;
    command_tail.push(reg_code);

    command_tail.push("00000000");

    return command_tail;
}

function compile_MOV_LIT(res_reg_name, literal, placeholder){
    let command_tail = [];
    
    let res_reg_code = getRegisterCode(res_reg_name);
    if(!res_reg_code) return undefined;
    command_tail.push(res_reg_code);

    let literal_code = toTwosComplementBinary(literal);
    if(!literal_code || literal_code.length !== 8) return undefined;
    command_tail.push(literal_code);

    command_tail.push("00000000");

    return command_tail;
}

function compile_ADD(res_reg_name, reg1_name, reg2_name) {
    let command_tail = [];

    let res_reg_code = getRegisterCode(res_reg_name);
    if(!res_reg_code) return undefined;
    command_tail.push(res_reg_code);

    let reg1_code = getRegisterCode(reg1_name);
    if(!reg1_code) return undefined;
    command_tail.push(reg1_code);

    let reg2_code = getRegisterCode(reg2_name);
    if(!reg2_code) return undefined;
    command_tail.push(reg2_code);

    return command_tail;
}

function compile_CMP(placeholder, reg1_name, reg2_name) {
    let command_tail = [];

    command_tail.push("00000000");

    let reg1_code = getRegisterCode(reg1_name);
    if(!reg1_code) return undefined;
    command_tail.push(reg1_code);

    let reg2_code = getRegisterCode(reg2_name);
    if(!reg2_code) return undefined;
    command_tail.push(reg2_code);

    return command_tail;
}

function compile_JMP(mark_name, placeholder1, placeholder2) {
    let command_tail = [];

    let mark_code = getMarkCode(mark_name);
    if(!mark_code) setMark(mark_name);
    command_tail.push(getMarkCode(mark_name));

    command_tail.push("00000000");

    command_tail.push("00000000");

    return command_tail;
}

function compile_JZ(mark_name, placeholder1, placeholder2) {
    let command_tail = [];

    let mark_code = getMarkCode(mark_name);
    if(!mark_code) setMark(mark_name);
    command_tail.push(getMarkCode(mark_name));

    command_tail.push("00000000");

    command_tail.push("00000000");

    return command_tail;
}

function compile_JNZ(mark_name, placeholder1, placeholder2) {
    let command_tail = [];

    let mark_code = getMarkCode(mark_name);
    if(!mark_code) setMark(mark_name);
    command_tail.push(getMarkCode(mark_name));

    command_tail.push("00000000");

    command_tail.push("00000000");

    return command_tail;
}

function compile_MARK(mark_name, placeholder1, placeholder2, index) {
    let command_tail = [];

    setMark(mark_name, index); 
    command_tail.push(getMarkCode(mark_name));

    command_tail.push("00000000");

    command_tail.push("00000000");

        return command_tail;
}

function compile_VAR(memory_name, literal, placeholder){
    let command_tail = [];

    let memory_code = getMemoryCode(memory_name);
    if(memory_code) return undefined; // аллокация уже существующей ячейки - error
    memory_db.push([memory_name, "?"]);
    command_tail.push(getMemoryCode(memory_name));

    let literal_code = toTwosComplementBinary(literal);
    if(!literal_code || literal_code.length !== 8) return undefined;
    command_tail.push(literal_code);

    command_tail.push("00000000");

    return command_tail;
}

function compile_ARR_ALLOC(memory_name, length, placeholder){
    let command_tail = [];

    let memory_code = getMemoryCode(memory_name);
    if(memory_code) return undefined; // аллокация уже существующей ячейки - error
    for(let i = 0; i < length; i++){
        memory_db.push([memory_name, "?"]);
    }
    command_tail.push(getMemoryCode(memory_name));

    let literal_code = toTwosComplementBinary(length);
    if(!literal_code || literal_code.length !== 8) return undefined;
    command_tail.push(literal_code);

    command_tail.push("00000000");

    return command_tail;
}

function compile_SET_MEM_OFFSET(memory_name, reg_name, offset){
    let command_tail = [];

    let memory_code = getMemoryCode(memory_name);
    if(!memory_code) return undefined;
    command_tail.push(memory_code);

    let reg_code = getRegisterCode(reg_name);
    if(!reg_code) return undefined;
    command_tail.push(reg_code);

    let literal_code = toTwosComplementBinary(offset);
    if(!literal_code || literal_code.length !== 8) return undefined;
    command_tail.push(literal_code);

    return command_tail;
}

function compile_MOV_MEM_OFFSET(res_reg_name, memory_name, offset) {
    let command_tail = [];

    let res_reg_code = getRegisterCode(res_reg_name);
    if(!res_reg_code) return undefined;
    command_tail.push(res_reg_code);

    let memory_code = getMemoryCode(memory_name);
    if(!memory_code) return undefined;
    command_tail.push(memory_code);

    let literal_code = toTwosComplementBinary(offset);
    if(!literal_code || literal_code.length !== 8) return undefined;
    command_tail.push(literal_code);

    return command_tail;
}

function compile_MOV_MEM_OFFSET_REG(res_reg_name, memory_name, offset_reg_name) {
    let command_tail = [];

    let res_reg_code = getRegisterCode(res_reg_name);
    if(!res_reg_code) return undefined;
    command_tail.push(res_reg_code);

    let memory_code = getMemoryCode(memory_name);
    if(!memory_code) return undefined;
    command_tail.push(memory_code);

    let offset_reg_code = getRegisterCode(offset_reg_name);
    if(!offset_reg_code) return undefined;
    command_tail.push(offset_reg_code);

    return command_tail;
}


// Преобразует число (например, -5) в 8-битную бинарную строку ("11111011")
function toTwosComplementBinary(value) {
    let num = parseInt(value, 10);
    // & 0xFF обрезает число до 8 бит и корректно обрабатывает отрицательные числа
    // >>> 0 заставляет JS трактовать число как беззнаковое для корректного toString
    return (num >>> 0 & 0xFF).toString(2).padStart(8, "0");
}
