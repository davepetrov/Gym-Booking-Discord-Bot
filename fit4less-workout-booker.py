#Assumptions: Account used already exists

import selenium
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.common.action_chains import ActionChains
import os
import sys
from time import sleep
import datetime


class Account():
    '''
    Account associated with fit4less account
    '''
    def __init__(self, password, emailaddress, location):
        self.password=password
        self.email=emailaddress
        self.location=location #Must be exact location

    def getPassword(self):
        return self.password
    def getEmailAddress(self):
        return self.email
    def getLocation(self):
        return self.location

david=Account('dp05092001', 'peamap101@gmail.com', 'North York Centerpoint Mall')
start_time="13:00"
end_time="16:00"
print(start_time[:start_time.find(":")], start_time[start_time.find(":")+1:])
print(end_time[:end_time.find(":")], end_time[end_time.find(":")+1:])

def bookTime(driver):
    alltimes_elements = driver.find_element_by_xpath("(//div[@class='available-slots'])[2]")

    print(len(alltimes_elements))
    minrangetimegym=datetime.datetime.now().replace(hour=int(start_time[:start_time.find(":")],), minute=int(start_time[start_time.find(":")+1:]))
    maxrangetimegym=datetime.datetime.now().replace(hour=int(end_time[:end_time.find(":")]), minute=int(end_time[end_time.find(":")+1:]))

    for time in alltimes_elements:
        clock = time.get_attribute("data-slottime")[3::]
        
        print(clock)
        time_id = time.get_attribute("id")
        index_of_colon=clock.find(':')
        index_of_space=clock.find(' ')
        hour, minute = 0, 0
        if clock[-2:]=="PM":
            hour+=(12)
        hour += int(clock[:index_of_colon])
        minute = int(clock[index_of_colon+1:index_of_space])
        timegym=datetime.datetime.now().replace(hour=int(hour), minute=int(minute))
        if minrangetimegym <= timegym <= maxrangetimegym:
            #book this time
            driver.find_element_by_id(time_id).click() #Click on the specifc time to book, falling in the time domain we want
            driver.find_element_by_id("dialog_book_yes").click() #Accept COVID-19 terms of service 
            print("Booked time for " + clock)
            return 1
    return 0 #No times booked for today

# try:
# driver = webdriver.safari.webdriver.WebDriver(quiet=False)
driver = webdriver.Chrome(os.path.join(os.getcwd(), 'chromedriver'))
# driver = webdriver.Firefox()
#driver.maximize_window()


# 1) Enter https://www.fit4less.ca/ > 
driver.get('https://www.fit4less.ca/')
driver.implicitly_wait(5)

# 2) Book Workout
# driver.find_element_by_xpath('/html/body/form/div[6]/header/div[2]/div/div[2]/ul/li[2]/a').click()
# driver.implicitly_wait(5)

driver.get('https://myfit4less.gymmanager.com/portal/login.asp')


# # 3) login
# Find username/email box, set
email = driver.find_element_by_name('emailaddress')
email.send_keys(david.getEmailAddress())

# Find password box, set
password = driver.find_element_by_name('password')
password.send_keys(david.getPassword())

# Find login button, click
driver.implicitly_wait(5)
login_button = driver.find_element_by_xpath('/html/body/div[2]/div/div/div/div/form/div[2]/div[1]/div')
login_button.click()

# 4) Select Club: Ex: North York Centerpoint Mall
driver.find_element_by_id('btn_club_select').click()
location_element = driver.find_element_by_xpath("//div[contains(text(),'{}')]".format(david.getLocation()))
location_element.click()


# 5) Select Day: Ex: Tomorrow. Check todays date, select tomorrows date (Maximum of 3 days in advance)
#driver.find_element_by_id('btn_date_select').click()
today = datetime.date.today()
tomorrow=today + datetime.timedelta(days = 1) 
dayaftertomorrow=today + datetime.timedelta(days = 2) 
days=[today.strftime("%Y-%m-%d"), tomorrow.strftime("%Y-%m-%d"), dayaftertomorrow.strftime("%Y-%m-%d")]
print(days)

for i in days:
    selectday_element=driver.find_element_by_id('btn_date_select')
    selectday_element.click()
    day_element_name="date_"+i
    print(day_element_name)
    sleep(2)
    driver.find_element_by_id(day_element_name).click()

# 6) Select time: [TO-DO] No times available -> Recommend tomorrows times, else: Let me select times. Recommend times between a certain preset range, but show all times too.
    if bookTime(driver):
        print("Booked for ", day_element_name)

        




# except Exception as e:
#     print(e)
#     driver.quit()