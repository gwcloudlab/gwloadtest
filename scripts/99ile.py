import csv
import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv("sample/rps-99ile.csv")
print(df)
data = []
num = []
f, ax = plt.subplots(1)
for index, row in df.iterrows():
        num.append(row['rps'])
        #put header name of data you want in the hard brackets
        data.append(row[' 99ile'])

plt.title('99ile latency vs Rps', fontsize = 18)
plt.xlabel('rps rate', fontsize = 12)
plt.ylabel('99ile latency', fontsize = 12)
ax.plot(num, data)
ax.set_xlim(left=0)
plt.savefig('99ile_plot.png')
plt.show()