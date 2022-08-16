import csv
import matplotlib.pyplot as plt
import os

plt.figure()

all_files = os.listdir(os.getcwd())
file_names = list(filter(lambda f: f.endswith('.csv'), all_files))
subplotnum = (len(file_names)*100)+11 #should be 311 for 3 files, 211 for 2 files, etc

def create_subplot (data):
    file_name = data
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
    ax = plt.subplot(subplotnum)
    ax.set_title(file_name)
    ax.plot(num, data)
	
plt.suptitle("Latency over time(ms)", fontsize=16)

for file in file_names:
    create_subplot(file)
    subplotnum += 1

plt.subplots_adjust(hspace=.7)
plt.show()
plt.savefig('line_plot.pdf', format='pdf')



