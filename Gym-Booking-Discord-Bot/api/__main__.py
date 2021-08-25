#!/usr/bin/python3
from datetime import datetime
from .Fit4lessAccount import Fit4lessAccount
from .LaFitnessAccount import LaFitnessAccount
from .CrunchFitnessAccount import CrunchFitnessAccount
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import os
import sys
from time import sleep, time


# Usage
    # python3 -m api [gym] autobook [pass] [email] [location] [location-backup] [minimum time to book] [maximum time to book]
    # python3 -m api [gym] available [pass] [email] [location] [location-backup] [minimum time to book] [maximum time to book]
    # python3 -m api [gym] book [pass] [email] [location] [location-backup] [minimum time to book] [maximum time to book]
    # python3 -m api [gym] login [pass] [email] 
    # python3 -m api [gym] reserved [pass] [email] 

# Gyms include 'fit4less', 'lafitness', 'crunchfitness'

# Error codes: 
    # 200 : Success
    # 1 : Invalid location
    # 2 : Gym closed
    # 3 : Max booked
    # 4 : Able to check for bookings w/o running into errors but unable to booking due to some curcumstance (Full, max res, etc.)
    # 5 : Not logged in 
    # 6 : Not active member
    # 500: Api error
    # 400: User error

print("---------------Exec----------------", file=sys.stderr)
start_time = time()
print(datetime.now(), file=sys.stderr)

gym = sys.argv[1]
function = sys.argv[2] 
password = sys.argv[3]
email = sys.argv[4]

#Setup option for driver
options = webdriver.ChromeOptions()
options.add_argument("--window-size=1920,1080");
options.add_argument("--no-sandbox");
options.add_argument("--disabFle-gpu");
options.add_argument("--disable-crash-reporter");
options.add_argument("--disable-extensions");
options.add_argument("--disable-in-process-stack-traces");
options.add_argument("--disable-logging");
options.add_argument("--disable-dev-shm-usage");
options.add_argument("--log-level=3");
options.add_argument("--output=/dev/null")
options.add_argument("--headless");


# options.add_argument("---debugging-port=9222");

# Check for gym
if (gym=='fit4less'): person = Fit4lessAccount(password=password, email=email);
elif (gym=='lafitness'): person = LaFitnessAccount(password=password, email=email)
elif (gym=='crunchfitness'): person = CrunchFitnessAccount(password=password, email=email)
else: print("Unknown Gym", file=sys.stderr); sys.exit(400);

#Check os type
if sys.platform.startswith('linux'):    
    driver=webdriver.Chrome(executable_path="/home/david_petrov9/BookMeBot-Private/resources/chromedriver", options=options)
elif sys.platform.startswith("darwin") or sys.platform.startswith('win'):
    # options.add_argument("--headless");
    driver=webdriver.Chrome(ChromeDriverManager().install(), options=options)
else:
    print("Not configured to os", file=sys.stderr)
    sys.exit(400)

driver.maximize_window()
driver.implicitly_wait(10)
person.driver=driver

print("function: ", function, file=sys.stderr)
print("gym: ", gym, file=sys.stderr)
person.function=function

#Parse input - Will need to change as this is a very messy method of ui communicating w/ api
if function == 'book':
    person.location = sys.argv[5].replace('-', ' ')
    person.locationBackup = sys.argv[6].replace('-', ' ')
    person.begin = sys.argv[7]
    person.end = sys.argv[8]
    person.beginWeekend = sys.argv[9]
    person.endWeekend = sys.argv[10]

    print("timeslot: ", person.begin, '-',person.end, file=sys.stderr)
    print("timeslot weekend :", person.beginWeekend, '-',person.endWeekend, file=sys.stderr)
    print("location: ", person.location, file=sys.stderr)
    print("locationBackup: ", person.locationBackup, file=sys.stderr)
    print("email: ", person.email, file=sys.stderr)
    print("pass:", person.password, file=sys.stderr)

    if person.locationBackup=='null': person.locationBackup=None;
    code=person.book()

    print(datetime.now(), file=sys.stderr)
    print("--- %s seconds ---" % round((time() - start_time),5), file=sys.stderr)
    print("         -------------------------------", file=sys.stderr)

    driver.quit()
    exit(code)

elif function == 'autobook':
    person.location = sys.argv[5].replace('-', ' ')
    person.locationBackup = sys.argv[6].replace('-', ' ')
    person.begin = sys.argv[7]
    person.end = sys.argv[8]
    person.beginWeekend = sys.argv[9]
    person.endWeekend = sys.argv[10]

    print("timeslot :", person.begin, '-',person.end, file=sys.stderr)
    print("timeslot weekend :", person.beginWeekend, '-',person.endWeekend, file=sys.stderr)
    print("location: ", person.location, file=sys.stderr)
    print("locationBackup: ", person.locationBackup, file=sys.stderr)
    print("email: ", person.email, file=sys.stderr)
    print("pass: ", person.password, file=sys.stderr)

    if person.locationBackup=='null': person.locationBackup=None;
    code=person.book()

    print(datetime.now(), file=sys.stderr)
    print("--- %s seconds ---" % round((time() - start_time),5), file=sys.stderr)

    driver.quit()
    sys.exit(code)

elif function == 'available':
    person.location = sys.argv[5].replace('-', ' ')
    person.locationBackup = sys.argv[6].replace('-', ' ')
    person.begin = sys.argv[7]
    person.end = sys.argv[8]
    person.beginWeekend = sys.argv[9]
    person.endWeekend = sys.argv[10]

    print("timeslot :", person.begin, '-',person.end, file=sys.stderr)
    print("timeslot weekend :", person.beginWeekend, '-',person.endWeekend, file=sys.stderr)
    print("location: ", person.location, file=sys.stderr)
    print("locationBackup: ", person.locationBackup, file=sys.stderr)
    print("email: ", person.email, file=sys.stderr)
    print("pass: ", person.password, file=sys.stderr)

    if person.locationBackup=='null': person.locationBackup=None;
    code=person.book()

    print(datetime.now(), file=sys.stderr)
    print("--- %s seconds ---" % round((time() - start_time),5), file=sys.stderr)

    driver.quit()
    sys.exit(code)

elif function == 'reserved':
    print("email: ", person.email, file=sys.stderr)
    print("pass: ", person.password, file=sys.stderr)

    code = person.getReserved()

    print(datetime.now(), file=sys.stderr)
    print("--- %s seconds ---" % round((time() - start_time),5), file=sys.stderr)

    driver.quit()
    sys.exit(code)


elif function == 'login':
    print("email: ", person.email, file=sys.stderr)
    print("pass: ", person.password, file=sys.stderr)

    login=person.login()
    code = 5 if login==0 else 200

    print(datetime.now(), file=sys.stderr)
    print("--- %s seconds ---" % round((time() - start_time),5), file=sys.stderr)

    driver.quit()
    sys.exit(code)


else:
    print("Unknown command", file=sys.stderr)
    print(datetime.now(), file=sys.stderr)
    print("--- %s seconds ---" % round((time() - start_time),5), file=sys.stderr)

    driver.quit()
    sys.exit(400)



