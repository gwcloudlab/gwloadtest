import csv
import matplotlib.pyplot as plt
import pandas as pd

plt.figure()

file_names = ['sample/log-rps-1000-iv-10.csv','sample/log-rps-100-iv-10.csv','sample/log-rps-10-iv-10.csv']
subplotnum = (len(file_names)*100)+11 #should be 311 for 3 files, 211 for 2 files, etc


def create_subplot (data):
    with open (data) as csv_file:
        next(csv_file)
        csv_reader = csv.reader(csv_file, delimiter=',')
        i = 0
        data = []
        num = []
        for row in csv_reader:
            data.append((float)(row[0]))
            num.append(i)
            i+=1
    plt.subplot(subplotnum)
    plt.plot(num, data)

def read_file(file):
    df = pd.read_csv(file)
    data = []
    num = []
    for index, row in df.iterrows():
        num.append(index)
        #put header name of data you want in the hard brackets
        data.append(row[' latency'])
    ax = plt.subplot(subplotnum)
    plt.plot(num, data)

plt.suptitle("Latency over time(ms)", fontsize=16)

for file in file_names:
    #create_subplot(file)
    read_file(file)
    subplotnum += 1
plt.savefig('line_plot.png')
plt.show()
#plt.savefig('line_plot.pdf', format='pdf')