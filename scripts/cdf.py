import pandas as pd
import csv
import sys
import matplotlib.pyplot as plt
import numpy as np
import warnings

#Put file you want to read in input folder

#**********************************************************************
#List to store the data (ADD AS MUCH AS NECESSARY)
#**********************************************************************

xlist = []
ylist = []

#**********************************************************************
#File Read
#fname : put the name of the file you are reading 
#**********************************************************************


#Change path 
df = pd.read_csv(sys.argv[0])

#**********************************************************************
#df.iterrows returns series for each row it does not preserve data types across the rows
#iterate through the rows and take the data with it and append it to lists to use
#---------------------------------------------------------------------------------
for index, row in df.iterrows():
        xlist.append(index)
        #put header name of data you want in the hard brackets
        ylist.append(row[' latency'])

 
#---------------------------------------------------------------------------------
#**********************************************************************

#--------------------------
#CDF plot
#--------------------------
sorted_data = np.sort(ylist)
yvals=np.arange(len(sorted_data))/float(len(sorted_data)-1)
plt.style.use('seaborn-whitegrid') # nice and clean grid
plt.title('Response time cdf', fontsize = 21)
plt.xlabel('response time (ms)',  fontsize = 15)
plt.ylabel('cdf',  fontsize = 15)
plt.ylim(0, 1)
plt.plot(sorted_data, yvals)
plt.savefig('cdf_plot.png')
plt.show()
#**********************************************************************