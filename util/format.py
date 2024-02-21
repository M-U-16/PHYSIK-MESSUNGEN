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
    print(line)
    if idx == 0: return line
    splitted = line.split(";")
    time = ".".join(splitted[0].split(","))
    voltage = ".".join(splitted[1].split(",")).rstrip()
    
    return { "time": time, "voltage": voltage }

def formatCsvLine(line, idx):
    print(line, idx)
    if idx == 0: return line
    splitted = line.split(";")
    time = ".".join(splitted[0].split(","))
    voltage = ".".join(splitted[1].split(","))
    return ";".join([time, voltage])

def combineCsvLines(first, second):
    pass

def getCsvContent(path, formatter):
    lines = None
    with open(path, encoding="utf-8-sig") as file:
        lines = [formatter(line, idx) for idx, line in enumerate(file)]
    return lines, lines.pop(0)

def formatCsvContent(data, formatter):
    lines_list = data.split("\n")
    print(lines_list[0])
    #lines = [formatter(line, idx) for idx, line in enumerate(data)]
    #print(lines)
    #return lines, lines.pop(0)

def writeCsv(path, data, top, clear=False):
    if clear:
        with open(path, "w+") as file:
            file.write("")
    
    with open(path, "a") as file:
        file.write(top)
        for line in data:
            file.write(line)

def formatDate(timestamp):
    date, time = timestamp.split("_")
    return date + " " + ":".join(time.split("."))

def writeFormattedData(path, file_name, data):
    with open(os.path.join(path, file_name), "w") as file:
        file.write(json.dumps(data))
     
root_folder, data_path = getDataPath()
output_path = os.path.join(root_folder, OUTPUT)
if not os.path.exists(output_path): os.mkdir(output_path)
data_contents = {}

if __name__ == "__main__":
    for dir in os.listdir(data_path):
        dir_path = os.path.join(data_path, dir)
        
        dir_contents = {}
        files = []
        
        for file_name in os.listdir(dir_path):
            type, _, _ = file_name.split("I")
            file_path = os.path.join(dir_path, file_name)
            files.append({
                "con": open(file_path, "r", encoding="utf-8-sig"),
                "type": type
            })
            
        for file in files:
            content = formatCsvContent(file["con"].read(), formatCsvLine)
            #print(content)
            dir_contents[file["type"]] = {
                "type": dir,
                "content": content,
            }
            file["con"].close()
 
        #writeFormattedData(output_path, new_file_name,dir_contents)