# Usage: python3 handler.py [gym] [command] [pass] [email] [location] [minimum time to book] [maximum time to book]
# Prereq: Times are in military format (##:##)
#        Commands include: book, reserved, locations, autobook
#        Gyms include 'fit4less', 'lafitness'

from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException        
import os
import sys
from time import sleep
import datetime


def scrollTo(driver, element):
    driver.execute_script("""arguments[0].scrollIntoView({
            block: 'center',
            inline: 'center'
        });""", element)
    driver.execute_script("arguments[0].scrollIntoView();", element);
    return element

def elementByXpathExists(driver, xpath):
    try:
        driver.find_element_by_xpath(xpath)
    except NoSuchElementException:
        return False
    return True

def elementByIDExists(driver, id):
    try:
        driver.find_element_by_id(id)
    except NoSuchElementException:
        return False
    return True

def elementByCssSelectorExists(driver, selector):
    try:
        driver.find_element_by_css_selector(selector)
    except NoSuchElementException:
        return False
    return True

class Fit4lessAccount():
    '''
    Account associated with fit4less account
    '''

    def __init__(self, password, emailaddress):
        self.password = password
        self.email = emailaddress
        self.countbooked = 0
        self.timesbooked = {}
        self.starttime=0
        self.endtime=0
        self.location=''

    def getPassword(self):
        return self.password

    def getEmailAddress(self):
        return self.email

    def login(self, driver):
        try:
            driver.get('https://myfit4less.gymmanager.com/portal/login.asp')

            # Find username/email box, set
            scrollTo(driver, driver.find_element_by_id('emailaddress')).send_keys(self.getEmailAddress())
            email.send_keys(self.getEmailAddress())
            # Find password box, set
            scrollTo(driver, driver.find_element_by_id('password')).send_keys(self.getPassword())
            # Find login button, click
            scrollTo(driver, driver.find_element_by_id('loginButton')).click()

            if elementByXpathExists(driver, '/html/body/div[2]/div/div/div/div/h1'):
                if driver.find_element_by_xpath('/html/body/div[2]/div/div/div/div/h1').text == 'LOG IN FAILED':
                    print("Incorrect credentials, check again")
                    return False
                return True
            return True
            
        except Exception as e:
            print("Something went wrong with login" + str(e))

    def isMaxedBook(self, driver): 
        try:
            if not elementByXpathExists(driver, '//*[@id="doorPolicyForm"]/h2'):
                return False
            
            sleep(0.5)
            if scrollTo(driver, driver.find_element_by_xpath('//*[@id="doorPolicyForm"]/h2')).text=='Maximum personal reservations reached':
                return True
            
        except Exception as e:
            print("BookingErr:", str(e))

        return False

    def isClosed(self, driver):
        try:

            if elementByXpathExists(driver, "/html/body/div[2]/div/div/div/div/h1"):
                title = driver.find_element_by_xpath("/html/body/div[2]/div/div/div/div/h1").text
                if title == "Your club is closed":
                    print("Your gym is closed")
                    return True
            return False

        except Exception as e:
            print("Something went wrong with isClosed:" + str(e))
            return False

    def bookTime(self, driver):
        alltimes_elements = driver.find_elements_by_css_selector(".available-slots > .time-slot")

        if len(alltimes_elements) == 0:
            return 0

        for time in alltimes_elements:
            clock = time.get_attribute("data-slottime")[3::]
            time_id = time.get_attribute("id")
            index_of_colon = clock.find(':')
            index_of_space = clock.find(' ')
            hour, minute = 0, 0
            hour += int(clock[:index_of_colon])
            minute = int(clock[index_of_colon+1:index_of_space])
            if clock[-2:] == "PM":
                if hour == 12:
                    pass
                else:
                    hour += 12
            elif clock[-2:] == "AM" and hour == 12:
                hour = 0

            minrangetimegym = datetime.datetime.now().replace(hour=int(self.starttime[:self.starttime.find(":")],), minute=(int(self.starttime[self.starttime.find(":")+1:])-1))
            timegym = datetime.datetime.now().replace(hour=int(hour), minute=int(minute))
            maxrangetimegym = datetime.datetime.now().replace(hour=int(self.endtime[:self.endtime.find(":")]), minute=(int(self.endtime[self.endtime.find(":")+1:])+1))
            print(minrangetimegym.strftime("%H:%M"), '<=',timegym.strftime("%H:%M"), '<=', maxrangetimegym.strftime("%H:%M"))

            if minrangetimegym <= timegym <= maxrangetimegym:
                print("Booked for this time")

                # Book this time
                sleep(0.5)
                booktime = scrollTo(driver, driver.find_element_by_id(time_id))
                booktime.click()  # Click on the specifc time to book, falling in the time domain we want

                # Accept COVID-19 terms of service
                sleep(0.5)
                driver.find_element_by_id("dialog_book_yes").click()
                return clock

        return 0

    def autobook(self, driver):
        # 1) Enter https://www.fit4less.ca/ > 2) Book workout
        try:

            if self.isMaxedBook(driver):
                print("Maximum # of slots booked 1")
                return

            sleep(0.5)
            if not elementByIDExists(driver, 'btn_club_select'):
                print("Maximum # of slots booked")
                return

            sleep(0.5)
            selectclub_element = scrollTo(driver, driver.find_element_by_id('btn_club_select'))
            selectclub_element.click()
            

            if not elementByXpathExists(driver, "//div[contains(text(),'{}')]".format(self.location)):
                print("Incorrect location, try again")
                return

            location_element = driver.find_element_by_xpath("//div[contains(text(),'{}')]".format(self.location))
            location_element.click()

            # 5) Select Day: Ex: Tomorrow. Check todays date, select tomorrows date (Maximum of 3 days in advance)
            today = datetime.date.today()
            dayaftertomorrow = (today + datetime.timedelta(days=2)).strftime("%Y-%m-%d")
            print("last day checking", dayaftertomorrow)

            sleep(0.5)
            if not elementByIDExists(driver, 'btn_date_select'):
                print("Maximum booking for this user")
                return

            selectday_element = scrollTo(driver, driver.find_element_by_id('btn_date_select'))
            selectday_element.click()
            day_element_name = "date_"+dayaftertomorrow
            driver.find_element_by_id(day_element_name).click()

            booked = self.bookTime(driver)
            if booked != 0:
                self.timesbooked[dayaftertomorrow] = booked
            
        except Exception as e:
            print("autoBookingErr:"+ str(e))

        print(" ")
        return 1

    def book(self, driver):
        # 1) Enter https://www.fit4less.ca/ > 2) Book workout
        try:
            if self.isMaxedBook(driver):
                print("Maximum # of slots booked 1")
                return
            sleep(0.5)
            if not elementByIDExists(driver, 'btn_club_select'):
                print("Maximum # of slots booked")
                return

            sleep(0.5)

            selectclub_element = scrollTo(driver, driver.find_element_by_id('btn_club_select'))
            selectclub_element.click()
            

            if not elementByXpathExists(driver, "//div[contains(text(),'{}')]".format(self.location)):
                print("Incorrect location, try again")
                return

            location_element = driver.find_element_by_xpath("//div[contains(text(),'{}')]".format(self.location))
            location_element.click()


            # 5) Select Day: Ex: Tomorrow. Check todays date, select tomorrows date (Maximum of 3 days in advance)
            today = datetime.date.today()
            tomorrow = today + datetime.timedelta(days=1)
            dayaftertomorrow = today + datetime.timedelta(days=2)
            days = [dayaftertomorrow.strftime("%Y-%m-%d"), tomorrow.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")]  # Book 3 days in advance

            for i in days:
                sleep(0.5)
                print("checking", i)

                # self.countbooked = countbooked.text[9]
                continueXpath='/html/body/div[2]/div/div/div/div/div/div'
                if elementByXpathExists(driver, continueXpath):
                    print("Daily limit reached")
                    driver.find_element_by_xpath(continueXpath).click()
                    sleep(0.5)

                if not elementByIDExists(driver, 'btn_date_select'):
                    print("Maximum booking for this user")
                    return

                selectday_element = scrollTo(driver, driver.find_element_by_id('btn_date_select'))
                selectday_element.click()
                day_element_name = "date_"+i
                driver.find_element_by_id(day_element_name).click()

                booked = self.bookTime(driver)
                if booked != 0:
                    self.timesbooked[i] = booked
            
        except Exception as e:
            print("BookingErr:", str(e))

        return 1

    def getReserved(self, driver):
    
        try:
            sleep(0.5)
            alltimes_elements = driver.find_elements_by_css_selector(".reserved-slots > .time-slot")
            #reservedSlots=[]
            for i in alltimes_elements:
                # Very hack-ish, fix in future
                print('-', i.get_attribute('data-slotdate'), i.get_attribute('data-slotclub'), i.get_attribute('data-slottime'))
                #reservedSlots.add((i.get_attribute('data-slotdate'), i.get_attribute('data-slotclub'), i.get_attribute('data-slottime')))
            
            if len(alltimes_elements)==0:
                print("No bookings, try picking a different location or changing your available time interval")
    
        except Exception as e:
            print("ReserveErr:", str(e))
    
        #return reservedSlots

class LAFitnessAccount():
    '''
    Account associated with LA Fitness account
    '''

    def __init__(self, password, emailaddress):
        self.password = password
        self.email = emailaddress
        self.countbooked = 0
        self.timesbooked = {}

    def getPassword(self):
        return self.password

    def getEmailAddress(self):
        return self.email

    def login(self, driver):
        driver.get('https://www.lafitness.com/Pages/login.aspx')

        # Find username/email box, set
        email = scrollTo(driver, driver.find_element_by_xpath('//*[@title="Username"]'))
        email.send_keys(self.getEmailAddress())

        # Find password box, set
        password = scrollTo(driver, driver.find_element_by_xpath('//*[@title="Password"]'))
        password.send_keys(self.getPassword())

        # Find login button, click
        login_button = scrollTo(driver, driver.find_element_by_xpath('//*[@value="Sign in"'))
        login_button.click()


    def bookTime(self, driver):
        pass

    def getReserved(self, driver):
        pass
        
    def isClosed(self, driver):
        pass



if __name__ == '__main__':

    gym = sys.argv[1]
    function = sys.argv[2]  # command
    password = sys.argv[3]
    email = sys.argv[4]
    if (gym=='fit4less'): person = Fit4lessAccount(password, email)
    elif (gym=='lafitness'): person = LAFitnessAccount(password, email)
    else: print("Unknown Gym"); sys.exit();

    options = webdriver.ChromeOptions()
    # options.add_argument('headless')
    # options.add_argument('window-size=1920x1080');
    # driver = webdriver.Chrome(os.path.join(os.getcwd(), 'chromedriver'), options=options)
    driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)


    if person.isClosed(driver):
        driver.quit()
        sys.exit();

    if function == 'book':
        person.location = sys.argv[5].replace('-', ' ')
        person.starttime = sys.argv[6]
        person.endtime = sys.argv[7]
        if person.login(driver):
            person.book(driver)

    elif function == 'autobook':
        person.location = sys.argv[5].replace('-', ' ')
        person.starttime = sys.argv[6]
        person.endtime = sys.argv[7]
        if person.login(driver):
            person.autobook(driver)

    elif function == 'reserved':
        if person.login(driver):
            person.getReserved(driver)

    else:
        print("Unknown command")

    driver.quit()
    sys.exit();

