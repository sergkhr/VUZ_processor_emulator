
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
 * Отображение DEC, U-DEC, HEX, BIN
 */
function updStTbl(register_type) {
    const table = _dict_table[register_type];
    table.innerHTML = '';

    // Генерируем заголовки в зависимости от типа таблицы
    if (register_type === "register") {
        // Для регистров 5 колонок: Name | Dec | U-Dec | Hex | Bin
        table.innerHTML += `
            <div class="state-header">Name</div>
            <div class="state-header">Dec</div>
            <div class="state-header">U-Dec</div>
            <div class="state-header">Hex</div>
            <div class="state-header">Bin</div>
        `;
    } else {
        // Для памяти и флагов оставляем старый формат (или упрощенный)
        table.innerHTML += `
            <div class="state-header">Name</div>
            <div class="state-header">Addr/Code</div>
            <div class="state-header">Value</div>
        `;
    }

    _dict_name_db[register_type].forEach(element => {
        const name = element[DB.name];
        const val = element[DB.value];

        // Получаем код (адрес) как раньше, для совместимости
        const codeOrAddr = _dict_code_getter_db[register_type](element[DB.name]);

        if (register_type === "register") {
            // === ЛОГИКА ДЛЯ РЕГИСТРОВ (Dec, Hex, Bin) ===
            
            // DEC: Знаковое значение (как есть в JS, -128..127)
            let decStr = val.toString();

            // U-DEC (New): Беззнаковое значение (0..255)
            // val >>> 0 приводит к uint32, & 0xFF оставляет только младший байт
            let uDecStr = (val >>> 0 & 0xFF).toString();

            // HEX: Превращаем в байт (0-255), потом в Hex
            let hexStr = (val >>> 0 & 0xFF).toString(16).toUpperCase().padStart(2, '0');

            // BIN: Превращаем в байт, потом в Bin
            let binStr = (val >>> 0 & 0xFF).toString(2).padStart(8, '0');

            table.innerHTML += `
                <div class="state-name">${name}</div>
                <div class="state-data" style="color: #000000;">${decStr}</div>
                <div class="state-data" style="color: #00008B;">${uDecStr}</div>
                <div class="state-data" style="color: #A0522D;">${hexStr}</div>
                <div class="state-data state-bin" style="color: #006400;">${binStr}</div>
            `;
        } else {
            // === ЛОГИКА ДЛЯ ПАМЯТИ, ФЛАГОВ И МЕТОК (Старая) ===
            // Используем div вместо span, чтобы работало с CSS Grid
            table.innerHTML += `
                <div class="state-name">${name}</div>
                <div class="state-data" style="color: #555;">${codeOrAddr}</div>
                <div class="state-data">${val}</div>
            `;
        }
    });
}
function updateStateTables() { 
    updStTbl("register");
    updStTbl("memory");
    updStTbl("flag");
    updStTbl("mark");
    updateGlobalResultDisplay();
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
    const newTop_code = lineNumber * lineHeight_code + 10; // padding-top=10
    const newTop_compiler = lineNumber * lineHeight_compile + 10; // padding-top=10

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

/**
 * Обновляет главную ячейку результата на форме.
 * DEC, HEX (16 bit), BIN (16 bit)
 */
function updateGlobalResultDisplay() {
    const getRegVal = (name) => {
        const reg = register_db.find(r => r[DB.name] === name);
        return reg ? reg[DB.value] : 0;
    };

    // 1. Получаем значения (Low & High bytes)
    let low = getRegVal("result") & 0xFF;
    let high = getRegVal("result_EXT"); // Знак здесь важен для Dec

    // 2. Склеиваем в 16-битное число
    // (high << 8) | low
    let combinedValue = (high << 8) | low;

    // 3. Формирование строк
    
    // HEX: всегда 4 символа (FFFF)
    let hexStr = (combinedValue >>> 0 & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');

    // BIN: 16 бит (0000000000000000)
    let rawBin = (combinedValue >>> 0 & 0xFFFF).toString(2).padStart(16, '0');
    // Разбиваем на два байта для красоты: "00000000 00000000"
    let binStr = rawBin.slice(0, 8) + ' ' + rawBin.slice(8);

    // 4. Вывод в HTML
    const resDecInfo = document.getElementById('global-res-dec');
    const resHexInfo = document.getElementById('global-res-hex');
    const resBinInfo = document.getElementById('global-res-bin');

    if (resDecInfo) resDecInfo.textContent = combinedValue;
    if (resHexInfo) resHexInfo.textContent = `0x${hexStr}`;
    if (resBinInfo) resBinInfo.textContent = binStr;
}
