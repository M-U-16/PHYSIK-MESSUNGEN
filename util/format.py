import os
import json

OUTPUT = "formatted_data"
CSV_FILE = "widerstand-100microF_ohm100.csv"
project_name = "physik-viz"

def getDataPath():
    pathList = (os.getcwd()).split("\\")
    # get data path
    while True:
        if pathList[-1] == project_name:
            root = "\\".join(pathList)
            return root, os.path.join(root, "data")
        pathList.pop()

def formatJsonLine(line, idx):
    if idx == 0: return line
    splitted = line.split(";")
    time = ".".join(splitted[0].split(","))
    voltage = ".".join(splitted[1].split(",")).rstrip()
    
    return { "time": time, "voltage": voltage }

def formatCsvLine(line):
    splitted = line.split(";")
    time = ".".join(splitted[0].split(","))
    voltage = ".".join(splitted[1].split(","))
    return ";".join([time, voltage])

def formatCsvContent(data, formatter):
    lines_list = data.split("\n")
    head = lines_list.pop(0)
    lines = "\n".join([formatter(line) for _, line in enumerate(lines_list)])
    return head + "\n" + lines

def writeCsv(file_name, data, clear=False):
    path = os.path.join(os.getenv("output_path"), file_name)
    if clear:
        with open(path, "w+") as f:
            f.write("")
    
    with open(path, "a") as f:
        for line in data:
            f.write(line)

def formatDate(timestamp):
    date, time = timestamp.split("_")
    return date + " " + ":".join(time.split("."))

def writeFormattedData(path, file_name, data):
    with open(os.path.join(path, file_name), "w") as f:
        f.write(json.dumps(data))
     
root_folder, data_path = getDataPath()
os.environ["output_path"] = os.path.join(root_folder, OUTPUT)

if not os.path.exists(os.getenv("output_path")): os.mkdir(os.getenv("output_path"))

if __name__ == "__main__":
    for directory in os.listdir(data_path):
        dir_path = os.path.join(data_path, directory)
        
        files = []
        
        for file_name in os.listdir(dir_path):
            file_type, ext = file_name.split(".")
            file_path = os.path.join(dir_path, file_name)
            files.append({
                "con": open(file_path, "r", encoding="utf-8-sig"),
                "type": file_type
            })
            
        for f in files:
            content = f["con"].read()
            formattedContent = formatCsvContent(content, formatCsvLine)
            new_file_name = f["type"] + "-" + directory +".csv"
            writeCsv(new_file_name, formattedContent, False)
            f["con"].close()
