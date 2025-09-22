import tkinter as tk
from tkinter import filedialog
import json
import os
from PIL import Image, ImageTk


root = tk.Tk()
root.title("TRINITY")
root.geometry("800x600")
root.config(background="#f2f2f2")  # sets the background color to a light gray
root.iconbitmap("vlogo.ico")  # sets the icon to a custom ICO file


background_image = Image.open("main.png")  # loads a background image
background_image = ImageTk.PhotoImage(background_image)
background_label = tk.Label(root, image=background_image)
background_label.place(x=0, y=0, relwidth=1, relheight=1)


class Application(tk.Frame):
    def __init__(self, master=None):
        super().__init__(master)
        self.master = master
        self.pack()
        self.create_widgets()

    def create_widgets(self):
        self.compress_button = tk.Button(self, bg="#2e385a", fg="#ffffff", text="Compress", )
        self.compress_button.pack(side="left", padx=10, pady=10)
        self.compress_button["font"] = ("Arial", 12, "bold")
        self.compress_button["width"] = 15
        self.compress_button["text"] = "Compress"
        self.compress_button["command"] = self.run_compress
        self.compress_button.pack(side="left")

        self.decompress_button = tk.Button(self)
        self.decompress_button["text"] = "Decompress"
        self.decompress_button["command"] = self.run_decompress
        self.decompress_button.pack(side="left")

        self.search_button = tk.Button(self)
        self.search_button["text"] = "Search"
        self.search_button["command"] = self.run_search
        self.search_button.pack(side="right")

        self.quit = tk.Button(self, text="QUIT", fg="red",
                              command=self.master.destroy)
        self.quit.pack(side="bottom")

    def run_compress(self):
        os.system("python compress.py")

    def run_decompress(self):
        os.system("python decompress.py")

    def run_search(self):
        os.system("python search.py")

    def load_data(self):
        with open("data.json", "r") as f:
            return json.load(f)

    def save_data(self, data):
        with open("data.json", "w") as f:
            json.dump(data, f)

app = Application(master=root)

app.mainloop()