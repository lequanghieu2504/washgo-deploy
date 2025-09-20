import tiktoken
import os

# Target the Java source folder
folder_path = '/home/urimgnryfrnd/IdeaProjects/washgo'  # <<< change this!

encoding = tiktoken.encoding_for_model("gpt-4")

total_tokens = 0

for root, dirs, files in os.walk(folder_path):
    for file in files:
        if file.endswith(".java") or file.endswith(".properties"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
                tokens = encoding.encode(text)
                total_tokens += len(tokens)

print(f"Total tokens in codebase: {total_tokens}")
