import itertools

characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
combinations = list(itertools.product(characters, repeat=3))

with open('combinations.txt', 'w') as f:
    for combination in combinations:
        f.write(''.join(combination) + '\n')