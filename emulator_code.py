# Регистры памяти
registry = {
    "reg1" : 0,
    "reg2" : 0,
    "reg3" : 0,
    "reg4" : 0,
    "reg5" : 0,
    "reg6" : 0,
    "reg7" : 0,
    "reg8" : 0,
    "reg9" : 0,
    "reg10" : 0,
    "reg11" : 0,
    "reg12" : 0,
    "reg13" : 0,
    "reg14" : 0,
    "reg15" : 0,
    "reg16" : 0,
}


memory = dict()



# Флаги
ZF = 0


# Регистры команд
command_registry = {
    "MOV" : 0,
    "MOV_OFFSET" : 1,
    "ADD" : 2,
    "CMP" : 3,
    "JMP" : 4,
    "JZ" : 5,
    "JNZ" : 6,
}

PC = 1 #1 же?

# Команды
def call_command(command, res_address, first_operand, second_operand):
    global command_registry
    match command:
        case 0:#command_registry.get("MOV")):
            MOV(res_address, first_operand)
        case int(command_registry.get("MOV_OFFSET")):
            MOV_OFFSET(res_address, first_operand, second_operand)
        case command_registry.get("ADD"):
            ADD(res_address, first_operand, second_operand)
        case command_registry.get("CMP"):
            CMP(first_operand, second_operand)
        case command_registry.get("JMP"):
            JMP(res_address)
        case command_registry.get("JZ"):
            JZ(res_address)
        case command_registry.get("JNZ"):
            JNZ(res_address)
        case _:
            print("ERROR, lohundra")



def MOV(res_address, operand):
    res_address = operand


def MOV_OFFSET(res_address, operand, offset):
    res_address = operand[offset]


# Для АЛУ
def ADD(res_address, first_operand, second_operand):
    tmp = first_operand + second_operand
    # setting flags
    global ZF
    if(tmp == 0):
        ZF = 1
    else:
        ZF = 0
    res_address = tmp


def CMP(first_operand, second_operand): # а мы оставляем тут первый адрес или нет?
    tmp = first_operand - second_operand
    # setting flags
    global ZF
    if(tmp == 0):
        ZF = 1
    else:
        ZF = 0


def JMP(where_to_jump):
    global PC
    PC = where_to_jump


def JZ(where_to_jump): # а нам тут надо 3 адреса?
    global ZF
    global PC
    if(ZF == 1):
        PC = where_to_jump


def JNZ(where_to_jump):
    global ZF
    global PC
    if(ZF == 0):
        PC = where_to_jump


# programm that will be executed on the emulator... probably
def main():
    global PC # хз как с этой штукой развлекаться

    # берем файл программы на ассемблере
    file_name = "array_sum_ass_code.txt"
    
    # считаем файл асс-кода
    with open(file_name, "r") as file_ass:
        ass_code = list(map(lambda line: line.split(' '), file_ass.read().split('\n')))
        # file_ass_binary = ""

    print(ass_code)
    
    # обработка файла асс-кода
    for line in ass_code:
        if line == "":
            continue
        operation = command_registry.get(line[0], -1)
        if operation == -1:
            print("ERR:", line[1:])
            memory[line[0]] = line[1:]
            continue
        print("TypeERR:", operation)
        call_command(operation, line[1], line[2], line[3])
    
    print(registry.get("reg16"))


if __name__ == "__main__":
    main()


