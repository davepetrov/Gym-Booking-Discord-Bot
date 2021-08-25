#!/usr/bin/python3
from .helpers import *
from .Account import Account
import sys
import datetime
from time import sleep
import time
from selenium import webdriver
from .Constants import *

CrunchLocations ={ALBERTACRUNCH:"AB",ONTARIOCRUNCH:"ON",QUEBECCRUNCH:"QC",ALABAMACRUNCH:"AL",CALIFORNIACRUNCH:"CA",COLORADOCRUNCH:"CO",CONNETICUTCRUNCH:"CT",DISTRICTOFCOLUMBIACRUNCH:"DC",FLORIDACRUNCH:"FL",GEORGIACRUNCH:"GA",IDAHOCRUNCH:"ID",ILLINOISCRUNCH:"IL",KANSASCRUNCH:"KS",KENTUCKYCRUNCH:"KY",MARYLANDCRUNCH:"MD",MINNESOTACRUNCH:"MN",MISSISSIPPICRUNCH:"MS",NEBRASKACRUNCH:"NE",NEVADACRUNCH:"NB",NEWJERSEYCRUNCH:"NJ",NEWMEXICOCRUNCH:"NM",NEWYORKCRUNCH:"NY",NORTHCAROLINACRUNCH:"NC",OHIOCRUNCH:"OH",OKLAHOMACRUNCH:"OK",OREGONCRUNCH:"OR",PENNSYLVANIACRUNCH:"PA",PUERTORICOCRUNCH:"PR",SANJOSECRUNCH:"SJ",SOUTHCAROLINACRUNCH:"SC",TENNESSEECRUNCH:"TN",TEXASCRUNCH:"TX",VIRGINIACRUNCH:"VA",WASHINGTONCRUNCH:"WA", WISCONSINCRUNCH:"WI"}
class CrunchFitnessAccount(Account):
    '''
    Account associated with crunch account
    '''

    def __init__(self, password: str, email: str, driver=None):
        self.driver=driver
        self.password = password
        self.email = email
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
            self.driver.get('https://members.crunchfitness.ca/members/sign_in')

            # Find username/email box, set
            email = scrollTo(self.driver, self.driver.find_element_by_id('login-email'))
            email.send_keys(self.email)

            # Find password box,

            pw = scrollTo(self.driver, self.driver.find_element_by_id('login-password'))
            pw.send_keys(self.password)

            # Find login button, click
            # FINISHED WORKING WITH GABE HERE - ONTO GABE (Dont forget about error codes)
            login = scrollTo(self.driver, self.driver.find_element_by_name('commit'))
            login.click()

            if elementByXpathExists(self.driver, '//html/body/div/div/div[2]/div/div/form/div[4]'): 
                print("Incorrect credentials, check again")
                return 0
                
            print("Logged in", file=sys.stderr)
            return 1

        except Exception as e:
            print("LoginError" + str(e), file=sys.stderr)
            
        return 0

    CrunchLocations ={ALBERTACRUNCH:"AB",ONTARIOCRUNCH:"ON",QUEBECCRUNCH:"QC",ALABAMACRUNCH:"AL",CALIFORNIACRUNCH:"CA",COLORADOCRUNCH:"CO",CONNETICUTCRUNCH:"CT",DISTRICTOFCOLUMBIACRUNCH:"DC",FLORIDACRUNCH:"FL",GEORGIACRUNCH:"GA",IDAHOCRUNCH:"ID",ILLINOISCRUNCH:"IL",KANSASCRUNCH:"KS",KENTUCKYCRUNCH:"KY",MARYLANDCRUNCH:"MD",MINNESOTACRUNCH:"MN",MISSISSIPPICRUNCH:"MS",NEBRASKACRUNCH:"NE",NEVADACRUNCH:"NB",NEWJERSEYCRUNCH:"NJ",NEWMEXICOCRUNCH:"NM",NEWYORKCRUNCH:"NY",NORTHCAROLINACRUNCH:"NC",OHIOCRUNCH:"OH",OKLAHOMACRUNCH:"OK",OREGONCRUNCH:"OR",PENNSYLVANIACRUNCH:"PA",PUERTORICOCRUNCH:"PR",SANJOSECRUNCH:"SJ",SOUTHCAROLINACRUNCH:"SC",TENNESSEECRUNCH:"TN",TEXASCRUNCH:"TX",VIRGINIACRUNCH:"VA",WASHINGTONCRUNCH:"WA", WISCONSINCRUNCH:"WI"}

    def __findRegion(self,location):
        if location in ALBERTACRUNCH:
            return "AB"
        ALBERTACRUNCH
        if location in ONTARIOCRUNCH:
            return "ON"
        if location in QUEBECCRUNCH:
            return "QC"
        if location in ALABAMACRUNCH:
            return "AL"
        if location in ARIZONACRUNCH:
            return "AZ"
        if location in CALIFORNIACRUNCH:
            return "CA"
        if location in COLORADOCRUNCH:
            return "CO"
        if location in CONNETICUTCRUNCH:
            return "CT"
        if location in DISTRICTOFCOLUMBIACRUNCH:
            return "DC"
        if location in FLORIDACRUNCH:
            return "FL"
        if location in GEORGIACRUNCH:
            return "GA"
        if location in IDAHOCRUNCH:
            return "ID"
        if location in ILLINOISCRUNCH:
            return "IL"
        if location in KANSASCRUNCH:
            return "KS"
        if location in KENTUCKYCRUNCH:
            return "KY"
        if location in MARYLANDCRUNCH:
            return "MD"
        if location in MASSACHUSETTSCRUNCH:
            return "MA"
        if location in MICHIGANCRUNCH:
            return "MI"
        if location in MINNESOTACRUNCH:
            return "MN"
        if location in MISSISSIPPICRUNCH:
            return "MS"
        if location in NEBRASKACRUNCH:
            return "NE"
        if location in NEVADACRUNCH:
            return "NV"
        if location in NEWJERSEYCRUNCH:
            return "NJ"
        if location in NEWMEXICOCRUNCH:
            return "NM"
        if location in NEWYORKCRUNCH:
            return "NY"
        if location in NORTHCAROLINACRUNCH:
            return "NC"
        if location in OHIOCRUNCH:
            return " OH"
        if location in OKLAHOMACRUNCH:
            return "OK"
        if location in OREGONCRUNCH:
            return "OR"
        if location in PENNSYLVANIACRUNCH:
            return "PA"
        if location in PUERTORICOCRUNCH:
            return "PR"
        if location in SANJOSECRUNCH:
            return "SJ"
        if location in SOUTHCAROLINACRUNCH:
            return "SC"
        if location in TENNESSEECRUNCH:
            return "TN"
        if location in TEXASCRUNCH:
            return "TX"
        if location in VIRGINIACRUNCH:
            return "VA"
        if location in WASHINGTONCRUNCH:
            return "WA"
        if location in WISCONSINCRUNCH:
            return "WI"
        
    def __locFormat(self, location):
        return (location.replace(" ", "-").lower())

    def special(x):
        return CrunchLocations[x]
    def book(self):
        try:
            if not self.login():
                return 5
            
            scrollTo(self.driver, self.driver.find_element_by_xpath('/html/body/div/div[2]/div[1]/div/ul/li[3]/a')).click()
            self.driver.implicitly_wait(3)
            time.sleep(1)
            x = self.driver.find_element_by_class_name('CCM--open-modal')
            x.click()
            time.sleep(1)
            selector = self.driver.find_element_by_class_name('selector--button')
            selector.click()
            time.sleep(1)
            time.sleep(1)

            for location in (self.location, self.locationBackup):

                existingRegion = self.__findRegion(location)
                town = self.__locFormat(location)
                if not existingRegion:
                    pass    
                
                scrollTo(self.driver, self.driver.find_element_by_id(existingRegion)).click()
                for i in self.driver.find_elements_by_class_name('ll-item'):
                    if(elementByIDExists(i, town)):
                        br = i.find_element_by_class_name('checkbox--container')
                        br.click()
                        self.driver.implicitly_wait(1)
                selector.click()

            print("Found some classes", file=sys.stderr)
            scrollTo(self.driver, self.driver.find_element_by_css_selector('#modal > div > button > span')).click()
            
            time.sleep(1)
            scrollTo(self.driver,self.driver.find_element_by_xpath("//div[@class='CCM--tabs']"))
            daycount = 1
            if(self.function == 'book'):
                for day in self.driver.find_elements_by_class_name('weektabs-tab'):
                    day.click()
                    daycount+=1
                    print("BROOOOOOO", file=sys.stderr)
                    #print(driver.find_element_by_xpath('/html/body/div/main/div[2]/div/section[2]/div[2]/div[1]/ul/li[{}]/span'.format(str(oog))).get_attribute('data-date'))
                    if(elementByXpathExists(self.driver, "//div[@class='CCM--no-result']")):
                        result = self.driver.find_element_by_xpath('/html/body/div/main/div[2]/div/section[2]/div[2]/div[1]/ul/li[{}]/span'.format(str(daycount))).get_attribute('data-date')
                        print("    No classes on ", result, file=sys.stderr)
                        time.sleep(1)
                    else:
                        count = 1
                        for possibleRes in day.find_elements_by_xpath("//div[@class='CCM--ReservationsModule']"):

                            test = possibleRes.find_element_by_xpath('/html/body/div/main/div[2]/div/section[2]/div[2]/div[2]/div[{}]'.format(str(count)))

                            if elementByXpathExists(possibleRes,"//a[@class='CCM--button reservations--button reservations--activate type--center']"):
                                print("afdadfadf", file =sys.stderr)
                                time.sleep(2)
                                scrollTo(self.driver, possibleRes)
                                if elementByXpathExists(possibleRes,".//a[@class='CCM--button reservations--button reservations--activate type--center'][contains(., 'reserve')]"):
                                    reserveButton = possibleRes.find_element_by_xpath(".//a[@class='CCM--button reservations--button reservations--activate type--center'][contains(., 'reserve')]")
                                    reserveButton.click()
                                    result = self.driver.find_element_by_xpath('/html/body/div/main/div[2]/div/section[2]/div[2]/div[1]/ul/li[{}]/span'.format(str(daycount))).get_attribute('data-date')
                                    print("     Booked for", result, "at", location,file=sys.stderr)
                                    time.sleep(2)
                                    
                                else: print("BD")

                                count += 1
                        
                        else:  
                            time.sleep(1)
                            pass
            elif(self.function == 'available'):
                for day in self.driver.find_elements_by_class_name('weektabs-tab'):
                    day.click()
                    for possibleClasses in self.driver.find_elements_by_class_name('schedules-row'):
                        possibleClasses.click()
                        result = self.driver.find_element_by_xpath('/html/body/div/main/div[2]/div/section[2]/div[2]/div[1]/ul/li[{}]/span'.format(str(daycount))).get_attribute('data-date')
                        print("     Available time at ", result, possibleClasses.find_element_by_class_name('type--d5').text, file=sys.stderr)
                    time.sleep(1)

        except Exception as e:
            if self.function=='autobook': print("AutoBookError:", str(e), file=sys.stderr)
            elif self.function=='available': print("AvailableError:", str(e), file=sys.stderr)
            else: print("BookingError:", str(e), file=sys.stderr)
            return 500
        
        if len(self.timesbooked)>0:
            return 0
        else: 
            return 4
    def getReserved(self):
        try:
            if not self.login():
                return 5
            
            myClassesButton = self.driver.find_element_by_xpath('/html/body/div/div[2]/div[1]/div/ul/li[3]/a')
            myClassesButton.click()
            
            reservations=self.driver.find_elements_by_class_name('schedules-row')
            if len(reservations) == 0:
                print("No bookings, try picking a different location or changing your available time interval", file=sys.stdout)

            else:
                # Will list out all reservations
                for reservation in reservations:
                    dateTime=reservation.find_elements_by_class_name("type--d5") 
                    dateBooked = dateTime[0].text
                    timeBooked = dateTime[1].text
                    print('- ', dateBooked, timeBooked)


        except Exception as e:
            print("ReserveErr:", str(e), file=sys.stderr)
            return 500

        return 0