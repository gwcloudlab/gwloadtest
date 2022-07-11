import os, json
from tracemalloc import start
#from plumbum import RETCODE, SshMachine, cli, local, BG, FG
from Naked.toolshed.shell import execute_js



def generateLoad(req, duration):
    command =  "sample/request-generator.js --rps=" + str(req) + " --interval=" + str(duration)
    execute_js(command) #run the script with the arguments 

def start_function():
	## use this to start the flask or sledge
    exec(open("automation/function.py").read())
    return

def run_test(rps, duration):  
	out = generateLoad(rps, duration)
	return out


def main():
    TEST_LIST = [0, 5, 10, 50, 100]
    duration = 10
    #start_function()
    for test in TEST_LIST:
	     ld_out = run_test(test, duration)




if __name__ == "__main__":
	main()