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
        case command_registry.get("MOV"):
            MOV(res_address, first_operand)
        case command_registry.get("MOV_OFFSET"):
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


if __name__ == "__main__":
    main()


