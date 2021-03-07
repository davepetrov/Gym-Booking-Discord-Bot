# Usage: python3 fit4less-booker.py [command] [pass] [email] [location] [minimum time to book] [maximum time to book]
# Notes: Times are in 24 hour format
#        Commands include: book, reserved, locations

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
    return element

def elementExists(driver, xpath):
    try:
        driver.find_element_by_xpath(xpath)
    except NoSuchElementException:
        return False
    return True

class Account():
    '''
    Account associated with fit4less account
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
        driver.get('https://myfit4less.gymmanager.com/portal/login.asp')

        # Find username/email box, set
        email = scrollTo(driver, driver.find_element_by_name('emailaddress'))
        email.send_keys(self.getEmailAddress())

        # Find password box, set
        password = scrollTo(driver, driver.find_element_by_name('password'))
        password.send_keys(self.getPassword())

        # Find login button, click
        login_button = scrollTo(driver, driver.find_element_by_id('loginButton'))
        login_button.click()

        if driver.find_element_by_xpath('/html/body/div[2]/div/div/div/div/h1').text == 'LOG IN FAILED':
            print("Incorrect credentials, check again")
            return 0
        return 1

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

            timegym = datetime.datetime.now().replace(
                hour=int(hour), minute=int(minute), second=0, microsecond=0)

            if minrangetimegym <= timegym <= maxrangetimegym:

                # Book this time
                booktime = scrollTo(driver, driver.find_element_by_id(time_id))
                booktime.click()  # Click on the specifc time to book, falling in the time domain we want

                # Accept COVID-19 terms of service
                driver.find_element_by_id("dialog_book_yes").click()
                return clock

        print()
        return 0

    def book(self, driver, location, minrangetimegym, maxrangetimegym):

        # 1) Enter https://www.fit4less.ca/ > 2) Book workout
        try:
            if not self.login(driver):
                return 0
            selectclub_element = scrollTo(
                driver, driver.find_element_by_id('btn_club_select'))
            selectclub_element.click()

            try:
                location_element = driver.find_element_by_xpath("//div[contains(text(),'{}')]".format(location))
                location_element.click()
            except:
                print("Incorrect location, try again")
                return 0

            # 5) Select Day: Ex: Tomorrow. Check todays date, select tomorrows date (Maximum of 3 days in advance)
            today = datetime.date.today()
            tomorrow = today + datetime.timedelta(days=1)
            dayaftertomorrow = today + datetime.timedelta(days=2)
            days = [today.strftime("%Y-%m-%d"), tomorrow.strftime("%Y-%m-%d"),
                    dayaftertomorrow.strftime("%Y-%m-%d")]  # Book 3 days in advance

            for i in days:
                try:
                    countbooked = driver.find_element_by_xpath("/html/body/div[5]/div/div/div/div/form/p[3]")
                except:
                    print("Maximum Booked. Booked {} times".format(
                        self.countbooked))
                    return 1

                self.countbooked = countbooked.text[9]

                selectday_element = scrollTo(driver, driver.find_element_by_id('btn_date_select'))
                selectday_element.click()
                day_element_name = "date_"+i
                driver.find_element_by_id(day_element_name).click()

                booked = self.bookTime(driver)
                if booked != 0:
                    self.timesbooked[i] = booked

        except Exception as e:
            pass

        print(" ")
        return 1

    def getReserved(self, driver):
        try:
            if not self.login(driver):
                return 0
            alltimes_elements = driver.find_elements_by_css_selector(".reserved-slots > .time-slot")
            for i in alltimes_elements:
                # Very hack-ish, fix in future
                if i.get_attribute('data-slotdate') == None:
                    return 0
                print('-', i.get_attribute('data-slotdate'), i.get_attribute('data-slotclub'), i.get_attribute('data-slottime'))
            return 1

        except Exception as e:
            pass

    def isClosed(self, driver):
        try:
            if not self.login(driver):
                return 0
            if elementExists(driver, "/html/body/div[2]/div/div/div/div/h1"):
                title = driver.find_element_by_xpath("/html/body/div[2]/div/div/div/div/h1").text
                if title == "Your club is closed":
                    print("Your gym is closed")
                    return True

            print("Your gym is Open")
            return False

        except Exception as e:
            print("Your gym is Open"+ e)
            return False



if __name__ == '__main__':
    try:
        function = sys.argv[1]  # book or reserved
        password = sys.argv[2]
        email = sys.argv[3]
        person = Account(password, email)

        options = webdriver.ChromeOptions()
        options.add_argument('headless')
        # options.add_argument('window-size=1920x1080');
        # driver = webdriver.Chrome(os.path.join(os.getcwd(), 'chromedriver'), options=options)
        driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)


        if person.isClosed(driver):
            driver.quit()

        if function == 'book':
            location = sys.argv[4].replace('-', ' ')
            start_time = sys.argv[5]
            end_time = sys.argv[6]
            minrangetimegym = datetime.datetime.now().replace(hour=int(start_time[:start_time.find(":")],), minute=int(start_time[start_time.find(":")+1:]))
            maxrangetimegym = datetime.datetime.now().replace(hour=int(end_time[:end_time.find(":")]), minute=int(end_time[end_time.find(":")+1:]))

            if person.book(driver, location, minrangetimegym, maxrangetimegym) != 0:
                person.getReserved(driver)

        elif function == 'reserved':
            person.getReserved(driver)

        else:
            print("Unknown command")

        # driver.quit()
    except Exception as e:
        print("Something went wrong, please contact David @ davidpetrovx@gmail.com with the following error message: \n"+ e)
