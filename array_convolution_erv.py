mass_1_2_n: int = 10
mass_1_body: int = [4, 5, 6, 7, 8, 2, 3, 1, 0, 9]
mass_2_body: int = [4, 5, 6, 7, 8, 2, 3, 1, 0, 9]
mass_1_2_convolution = 0
i = 0
while i != mass_1_2_n:
    mass_1_element = mass_1_body[i]
    mass_2_element = mass_2_body[i]
    multiply_elements_from_mass_1_2 = mass_1_element * mass_2_element
    mass_1_2_convolution += multiply_elements_from_mass_1_2
    i += 1
print(mass_1_2_convolution)
