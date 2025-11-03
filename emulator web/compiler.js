

function compileCodeInput(){
    const rawCode = document.getElementById('codeInput').value;
    if (!rawCode) {
        document.getElementById('output').textContent = "ERROR: The code field is empty!";
        return {done: false, code: ass_code};
    }
    let ass_code = rawCode.split('\n')
        // .map(line => line.split(';')[0].trim()) // убираем комментарии и пробелы
        // .filter(line => line)                   // убираем пустые строки
        .map(line => line.split(/\s+/));        // разделяем по пробелам
    
    if (ass_code.length === 0) {
        document.getElementById('output').textContent = "ERROR: No instruction was found!";
        return {done: false, code: ass_code};
    }

    return {done: true, code: ass_code};
}



// ====================================================
//                 КОМПИЛЯЦИЯ КОММАНД
// ====================================================


function compile_command(command, res_op1, op2, op3) {
    const compile_command_dict = {
        "":               "",
        "MOV":            compile_MOV(res_op1, op2),
        "MOV_LIT":        compile_MOV_LIT(res_op1, op2),
        "ADD":            compile_ADD(res_op1, op2, op3),
        "CMP":            compile_CMP(op2, op3),
        "JMP":            compile_JMP(res_op1),
        "JZ":             compile_JZ(res_op1),
        "JNZ":            compile_JNZ(res_op1),
        "MARK":           compile_MARK(res_op1),
        "VAR":            compile_VAR(res_op1, op2),
        "ARR_ALLOC":      compile_ARR_ALLOC(res_op1, op2),
        "SET_MEM_OFFSET": compile_SET_MEM_OFFSET(res_op1, op2, op3),
        "MOV_MEM_OFFSET": compile_MOV_MEM_OFFSET(res_op1, op2, op3)
    }
    
    if(command in compile_command_dict) compile_command_dict[command];
    else console.error("(compile) Unknown command: ", command);
}



function compile_MOV(res_reg, reg, placeholder) {
    
}

function compile_MOV_LIT(res_op1, literal, placeholder){
    
}

function compile_ADD(res_reg, reg1, reg2) {
    
}

function compile_CMP(placeholder, op2, op3) {
    
}

function compile_JMP(where_to_jump, placeholder1, placeholder2) {
    
}

function compile_JZ(where_to_jump, placeholder1, placeholder2) {
    
}

function compile_JNZ(where_to_jump, placeholder1, placeholder2) {

}

function compile_MARK(mark_name, placeholder1, placeholder2) {
    
}

function compile_VAR(memory_address, literal, placeholder){

}

function compile_ARR_ALLOC(memory_address, length, placeholder){

}

function compile_SET_MEM_OFFSET(memory_address, literal, offset){

}

function compile_MOV_MEM_OFFSET(res_op1, memory_op2, offset_op3) {
    
}
