import os, json
import subprocess
from tracemalloc import start
from Naked.toolshed.shell import execute_js



def generateLoad(req, duration):
    command =  "sample/request-generator.js --rps=" + str(req) + " --interval=" + str(duration)
    execute_js(command) #run the script with the arguments 

def main():
    TEST_LIST = [1, 5, 10, 50, 100, 500, 1000]
    duration = 10
   # start_function()
    for test in TEST_LIST:
	     generateLoad(test, duration)




if __name__ == "__main__":
	main()