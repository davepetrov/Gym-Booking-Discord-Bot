
#!/usr/bin/python3
from .helpers import *
from .Account import Account
import sys
import datetime
from time import sleep

MAX_RESERVATIONS = 2

class Fit4lessAccount(Account):
    '''
    Account associated with fit4less account
    '''

    def __init__(self, password, emailaddress):
        self.password = password
        self.email = emailaddress
        self.function = ''
        self.countbooked = 0
        self.timesbooked = {}
        self.timesReserved = 0
        self.starttime = None
        self.endtime = None
        self.location = None
        self.locationBackup = None

    def login(self, driver):
        try:
            driver.get('https://myfit4less.gymmanager.com/portal/login.asp')

            # Find username/email box, set
            email = scrollTo(driver, driver.find_element_by_id('emailaddress'))
            email.send_keys(self.email)

            # Find password box, set
            pw = scrollTo(driver, driver.find_element_by_id('password'))
            pw.send_keys(self.password)

            # Find login button, click
            login = scrollTo(driver, driver.find_element_by_id('loginButton'))
            login.click()

            if elementByXpathExists(driver, '/html/body/div[2]/div/div/div/div/h1'):
                if driver.find_element_by_xpath('/html/body/div[2]/div/div/div/div/h1').text == 'LOG IN FAILED':
                    print("Incorrect credentials, check again")
                    return 0
                return 1

        except Exception as e:
            print("LoginError" + str(e), file=sys.stderr)
            
        return 0

    def __isMaxedBook(self, driver):
        try:
            if elementByXpathExists(driver, '//*[@id="doorPolicyForm"]/h2') and driver.find_element_by_xpath('//*[@id="doorPolicyForm"]/h2').text == 'Maximum personal reservations reached':
                print("Unable to book, Maximum # of slots booked",  file=sys.stderr)
                return 1

        except Exception as e:
            print("isMaxedBookError:", str(e),  file=sys.stderr)

        return 0

    def __checkDailyLimitReached(self, driver):
        try:
            continueXpath = '/html/body/div[2]/div/div/div/div/div/div'
            if elementByXpathExists(driver, continueXpath) and driver.find_element_by_xpath(continueXpath).click():
                print("Daily limit reached", file=sys.stderr)
                return 1

        except Exception as e:
            print("checkDailyLimitReachedErr:", str(e),  file=sys.stderr)

        return 0

    def __isClosed(self, driver):
        try:
            if elementByXpathExists(driver, "/html/body/div[2]/div/div/div/div/h1"):
                if driver.find_element_by_xpath("/html/body/div[2]/div/div/div/div/h1").text == "Your club is closed":
                    print("Your gym is closed")
                    return 1

        except Exception as e:
            print("isClosedError:" + str(e),  file=sys.stderr)

        return 0

    def __bookTime(self, driver):
        try:
            alltimes_elements = driver.find_elements_by_css_selector(".available-slots > .time-slot")

            if len(alltimes_elements) == 0:
                return False

            for time in alltimes_elements:
                
                #Do time stuff UGLY UGLY UGLY
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
                    driver, driver.find_element_by_id(time_id).click() 

                    # Accept COVID-19 terms of service
                    scrollTo(driver, driver.find_element_by_id("dialog_book_yes")).click()

                    if self.__checkDailyLimitReached(driver):
                        return False

                    print('   ', minrangetimegym.strftime("%H:%M"), '<=', timegym.strftime("%H:%M"), '<=', maxrangetimegym.strftime("%H:%M"),  file=sys.stderr)
                    print("Booking for "+timegym.strftime("%H:%M"), file=sys.stderr)
                    return True

        except Exception as e:
            print("bookTimeError:" + str(e),  file=sys.stderr)

        return False

    def book(self, driver):
        # 1) Enter https://www.fit4less.ca/ > 2) Book workout
        try:
            if self.__isClosed(driver):
                return 2

            if self.__isMaxedBook(driver):
                return 3

            today = datetime.date.today()
            tomorrow = today + datetime.timedelta(days=1)
            dayaftertomorrow = today + datetime.timedelta(days=2)
            dayafteraftertomorrow = today + datetime.timedelta(days=3)
            days = [dayafteraftertomorrow.strftime("%Y-%m-%d"), dayaftertomorrow.strftime("%Y-%m-%d"), tomorrow.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")]  # Book 3 days in advance

            for loc in [self.location, self.locationBackup]:
                if self.__isMaxedBook(driver):
                    return 3

                print("Checking", loc,  file=sys.stderr)
                sleep(2)
                driver.find_element_by_id('btn_club_select').click()

                if not elementByXpathExists(driver, "//div[contains(text(),'{}')]".format(loc)):
                    print("Incorrect location, try again", file=sys.stderr)
                    return 1

                # Select location
                driver.find_element_by_xpath("//div[contains(text(),'{}')]".format(loc)).click()

                for day in days:
                    print("Checking", day, file=sys.stderr)

                    if self.__isMaxedBook(driver): return 3
                    
                    scrollTo(driver, driver.find_element_by_id('btn_date_select')).click()
                    currentDate = "date_" + day
                    if not elementByIDExists(driver, currentDate):
                        driver.find_element_by_id('dialog_date_close').click()
                        print("     Date not showing", file=sys.stderr)
                        continue
                    
                    driver.find_element_by_id(currentDate).click()

                    booked = self.__bookTime(driver)
                    if booked:
                        self.timesbooked[dayaftertomorrow] = booked
                        print("     Booked for", dayaftertomorrow, "at", loc,  file=sys.stderr)
                        if self.function=='autobook':
                            break
                    else:
                        print("     Unable to book, all time slots taken for ", day, "at", loc,  file=sys.stderr)

                if not self.locationBackup:
                    break

        except Exception as e:
            if self.function=='autobook': print("AutoBookError:", str(e), file=sys.stderr)
            else: print("BookingError:", str(e), file=sys.stderr)
            return 127

        if len(self.timesbooked)>0:
            return 0
        else: 
            return 4

    def getReserved(self, driver):
        try:
            alltimes_elements = driver.find_elements_by_css_selector(
                ".reserved-slots > .time-slot")
            for i in alltimes_elements:
                print('-', i.get_attribute('data-slotdate'), i.get_attribute('data-slotclub'), i.get_attribute('data-slottime'))

            if len(alltimes_elements) == 0:
                print("No bookings, try picking a different location or changing your available time interval", file=sys.stdout)

        except Exception as e:
            print("ReserveErr:", str(e), file=sys.stderr)
            return 127

        return 0
