# Регистры памяти
# Как будто бы можно сделать красивее, но я разучился программировать
reg1 = 0
reg2 = 0
reg3 = 0
reg4 = 0
reg5 = 0
reg6 = 0
reg7 = 0
reg8 = 0
reg9 = 0
reg10 = 0
reg11 = 0
reg12 = 0
reg13 = 0
reg14 = 0
reg15 = 0
reg16 = 0


# Флаги
ZF = 0



# Регистры команд
# Я чет забыл а это надо или...

PC = 1 #1 же?

# Команды
def call_command(command, res_address, first_operand, second_operand):
    match command:
        case "MOV":
            MOV(res_address, first_operand)
        case "ADD":
            ADD(res_address, first_operand, second_operand)
        case "CMP":
            CMP(first_operand, second_operand)



def MOV(res_address, operand):
    res_address = operand


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



# programm that will be executed on the emulator... probably
def main():
    global PC # хз как с этой штукой развлекаться


if __name__ == "__main__":
    main()


