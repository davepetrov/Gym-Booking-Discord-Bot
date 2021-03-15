
#!/usr/bin/python3
from .helpers import *

class Account():
    '''
    Account interface
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
        pass

    def isMaxedBook(self, driver): 
        pass

    def checkDailyLimitReached(self, driver):
        pass

    def isClosed(self, driver):
        pass

    def autobook(self, driver):
        pass

    def book(self, driver):
        pass

    def getReserved(self, driver):
        pass
