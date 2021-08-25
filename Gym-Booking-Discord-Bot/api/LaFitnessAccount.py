
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

    def __init__(self, password:str, email: str, driver=None):
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
        self.locationBackup=None;


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

            if elementByIDExists(self.driver, 'lblErrorMessage'):
                if "Incorrect" in self.driver.find_element_by_id('lblErrorMessage').text:
                    print("     Incorrect credentials, check again")
                    return 0
                print("     Logged in", file=sys.stderr)
            return 1

        except Exception as e:
            print("LoginError" + str(e), file=sys.stderr)
            return 0

    #nice
    def __formatLocations(self):
        for loc in [self.location, self.locationBackup]:
            if loc != None:
                loc=loc.replace('-', ' ').upper()

    def __bookTime(self, day):
        try:
            if not elementByCssSelectorExists(self.driver, "#tblSchedule > tbody"):
                return False

            alltimes_table = self.driver.find_element_by_css_selector("#tblSchedule > tbody")
            times_rows=alltimes_table.find_elements_by_tag_name("tr")
            dates_passed=0

            for row in times_rows:
                if self.timesReserved == MAX_RESERVATIONS:
                    break

                if not elementByXpathExists(row, "./td"):
                    if elementExistsByClassName(row, "SubMainHeader"):
                        date=row.find_element_by_class_name("SubMainHeader").text
                        print("     Checking", date)
                        dates_passed+=1
                    continue

                clock=row.find_element_by_xpath("./td").text
                print('     ', clock)

                if "AM" not in clock and "PM" not in clock:
                    continue

                # is a time   
                index_of_colon = clock.find(':')
                index_of_space = clock.find(' ')
                hour, minute = int(clock[:index_of_colon] if clock[0]!=0 else clock[1:index_of_colon]), int(clock[index_of_colon+1:index_of_space])
    
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

                minrangetimegym = datetime.datetime.now().replace(hour=int(begin[:begin.find(":")]), minute=(int(begin[begin.find(":")+1:])))
                timegym = datetime.datetime.now().replace(hour=int(hour), minute=int(minute))
                maxrangetimegym = datetime.datetime.now().replace(hour=int(end[:end.find(":")]), minute=(int(end[end.find(":")+1:])))
                if minrangetimegym <= timegym <= maxrangetimegym:
                    # Book this time
                    if not elementExistsByTagName(row, "span"):
                        if self.function == "available":
                            # Print availability for notifs
                            print('         ', minrangetimegym.strftime("%H:%M"), '<=', timegym.strftime("%H:%M"), '<=', maxrangetimegym.strftime("%H:%M"),  file=sys.stderr)
                            print("         Available time at "+timegym.strftime("%H:%M"), file=sys.stderr)
                        
                        else:
                            # Book
                            row.find_element_by_link_text("Reserve Now").click() 

                            #Confirm
                            modal=self.driver.find_element_by_class_name("bootstrap-dialog-footer-buttons")
                            modal.find_element_by_xpath('./button[2]').click()

                            if row.find_element_by_link_text("Reserve Now"): # NOT WORKING
                                print('         ', "Already have maximum number of club reservations"); 
                                continue
                            else:
                                print('         ', minrangetimegym.strftime("%H:%M"), '<=', timegym.strftime("%H:%M"), '<=', maxrangetimegym.strftime("%H:%M"),  file=sys.stderr)
                                print("          Attempting to booking for "+timegym.strftime("%H:%M"), file=sys.stderr)

                        self.timesReserved+=1
                        
                    else:
                        print("         reserved")


        except Exception as e:
            print("bookTimeError:" + str(e),  file=sys.stderr)

        if self.timesReserved>0:
            return True
        return False

    def __locFormat(self, location):
        return (location.strip().replace(" ", "-").upper())

    def book(self):
        try:
            if not self.login():
                return 5

            self.driver.find_element_by_id("clubReservation").click()
            
            self.__formatLocations()

            day = datetime.datetime.today()

            for loc in [self.location, self.locationBackup]:
                loc = self.__locFormat(loc)
                clubList=self.driver.find_element_by_id("divClubList");
                clubs=clubList.find_elements_by_class_name("row")
                existsClub=False

                print("     Checking", loc, file=sys.stderr)

                # check if club exists
                for club in clubs:
                    clubname=club.find_element_by_class_name("clubname").text
                
                    if loc in clubname:
                        
                        # Exists a club
                        existsClub=True
                        club.find_element_by_tag_name("input").click()
                        break

                if not existsClub:
                    print("Incorrect location, try again", file=sys.stderr)
                    return 1
            
                booked = self.__bookTime(day)
                if booked:
                    print("     Booked at", loc,  file=sys.stderr)
                    if self.timesReserved == MAX_RESERVATIONS:
                        break
                else:
                    print("     Unable to book, all time slots taken at", loc,  file=sys.stderr)
            
                if not self.locationBackup:
                    break
                else:
                    self.driver.find_element_by_css_selector("#ctl00_MainContent_ucScheduleBooking_btnChangeClub").click()
                    sleep(2)
                
            
        except Exception as e:
            if self.function=='autobook': print("AutoBookError:", str(e), file=sys.stderr)
            elif self.function=='t': print("AvailableError:", str(e), file=sys.stderr)
            else: print("BookingError:", str(e), file=sys.stderr)
            return 500
        
        return 200

    def getReserved(self):
        try:
            if not self.login():
                return 5
            
            self.driver.find_element_by_id("clubReservation").click()
            self.driver.find_element_by_id("ctl00_MainContent_rpClubList_ctl01_btnReserve").click()

            if not elementByCssSelectorExists(self.driver,"#ctl00_MainContent_ucScheduleBooking_ucWorkouts_grdActivities > tbody"):
                print("No bookings, try picking a different location or changing your available time interval", file=sys.stdout)
                return 4

            alltimes_table= self.driver.find_element_by_css_selector("#ctl00_MainContent_ucScheduleBooking_ucWorkouts_grdActivities > tbody")
            times_rows=alltimes_table.find_elements_by_tag_name("tr")
            for row in times_rows[1:]:
                if elementByXpathExists(row, "./td"):
                    reservation=row.find_element_by_xpath("./td");
                    print('-',', '.join(reservation.text.split("\n")[0:2]))
            
        except Exception as e:
            print("ReserveErr:", str(e), file=sys.stderr)
            return 500

        return 200
