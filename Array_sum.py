

n = int(input())
# Ввод массива данных, здесь не низкоуровневый вариант, 
# так как на ассемблере будем халтурить
array = [0] * n
for i in range(n):
    array[i] = int(input())

ar_sum = 0

i = 0
while i != n: #сделать через if i != n и goto в конце
    ar_sum = ar_sum + array[i] 
    i = i + 1

answer = ar_sum # внутрии эмулятора оставляем это как выходной регистр
print(answer)