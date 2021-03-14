
#!/usr/bin/python3
from .helpers import *
import sys
import datetime

MAX_RESERVATIONS=2;
class Fit4lessAccount():
    '''
    Account associated with fit4less account
    '''

    def __init__(self, password, emailaddress):
        self.password = password
        self.email = emailaddress
        self.countbooked = 0
        self.timesbooked = {}
        self.timesReserved = 0
        self.starttime=None
        self.endtime=None
        self.location=None
        self.locationBackup=None;

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
                    booktime = scrollTo(driver, driver.find_element_by_id(time_id))
                    booktime.click()  # Click on the specifc time to book, falling in the time domain we want

                    # Accept COVID-19 terms of service
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
            for loc in [self.location, self.locationBackup]:
                booked = self.bookTime(driver)
                if booked:
                    self.timesbooked[dayaftertomorrow] = booked
                    print("Booked for", dayaftertomorrow,  file=sys.stderr)
                    break
                else:
                    print("Unable to book, all time slots taken for ", dayaftertomorrow, "at", loc,  file=sys.stderr)
                if not self.locationBackup:
                    break

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
                self.timesReserved+=1;
                print('-', i.get_attribute('data-slotdate'), i.get_attribute('data-slotclub'), i.get_attribute('data-slottime'))
            
            if len(alltimes_elements)==0:
                print("No bookings, try picking a different location or changing your available time interval", file=sys.stderr)
                print("No bookings, try picking a different location or changing your available time interval", file=sys.stdout)
    
        except Exception as e:
            print("ReserveErr:", str(e), file=sys.stderr)
        
        return self.timesReserved

    