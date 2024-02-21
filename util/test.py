# main.py
import sys

if __name__ == "__main__":
    sys.argv.pop()
    print(f"Arguments count: {len(sys.argv)}")
    for i, arg in enumerate(sys.argv):
        print(f"Argument {i:>6}: {arg}")