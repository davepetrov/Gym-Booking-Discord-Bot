
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
        self.starttime=None
        self.endtime=None
        self.location=None
        self.locationBackup=None;

    def login(self, driver):
        pass

    def book(self, driver):
        pass

    def getReserved(self, driver):
        pass
