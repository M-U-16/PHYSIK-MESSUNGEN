CSV_FILE = "widerstand-100microF_ohm100.csv"
lines = None

def formatLine(line):
    splitted = line.split(";")
    if len(splitted) == 1: return

    time = ".".join(splitted[0].split(","))
    voltage = ".".join(splitted[1].split(","))
    return ";".join([time, voltage])

#read csv file content
with open(CSV_FILE) as file:
    lines = [formatLine(line) for line in file]

with open("formatted.csv", "a") as file:
    head = lines.pop(0)
    file.write("t;v\n")
    for line in lines:
        file.write(line)