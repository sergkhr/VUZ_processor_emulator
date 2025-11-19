
// ====================================================
//              ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
// ====================================================
const regTable = document.getElementById('registry-table');
const memTable = document.getElementById('memory-table');
const flagTable = document.getElementById('flags-table');
const markTable = document.getElementById('marks-table');
const _dict_table = {
    "register": regTable,
    "flag": flagTable,
    "mark": markTable,
    "memory": memTable
}

/**
 * Вывод скомпилированного кода в compileOutput
 */
function updateCompiledOutput(compilerResult) {
    let tmp_arr = [];
    let tmp = "";
    for (let e of compilerResult.code) {
        tmp_arr.push(e.join(" "));
    }
    tmp = tmp_arr.join("\n");
    document.getElementById("compileOutput").value = tmp;
}

/**
 * Создание/обновление таблиц регистров и памяти
 */
function updStTbl(register_type){
    _dict_table[register_type].innerHTML = '';
    _dict_name_db[register_type].forEach(element => {
        _dict_table[register_type].innerHTML += `
        <span class="state-name">
            ${element[DB.name]}:
        </span>
        <span class="state-data">
            ${_dict_code_getter_db[register_type](element[DB.name])}
        </span>
        <span class="state-data">
            ${element[DB.value]}
        </span>
        `;
    });
}
function updateStateTables() { 
    updStTbl("register");
    updStTbl("memory");
    updStTbl("flag");
    updStTbl("mark");
}

const codeInput = document.getElementById('codeInput');
const compileOutput = document.getElementById('compileOutput');
const highlighter_code = document.getElementById('highlighter-code');
const highlighter_compile = document.getElementById('highlighter-compile');

codeInput.addEventListener('scroll', () => {
    syncScroll(highlighter_code, codeInput);
})

compileOutput.addEventListener('scroll', () => {
    syncScroll(highlighter_compile, compileOutput);
})

/**
 * Синхронизация позиции подсветки при скорлле
 */
function syncScroll(highlighter, inout) {
    // TODO: есть баги, подсветка отображается у невидимых строк
    if (highlighter.style.display !== 'none') {
        highlighter.style.transform = `translateY(-${inout.scrollTop}px)`;
    }
}

/**
 * Подсветка выполнЯЕМОЙ строки кода (== PC)
 */
function highlightCurrentLine(lineNumber) {
    
    if (lineNumber < 0) {
        highlighter_code.style.display = 'none';
        highlighter_compile.style.display = 'none';
        return
    }

    const lineHeight_code = parseFloat(getComputedStyle(codeInput).lineHeight);
    const lineHeight_compile = parseFloat(getComputedStyle(compileOutput).lineHeight);
    const newTop_code = lineNumber * lineHeight_code + 15; // padding-top=15
    const newTop_compiler = lineNumber * lineHeight_compile + 15; // padding-top=15

    highlighter_code.style.top = `${newTop_code}px`;
    highlighter_code.style.display = 'block';

    highlighter_compile.style.top = `${newTop_compiler}px`;
    highlighter_compile.style.display = 'block';
    //TODO: добавить после подсветки строки асс-кода подсветку измененного регистра или памяти
}

/**
 * Блокировка/разблокировка кнопок управления
 */
function setButtonsDisabled(disabled) {
    document.getElementById('runBtn').disabled  = disabled;
    document.getElementById('stepBtn').disabled = disabled;
}