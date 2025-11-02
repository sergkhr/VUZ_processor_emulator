

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