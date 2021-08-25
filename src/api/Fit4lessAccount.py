
#!/usr/bin/python3
from .helpers import *
from .Account import Account
import sys
import datetime
from time import sleep
from selenium import webdriver

MAX_RESERVATIONS = 2
class Fit4lessAccount(Account):
    '''
    Account associated with fit4less account
    '''

    def __init__(self, password: str, email: str, driver=None):
        self.driver=driver
        self.password = password
        self.email = email
        self.countbooked = 0
        self.timesReserved = []
        self.begin=None
        self.end=None
        self.beginWeekend=None
        self.endWeekend=None
        self.location=None
        self.locationBackup=None



    def login(self):
        try:
            self.driver.get('https://myfit4less.gymmanager.com/portal/login')

            # Find username/email box, set
            email = scrollTo(self.driver, self.driver.find_element_by_id('emailaddress'))
            email.send_keys(self.email)

            # Find password box,
            pw = scrollTo(self.driver, self.driver.find_element_by_id('password'))
            pw.send_keys(self.password)

            # Find login button, click
            login = scrollTo(self.driver, self.driver.find_element_by_id('loginButton'))
            login.click()

            if elementByXpathExists(self.driver, '/html/body/div[2]/div/div/div/div/h1'):
                if self.driver.find_element_by_xpath('/html/body/div[2]/div/div/div/div/h1').text == 'LOG IN FAILED':
                    print("Incorrect credentials, check again")
                    return 0
                    
                print("Logged in", file=sys.stderr)
                return 1

        except Exception as e:
            print("LoginError" + str(e), file=sys.stderr)
            
        return 0

    def __isActiveMember(self):
        try:
            if elementByXpathExists(self.driver, "//*[@id='doorPolicyForm']/h2"):
                if self.driver.find_element_by_xpath("//*[@id='doorPolicyForm']/h2").text == "No valid membership":
                    print("         Unable to book, Inactive gym member",  file=sys.stderr)
                    return 0

        except Exception as e:
            print("isActiveMemberErr:", str(e),  file=sys.stderr)

        return 1


    def __isMaxedBook(self):
        try:
            if elementByXpathExists(self.driver, '//*[@id="doorPolicyForm"]/h2') and self.driver.find_element_by_xpath('//*[@id="doorPolicyForm"]/h2').text == 'Maximum personal reservations reached':
                print("         Unable to book, Maximum # of slots booked",  file=sys.stderr)
                return 1

        except Exception as e:
            print("isMaxedBookError:", str(e),  file=sys.stderr)

        return 0

    def __checkDailyLimitReached(self):
        try:
            continueXpath = '/html/body/div[2]/div/div/div/div/div/div'
            if elementByXpathExists(self.driver, continueXpath) and self.driver.find_element_by_xpath(continueXpath).click():
                print("Daily limit reached", file=sys.stderr)
                return 1

        except Exception as e:
            print("checkDailyLimitReachedErr:", str(e),  file=sys.stderr)

        return 0

    def __isClosed(self):
        try:
            for h1 in self.driver.find_elements_by_tag_name("h1"):
                if "closed" in h1.text:
                    print("     Gym closed, quit", file=sys.stderr)
                    return True

        except Exception as e:
            print("isClosedError:" + str(e),  file=sys.stderr)

        return False

    def __bookTime(self, day):
        try:
            alltimes_elements = self.driver.find_elements_by_css_selector(".available-slots > .time-slot")

            if len(alltimes_elements) == 0:
                return False

            for time in alltimes_elements:
            
                #Do time stuff UGLY UGLY UGLY
                clock = time.get_attribute("data-slottime")[3::]
                time_id = time.get_attribute("id")
                index_of_colon = clock.find(':')
                index_of_space = clock.find(' ')
                hour, minute = int(clock[:index_of_colon]), int(clock[index_of_colon+1:index_of_space])
                if clock[-2:] == "PM":
                    if hour == 12: pass
                    else: hour += 12
                elif clock[-2:] == "AM" and hour == 12:
                    hour = 0

                
                if day.weekday() < 5:
                    begin=self.begin
                    end=self.end
                else:
                    begin=self.beginWeekend
                    end=self.endWeekend

                minrangetimegym = datetime.datetime.now().replace(hour=int(begin[:begin.find(":")],), minute=(int(begin[begin.find(":")+1:])))
                timegym = datetime.datetime.now().replace(hour=int(hour), minute=int(minute))
                maxrangetimegym = datetime.datetime.now().replace(hour=int(end[:end.find(":")]), minute=(int(end[end.find(":")+1:])))
                if minrangetimegym <= timegym < maxrangetimegym:
                    if self.function == "available":
                        print('   ', minrangetimegym.strftime("%H:%M"), '<=', timegym.strftime("%H:%M"), '<=', maxrangetimegym.strftime("%H:%M"),  file=sys.stderr)
                        print("Available time at "+timegym.strftime("%H:%M"), file=sys.stderr)
                    else:
                        # Book this time
                        self.driver.find_element_by_id(time_id).click() 

                        # Accept COVID-19 terms of service
                        scrollTo(self.driver, self.driver.find_element_by_id("dialog_book_yes")).click()

                        if self.__checkDailyLimitReached():
                            return False

                        print('          '+minrangetimegym.strftime("%H:%M"), '<=', timegym.strftime("%H:%M"), '<=', maxrangetimegym.strftime("%H:%M"),  file=sys.stderr)
                        print("          Booking for "+timegym.strftime("%H:%M"), file=sys.stderr)

                    return True

        except Exception as e:
            print("bookTimeError:" + str(e),  file=sys.stderr)

        return False
        
    def __locFormat(self, location):
        return (location.strip())


    def book(self):
        # 1) Enter https://www.fit4less.ca/ > 2) Book workout
        try:
            if not self.login():
                return 5

            if not self.__isActiveMember():
                return 6

            if self.__isClosed():
                return 2

            if self.__isMaxedBook():
                return 3

            today = datetime.date.today()
            tomorrow = today + datetime.timedelta(days=1)
            dayaftertomorrow = today + datetime.timedelta(days=2)
            dayafteraftertomorrow = today + datetime.timedelta(days=3)
            days = [dayafteraftertomorrow, dayaftertomorrow, tomorrow, today]  # Book 3 days in advance

            # Get reserved times
            reservations = self.driver.find_elements_by_css_selector(".reserved-slots > .time-slot")
            for i in reservations:
                date=i.get_attribute('data-slotdate');
                dateFormat=datetime.datetime.strptime(date, '%A, %d %B %Y').strftime('%Y-%m-%d')
                print("Already reserved for", dateFormat, file=sys.stderr)
                self.timesReserved.append(dateFormat)

            # Begin booking
            for loc in [self.location, self.locationBackup]:

                loc = self.__locFormat(loc)

                if self.__isMaxedBook():
                    if self.countbooked>0:
                        return 0
                    else: 
                        return 3

                print("     Checking", loc,  file=sys.stderr)
                sleep(2)
                self.driver.find_element_by_id('btn_club_select').click()

                if not elementByXpathExists(self.driver, "//*[text()='{}']".format(loc)): #didnt format location- still uses "-" format in book()--> reverted it back to normal for comparison
                    print("Incorrect location, try again", file=sys.stderr)
                    if self.countbooked>0:
                        return 0
                    else: 
                        return 3

                # Select location
                self.driver.find_element_by_xpath("//*[text()='{}']".format(loc)).click() #didnt format location- still uses "-" format in book()--> reverted it back to normal for comparison

                # Check Gym closed
                if self.__isClosed():
                    return 2

                for day in days:

                    # Check if already booked for this day
                    dayStr=day.strftime("%Y-%m-%d")
                    print("     Checking", dayStr, file=sys.stderr)
                    if dayStr in self.timesReserved:
                        print("         Already Booked for this day, next", file=sys.stderr)
                        continue


                    if self.__isMaxedBook():
                        if self.countbooked>0:
                            return 0
                        else: 
                            return 3
                    
                    scrollTo(self.driver, self.driver.find_element_by_id('btn_date_select')).click()
                    currentDate = "date_" + dayStr
                    if not elementByIDExists(self.driver, currentDate):
                        self.driver.find_element_by_id('dialog_date_close').click()
                        print("     Date not showing", file=sys.stderr)
                        continue
                    
                    self.driver.find_element_by_id(currentDate).click()

                    booked = self.__bookTime(day)
                    if booked:
                        self.countbooked+=1;
                        print("         Booked for", dayStr, "at", loc,  file=sys.stderr)
                        # if self.function=='autobook':
                        #     break
                    else:
                        print("         Unable to book, all time slots taken for ", day, "at", loc,  file=sys.stderr)

                if not self.locationBackup or loc==self.locationBackup:
                    break

        except Exception as e:
            if self.function=='autobook': print("AutoBookError:", str(e), file=sys.stderr)
            elif self.function=='available': print("AvailableError:", str(e), file=sys.stderr)
            else: print("BookingError:", str(e), file=sys.stderr)
            return 500

        if self.countbooked>0:
            return 200
        else: 
            return 4

    def getReserved(self):
        try:
            if not self.login():
                return 5

            if self.__isClosed():
                return 2

            if not self.__isActiveMember():
                return 6

            reservations = self.driver.find_elements_by_css_selector(".reserved-slots > .time-slot")
        
            if len(reservations) == 0:
                print("No bookings, try picking a different location or changing your available time interval", file=sys.stdout)
                return 4

            else:
                for i in reservations:
                    date=i.get_attribute('data-slotdate')
                    club=i.get_attribute('data-slotclub')
                    time=i.get_attribute('data-slottime')
                    print('-', date, "for", time, "at", club, file=sys.stdout)
                    self.timesReserved.append(date)

        except Exception as e:
            print("ReserveErr:", str(e), file=sys.stderr)
            return 500

        return 200
