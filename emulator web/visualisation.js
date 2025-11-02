
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
 * Создание/обновление таблиц регистров и памяти
 */
function updStTbl(register_type){
    _dict_table[register_type].innerHTML = '';
    for (const [name, value] of Object.entries(_dict_name_to_binary[register_type])) {
        _dict_table[register_type].innerHTML += `<span class="state-name">${name}:</span><span class="state-data">${value}</span><span class="state-data">${_dict_name_binary_to_state[register_type][value]}</span>`;
    }
}
function updateStateTables() { 
    updStTbl("register");
    updStTbl("memory");
    updStTbl("flag");
    updStTbl("mark");
}

const codeInput = document.getElementById('codeInput');
const highlighter = document.getElementById('highlighter');

/**
 * Подсветка выполнЯЕМОЙ строки кода (== PC)
 */
function highlightCurrentLine(lineNumber) {
   
    if (lineNumber < 0) {
        highlighter.style.display = 'none';
        return
    }

    const lineHeight = parseFloat(getComputedStyle(codeInput).lineHeight);
    const newTop = lineNumber * lineHeight + 15; // padding-top=15

    highlighter.style.top = `${newTop}px`;
    highlighter.style.display = 'block';
    //TODO: добавить после подсветки строки асс-кода подсветку измененного регистра или памяти
}

/**
 * Синхронизация позиции подсветки при скорлле
 */
function syncScroll() {
    // TODO: есть баги, подсветка отображается у невидимых строк
    highlighter.style.transform = `translateY(-${codeInput.scrollTop}px)`;
}

/**
 * Блокировка/разблокировка кнопок управления
 */
function setButtonsDisabled(disabled) {
    document.getElementById('runBtn').disabled  = disabled;
    document.getElementById('stepBtn').disabled = disabled;
}