
#!/usr/bin/python3
from .helpers import *

class Account():
    '''
    Account interface
    '''

    def __init__(self, password, email, driver):
        self.driver=driver
        self.password = password
        self.email = email
        self.countbooked = 0
        self.timesbooked = {}
        self.begin=None
        self.end=None
        self.beginWeekend=None
        self.endWeekend=None
        self.location=None
        self.locationBackup=None
        self.function=None

    def login(self):
        pass

    def book(self):
        pass

    def getReserved(self):
        pass
