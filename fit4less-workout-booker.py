#Usage: python3 fit4less-booker.py [pass] [email] [location] [minimum time to book] [maximum time to book]
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


def scrollTo(driver, element):
    '''
    Prerequisite: The element MUST exist on webpage driver
    '''
    while True:
        ActionChains(driver).send_keys(Keys.PAGE_DOWN).perform()
        try:
            return element
        except:
            continue
    
class Account():
    '''
    Account associated with fit4less account
    '''
    def __init__(self, password, emailaddress):
        self.password=password
        self.email=emailaddress
        self.countbooked=0
        self.timesbooked={}

    def getPassword(self):
        return self.password

    def getEmailAddress(self):
        return self.email

    def login(self, driver):
        driver.get('https://myfit4less.gymmanager.com/portal/login.asp')

        # Find username/email box, set
        email = scrollTo(driver, driver.find_element_by_name('emailaddress'))
        email.send_keys(self.getEmailAddress())

        # Find password box, set
        password = scrollTo(driver,driver.find_element_by_name('password'))
        password.send_keys(self.getPassword())

        # Find login button, click
        login_button=scrollTo(driver,driver.find_element_by_xpath('/html/body/div[2]/div/div/div/div/form/div[2]/div[1]/div'))
        login_button.click()

        if driver.find_element_by_xpath('/html/body/div[2]/div/div/div/div/h1').text == 'LOG IN FAILED':
            print("Incorrect credentials, check again")
            return 0
        return 1

    def bookTime(self, driver): 
        alltimes_elements = driver.find_elements_by_xpath("(/html/body/div[5]/div/div/div/div/form/div[@class='available-slots'])[2]/div")
    
        if len(alltimes_elements)==0:
            return 0;

        for time in alltimes_elements:
            clock = time.get_attribute("data-slottime")[3::]
            time_id = time.get_attribute("id")
            index_of_colon=clock.find(':')
            index_of_space=clock.find(' ')
            hour, minute = 0, 0
            hour += int(clock[:index_of_colon])
            minute = int(clock[index_of_colon+1:index_of_space])
            if clock[-2:]=="PM":
                if hour == 12:
                    pass
                else:
                    hour+=12
            elif clock[-2:]=="AM" and hour == 12:
                hour= 0
            
            timegym=datetime.datetime.now().replace(hour=int(hour), minute=int(minute), second=0, microsecond=0)

            if minrangetimegym <= timegym <= maxrangetimegym:
                #book this time
                booktime=scrollTo(driver,driver.find_element_by_id(time_id))
                booktime.click() #Click on the specifc time to book, falling in the time domain we want
                driver.find_element_by_id("dialog_book_yes").click() #Accept COVID-19 terms of service 
                #print("Booked time for " + clock)
                return clock
            
        print()
        return 0

    def book(self, driver, location, minrangetimegym, maxrangetimegym):

        # 1) Enter https://www.fit4less.ca/ > 2) Bookworkout
        try:
            if not self.login(driver):
                return 0
            selectclub_element=scrollTo(driver, driver.find_element_by_id('btn_club_select'))
            selectclub_element.click()
            try:
                location_element = driver.find_element_by_xpath("//div[contains(text(),'{}')]".format(location))
                location_element.click()
            except:
                print("Incorrect location, try again")
                return 0



            # 5) Select Day: Ex: Tomorrow. Check todays date, select tomorrows date (Maximum of 3 days in advance)
            today = datetime.date.today()
            tomorrow=today + datetime.timedelta(days = 1) 
            dayaftertomorrow=today + datetime.timedelta(days = 2) 
            days=[today.strftime("%Y-%m-%d"), tomorrow.strftime("%Y-%m-%d"), dayaftertomorrow.strftime("%Y-%m-%d")] #Book 3 days in advance

            for i in days:
                #print("-------------")
                try: 
                    countbooked=driver.find_element_by_xpath("/html/body/div[5]/div/div/div/div/form/p[3]")
                except:
                    print("Maximum Booked. Booked {} times".format(self.countbooked))
                    return 1
                self.countbooked=countbooked.text[9]

                selectday_element=scrollTo(driver, driver.find_element_by_id('btn_date_select'))        
                selectday_element.click()
                day_element_name="date_"+i
                #print("Looking at times for", i)
                driver.find_element_by_id(day_element_name).click()

                booked = self.bookTime(driver)
                if booked != 0:
                    self.timesbooked[i]=booked

        except Exception as e:
            pass
            
        print(" ")
        return 1

    def getReserved(self, driver):
        try:
            if not self.login(driver):
                return 0
            alltimes_elements = driver.find_elements_by_xpath("/html/body/div[5]/div/div/div/div/form/div/div")
            for i in alltimes_elements:
                if i.get_attribute('data-slotdate')==None: # Very hack-ish, fix
                    return 0
                print('-',i.get_attribute('data-slotdate'), i.get_attribute('data-slotclub'), i.get_attribute('data-slottime'));
            return 1

        except Exception as e:
            pass
            
    def getLocations(self, driver):
        try:
            if not self.login(driver):
                return 0
            selectclub_element=scrollTo(driver, driver.find_element_by_id('btn_club_select'))
            selectclub_element.click()
            clubs=driver.find_elements_by_xpath("/html/body/div[3]/div/div/div[2]/div/div")
            
            for i in clubs:
                print(i.text.replace(" ",'-'))

        except Exception as e:
            print(e)
            print("Something went wrong, check inputs")


if __name__ == '__main__':
    try:
        function=sys.argv[1] #book or reserved
        password=sys.argv[2]
        email=sys.argv[3]    
        person=Account(password, email)

        options = webdriver.ChromeOptions()
        #options.add_argument('headless')
        #options.add_argument('window-size=1920x1080'); 
        driver = webdriver.Chrome(os.path.join(os.getcwd(), 'chromedriver'), options=options)

        if function == 'book':
            location=sys.argv[4].replace('-', ' ')
            start_time=sys.argv[5]
            end_time=sys.argv[6]
            minrangetimegym=datetime.datetime.now().replace(hour=int(start_time[:start_time.find(":")],), minute=int(start_time[start_time.find(":")+1:]))
            maxrangetimegym=datetime.datetime.now().replace(hour=int(end_time[:end_time.find(":")]), minute=int(end_time[end_time.find(":")+1:]))
            if person.book(driver, location, minrangetimegym, maxrangetimegym) != 0:
                person.getReserved(driver)
        elif function == 'reserved':
            person.getReserved(driver)
        elif function == 'locations':
            person.getLocations(driver)
        else:
            print("Unknown command")
        driver.quit()
    except:
        print("Unknown command")
