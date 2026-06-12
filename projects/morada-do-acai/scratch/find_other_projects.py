import os

search_dirs = [
    r"C:\Users\rafael\Downloads",
    r"C:\Users\rafael\Desktop",
    r"C:\Users\rafael\Documents",
    r"C:\Users\rafael"
]

print("Searching for folders named 'morada-do-acai' or containing 'montar.html'...")
for base_dir in search_dirs:
    if not os.path.exists(base_dir):
        continue
    print(f"Checking {base_dir}...")
    if base_dir == r"C:\Users\rafael":
        # Only check top-level to be fast
        try:
            for item in os.listdir(base_dir):
                path = os.path.join(base_dir, item)
                if os.path.isdir(path) and item.lower() == 'morada-do-acai':
                    print(f"FOUND PROJECT DIR: {path}")
        except Exception:
            pass
    else:
        for root, dirs, files in os.walk(base_dir):
            # Skip hidden dirs
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            for d in dirs:
                if d.lower() == 'morada-do-acai':
                    print(f"FOUND PROJECT DIR: {os.path.join(root, d)}")
            if 'montar.html' in files and 'morada-do-acai' not in root.lower():
                # Check if this is a duplicate project folder
                print(f"FOUND ANOTHER PROJECT LOCATION (containing montar.html): {root}")
