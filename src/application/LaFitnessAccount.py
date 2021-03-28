
#!/usr/bin/python3
from .helpers import *
from .Account import Account
import sys
import datetime
from time import sleep
from selenium import *

MAX_RESERVATIONS = 2

class LaFitnessAccount(Account):
    '''
    Account associated with fit4less account
    '''

    def __init__(self, driver, password, emailaddress):
        self.driver=driver
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

    def login(self):
        try:
            self.driver.get('https://www.lafitness.com/Pages/login.aspx')

            # Find username/email box, set
            email = scrollTo(self.driver, self.driver.find_element_by_id('txtUser'))
            email.send_keys(self.email)

            # Find password box, set
            pw = scrollTo(self.driver, self.driver.find_element_by_id('txtPassword'))
            pw.send_keys(self.password)

            # Find login button, click
            login = scrollTo(self.driver, self.driver.find_element_by_id('ctl00_MainContent_Login1_btnLogin'))
            login.click()

            if elementByXpathExists(self.driver, '/html/body/div[2]/div/div/div/div/h1'):
                if self.driver.find_element_by_xpath('/html/body/div[2]/div/div/div/div/h1').text == 'LOG IN FAILED':
                    print("Incorrect credentials, check again")
                    return 0
                return 1

        except Exception as e:
            print("LoginError" + str(e), file=sys.stderr)
        return 0


    def book(self):
        # 1) Enter https://www.fit4less.ca/ > 2) Book workout
        try:
            pass

        except Exception as e:
            if self.function=='autobook': print("AutoBookError:", str(e), file=sys.stderr)
            else: print("BookingError:", str(e), file=sys.stderr)
            return 127


    def getReserved(self):
        try:
            pass

        except Exception as e:
            print("ReserveErr:", str(e), file=sys.stderr)
            return 127
        return 0
