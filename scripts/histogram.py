import pandas as pd
import csv
import sys
import matplotlib.pyplot as plt
import numpy as np

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
#iterate through the rows and take the data with it and append it to lists 
#---------------------------------------------------------------------------------
for index, row in df.iterrows():
       # xlist.append(index)
        #put header name of data you want in the hard brackets
        xlist.append(float(row[' latency']))
 
#---------------------------------------------------------------------------------
#**********************************************************************

#--------------------------
#Histogram plot
#--------------------------
#plt.figure(figsize=(10,5)) # Make it 14x7 inch
plt.style.use('seaborn-whitegrid') # nice and clean grid
plt.title('Response time', fontsize = 21)
plt.xlabel('response time (ms)', fontsize = 15)
plt.ylabel('number of occurences', fontsize = 15)
plt.hist(xlist, linewidth=0.5, alpha=0.7)
plt.savefig('hist_plot.png')
plt.show()
#--------------------------