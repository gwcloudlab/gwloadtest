import csv
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv("sample/rps-99ile.csv")
print(df)
data = []
num = []
for index, row in df.iterrows():
        num.append(row['rps'])
        #put header name of data you want in the hard brackets
        data.append(row[' 99ile'])

plt.plot(num, data)
plt.show()