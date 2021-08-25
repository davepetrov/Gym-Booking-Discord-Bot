from selenium import webdriver

PATH = 'C:\Program Files (x86)\chromedriver.exe'
driver = webdriver.Chrome(PATH)


driver.get('https://bookmebot.com/locations/')


result1 = driver.find_element_by_xpath('/html/body/div[1]/div/section/main/article/div/div[1]/div/div[3]/div/div/div/div/div[{}]/p[2]'.format('1')).text.replace('-' , ' ').title().replace(' Nw', " NW")
result2 = driver.find_element_by_xpath('/html/body/div[1]/div/section/main/article/div/div[1]/div/div[3]/div/div/div/div/div[{}]/p[2]'.format('2')).text.replace('-' , ' ').title().replace(' Nw', " NW")
result3 = driver.find_element_by_xpath('/html/body/div[1]/div/section/main/article/div/div[1]/div/div[3]/div/div/div/div/div[{}]/p[2]'.format('3')).text.replace('-' , ' ').title().replace(' Nw', " NW")

result4= driver.find_element_by_xpath('/html/body/div[1]/div/section/main/article/div/div[1]/div/div[4]/div/div/div/div/div[{}]/p[2]'.format('1')).text.replace('-', ' ').title()
result5= driver.find_element_by_xpath('/html/body/div[1]/div/section/main/article/div/div[1]/div/div[4]/div/div/div/div/div[{}]/p[2]'.format('2')).text.replace('-', ' ').title()
result6= driver.find_element_by_xpath('/html/body/div[1]/div/section/main/article/div/div[1]/div/div[4]/div/div/div/div/div[{}]/p[2]'.format('3')).text.replace('-', ' ').title()
driver.quit()

l = open("LAfitnessLocationsCLEAN.txt", "w")
l.write(result1)
l.write(result2)
l.write(result3)


f = open("fit4lessLocationsCLEAN.txt", "w")
f.write(result4)
f.write("\n")
f.write(result5)
f.write("\n")
f.write(result6)