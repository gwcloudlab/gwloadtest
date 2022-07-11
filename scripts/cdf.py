import pandas as pd
import csv
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

fname = "const_svc_cost_c20"

#Change path 
df = pd.read_csv(r'sample/log-rps-10-iv-10.csv'.format(fname), nrows=100)

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
plt.title('Response time cdf')
plt.xlabel('response time (ms)')
plt.ylabel('cdf')
plt.ylim(0, 1)
plt.plot(sorted_data, yvals)
plt.show()
#**********************************************************************