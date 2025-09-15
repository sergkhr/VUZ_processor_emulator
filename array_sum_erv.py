mass_n: int = 10
mass_body: int = [4, 5, 6, 7, 8, 2, 3, 1, 0, 9]
mass_sum = 0
i = 0
while i != mass_n:
    mass_element = mass_body[i]
    mass_sum += mass_element
    i += 1
print(mass_sum)
