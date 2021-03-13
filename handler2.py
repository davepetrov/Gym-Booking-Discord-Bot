# Usage: python3 handler.py [gym] [command] [pass] [email] [location] [minimum time to book] [maximum time to book]
# Prereq: Times are in military format (##:##)
#        Commands include: book, reserved, locations, autobook
#        Gyms include 'fit4less', 'lafitness'

from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException  
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging
from selenium.webdriver.remote.remote_connection import LOGGER

import os
import sys
from time import sleep, time
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
        self.starttime=None
        self.endtime=None
        self.location=None

    def getPassword(self):
        return self.password

    def getEmailAddress(self):
        return self.email

    def login(self, driver):
        try:
            driver.get('https://myfit4less.gymmanager.com/portal/login.asp')

            # Find username/email box, set
            # sleep(0.5)
            email = scrollTo(driver, driver.find_element_by_id('emailaddress'))
            # email = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, 'emailaddress' )))
            email.send_keys(self.getEmailAddress())

            # Find password box, set
            pw = scrollTo(driver, driver.find_element_by_id('password'))
            # pw= WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, 'password' )))
            pw.send_keys(self.getPassword())

            # Find login button, click
            login=scrollTo(driver, driver.find_element_by_id('loginButton'))
            # login = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, 'loginButton' )))
            login.click()

            if elementByXpathExists(driver, '/html/body/div[2]/div/div/div/div/h1'):
                if driver.find_element_by_xpath('/html/body/div[2]/div/div/div/div/h1').text == 'LOG IN FAILED':
                    print("Incorrect credentials, check again")
                    return False
                return True
            return True

        except Exception as e:
            print("LoginError" + str(e))

    def isMaxedBook(self, driver): 
        try:
            if not elementByXpathExists(driver, '//*[@id="doorPolicyForm"]/h2'):
                return False
            
            if scrollTo(driver, driver.find_element_by_xpath('//*[@id="doorPolicyForm"]/h2')).text=='Maximum personal reservations reached':
                print("Unable to book, Maximum # of slots booked",  file=sys.stderr)
                return True
            
        except Exception as e:
            print("isMaxedBookError:", str(e),  file=sys.stderr)

        return False

    def checkDailyLimitReached(self, driver):
        try:
            continueXpath='/html/body/div[2]/div/div/div/div/div/div'
            if elementByXpathExists(driver, continueXpath):
                print("Daily limit reached", file=sys.stderr)
                driver.find_element_by_xpath(continueXpath).click()
                return True
        
        except Exception as e:
            print("checkDailyLimitReachedErr:", str(e),  file=sys.stderr)

        return False

    def isClosed(self, driver):
        try:
            if elementByXpathExists(driver, "/html/body/div[2]/div/div/div/div/h1"):
                title = driver.find_element_by_xpath("/html/body/div[2]/div/div/div/div/h1").text
                if title == "Your club is closed":
                    print("Your gym is closed")
                    return True

        except Exception as e:
            print("isClosedError:" + str(e),  file=sys.stderr)
        
        return False

    def bookTime(self, driver):
        try:
            alltimes_elements = driver.find_elements_by_css_selector(".available-slots > .time-slot")

            if len(alltimes_elements) == 0:
                return False

            for time in alltimes_elements:
                clock = time.get_attribute("data-slottime")[3::]
                time_id = time.get_attribute("id")
                index_of_colon = clock.find(':')
                index_of_space = clock.find(' ')
                hour, minute = 0, 0
                hour += int(clock[:index_of_colon])
                minute = int(clock[index_of_colon+1:index_of_space])
                if clock[-2:] == "PM":
                    if hour == 12: pass
                    else: hour += 12
                elif clock[-2:] == "AM" and hour == 12:
                    hour = 0

                minrangetimegym = datetime.datetime.now().replace(hour=int(self.starttime[:self.starttime.find(":")],), minute=(int(self.starttime[self.starttime.find(":")+1:])))
                timegym = datetime.datetime.now().replace(hour=int(hour), minute=int(minute))
                maxrangetimegym = datetime.datetime.now().replace(hour=int(self.endtime[:self.endtime.find(":")]), minute=(int(self.endtime[self.endtime.find(":")+1:])))
                if minrangetimegym <= timegym <= maxrangetimegym:
                    # Book this time
                    # sleep(0.5)
                    booktime = scrollTo(driver, driver.find_element_by_id(time_id))
                    booktime.click()  # Click on the specifc time to book, falling in the time domain we want

                    # Accept COVID-19 terms of service
                    # sleep(0.5)
                    driver.find_element_by_id("dialog_book_yes").click()
                    
                    if self.checkDailyLimitReached(driver):
                        return False

                    print('   ', minrangetimegym.strftime("%H:%M"), '<=',timegym.strftime("%H:%M"), '<=', maxrangetimegym.strftime("%H:%M"),  file=sys.stderr)
                    print("Booking for "+timegym.strftime("%H:%M"), file=sys.stderr)
                    return True

        except Exception as e:
            print("bookTimeError:"+ str(e),  file=sys.stderr)

        return False

    def autobook(self, driver):
        # 1) Enter https://www.fit4less.ca/ > 2) Book workout
        try:
            if self.isMaxedBook(driver):
                return

            selectclub_element = scrollTo(driver, driver.find_element_by_id('btn_club_select'))
            selectclub_element.click()
            
            if not elementByXpathExists(driver, "//div[contains(text(),'{}')]".format(self.location)):
                print("Incorrect location, try again",  file=sys.stderr)
                return

            location_element = driver.find_element_by_xpath("//div[contains(text(),'{}')]".format(self.location))
            location_element.click()

            # 5) Select Day: Ex: Tomorrow. Check todays date, select tomorrows date (Maximum of 3 days in advance)
            today = datetime.date.today()
            dayaftertomorrow = (today + datetime.timedelta(days=2)).strftime("%Y-%m-%d")
            print("Checking", dayaftertomorrow, file=sys.stderr)

            selectday_element = scrollTo(driver, driver.find_element_by_id('btn_date_select'))
            selectday_element.click()
            day_element_name = "date_"+dayaftertomorrow
            driver.find_element_by_id(day_element_name).click()

            # while not (datetime.datetime.now().hour==0 and datetime.datetime.now().minute>=57 and datetime.datetime.now().second>0):
            #     pass 

            booked = self.bookTime(driver)
            if booked:
                self.timesbooked[dayaftertomorrow] = booked
                print("Booked for", dayaftertomorrow,  file=sys.stderr)
            else:
                print("Unable to book, all time slots taken for ", dayaftertomorrow,  file=sys.stderr)

        except Exception as e:
            print("autoBookingError:"+ str(e), file=sys.stderr)

        return

    def book(self, driver):
        # 1) Enter https://www.fit4less.ca/ > 2) Book workout
        try:
            if self.isMaxedBook(driver):
                return

            selectclub_element = scrollTo(driver, driver.find_element_by_id('btn_club_select'))
            selectclub_element.click()
            

            if not elementByXpathExists(driver, "//div[contains(text(),'{}')]".format(self.location)):
                print("Incorrect location, try again", file=sys.stderr)
                return

            location_element = driver.find_element_by_xpath("//div[contains(text(),'{}')]".format(self.location))
            location_element.click()


            # 5) Select Day: Ex: Tomorrow. Check todays date, select tomorrows date (Maximum of 3 days in advance)
            today = datetime.date.today()
            tomorrow = today + datetime.timedelta(days=1)
            dayaftertomorrow = today + datetime.timedelta(days=2)
            days = [dayaftertomorrow.strftime("%Y-%m-%d"), tomorrow.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")]  # Book 3 days in advance

            for day in days:
                print("Checking", day,  file=sys.stderr)

                if self.isMaxedBook(driver):
                    return

                selectday_element = scrollTo(driver, driver.find_element_by_id('btn_date_select'))
                selectday_element.click()
                day_element_name = "date_" + day
                driver.find_element_by_id(day_element_name).click()

                booked = self.bookTime(driver)
                if booked:
                    self.timesbooked[dayaftertomorrow] = booked
                    print("Booked for", dayaftertomorrow,  file=sys.stderr)
                else:
                    print("Unable to book, all time slots taken for ", dayaftertomorrow,  file=sys.stderr)

            
        except Exception as e:
            print("BookingError:", str(e), sys.stderr)

        return

    def getReserved(self, driver):

        try:
            # sleep(0.5)
            alltimes_elements = driver.find_elements_by_css_selector(".reserved-slots > .time-slot")
            for i in alltimes_elements:
                print('-', i.get_attribute('data-slotdate'), i.get_attribute('data-slotclub'), i.get_attribute('data-slottime'))
            
            if len(alltimes_elements)==0:
                print("No bookings, try picking a different location or changing your available time interval", file=sys.stderr)
                print("No bookings, try picking a different location or changing your available time interval", file=sys.stdout)
    
        except Exception as e:
            print("ReserveErr:", str(e), file=sys.stderr)
            
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


    print("----------------------------------------", file=sys.stderr)
    start_time = time()

    gym = sys.argv[1]
    function = sys.argv[2]  # command
    password = sys.argv[3]
    email = sys.argv[4]

    LOGGER.setLevel(logging.WARNING)

    options = webdriver.ChromeOptions()
    options.add_argument("--window-size=1920,1080");
    options.add_argument("--no-sandbox");
    options.add_argument("--headless");
    options.add_argument("--disable-gpu");
    options.add_argument("--disable-crash-reporter");
    options.add_argument("--disable-extensions");
    options.add_argument("--disable-in-process-stack-traces");
    options.add_argument("--disable-logging");
    options.add_argument("--disable-dev-shm-usage");
    options.add_argument("--log-level=3");
    options.add_argument("--output=/dev/null");

    driver = webdriver.Chrome(ChromeDriverManager().install(), options=options, service_log_path='/dev/null')
    driver.implicitly_wait(60)

    # driver=webdriver.Safari();
    # driver.maximize_window()

    #driver=webdriver.Firefox();


    if (gym=='fit4less'): person = Fit4lessAccount(password, email)
    elif (gym=='lafitness'): person = LAFitnessAccount(password, email)
    else: print("Unknown Gym", file=sys.stderr); sys.exit();

    if person.isClosed(driver):
        driver.quit()
        sys.exit();

    if function == 'book':
        person.location = sys.argv[5].replace('-', ' ')
        person.starttime = sys.argv[6]
        person.endtime = sys.argv[7]

        print(function, file=sys.stderr)
        print("timeslot: ", person.starttime, '-',person.endtime, file=sys.stderr)
        print("location: ", person.location, file=sys.stderr)

        print("email: ", person.email, file=sys.stderr)
        print("pass:", person.password, file=sys.stderr)

        if person.login(driver):
            person.book(driver)

    elif function == 'autobook':
        person.location = sys.argv[5].replace('-', ' ')
        person.starttime = sys.argv[6]
        person.endtime = sys.argv[7]

        print(function, file=sys.stderr)
        print("timeslot :", person.starttime, '-',person.endtime, file=sys.stderr)
        print("location: ", person.location, file=sys.stderr)
        print("email: ", person.email, file=sys.stderr)
        print("pass: ", person.password, file=sys.stderr)

        if person.login(driver):
            person.autobook(driver)

    elif function == 'reserved':
        print(function, file=sys.stderr)
        print("email: ", person.email, file=sys.stderr)
        print("pass: ", person.password, file=sys.stderr)

        if person.login(driver):
            person.getReserved(driver)

    else:
        print("Unknown command", file=sys.stderr)

    print("--- %s seconds ---" % round((time() - start_time),5), file=sys.stderr)
    driver.quit()
    sys.exit();

