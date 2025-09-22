import tkinter as tk
from tkinter import filedialog
import time

def analyze_file(file_path):
    try:
        start_time = time.time()
        with open(file_path, 'r') as file:
            text = file.read()
            total_chars = len(text)
            words = text.split()
            extra_chars = 0
            for word in words:
                extra_chars += max(0, len(word) - 3)
            percentage = (extra_chars / total_chars) * 100
        end_time = time.time()
        elapsed_time = end_time - start_time
        return extra_chars, percentage, elapsed_time
    except FileNotFoundError:
        print("File not found.")
        return None

def choose_file():
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename()
    if file_path:
        result = analyze_file(file_path)
        if result:
            extra_chars, percentage, elapsed_time = result
            print(f"Character reduction: {extra_chars}")
            print(f"Compression percentage: {percentage:.2f}%")
            print(f"Time taken to analyze file: {elapsed_time:.4f} seconds")

choose_file()