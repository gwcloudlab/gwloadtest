import pandas as pd
import csv
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

fname = "const_svc_cost_c20"
#Change path 
df = pd.read_csv(r'sample/log-rps-10-iv-10.csv'.format(fname), nrows=100)

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
plt.figure(figsize=(10,5)) # Make it 14x7 inch
plt.style.use('seaborn-whitegrid') # nice and clean grid
plt.title('Response time', fontsize = 40)
plt.xlabel('response time (ms)', fontsize = 20)
plt.ylabel('number of occurences', fontsize = 20)
plt.hist(xlist, facecolor = '#2ab0ff', edgecolor='#169acf', linewidth=0.5, alpha=0.7)
plt.show()
#--------------------------