import sys

def register_app(app_name):
    settings_path = "api/settings.py"
    
    # Read the current content
    with open(settings_path, 'r') as file:
        lines = file.readlines()
    
    # Find INSTALLED_APPS and insert the new app
    for i, line in enumerate(lines):
        if 'INSTALLED_APPS = [' in line:
            lines.insert(i + 1, f"    'apps.{app_name}',\n")
            break
    
    # Write back the modified content
    with open(settings_path, 'w') as file:
        file.writelines(lines)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python register_app.py <app_name>")
        sys.exit(1)
    
    register_app(sys.argv[1]) 