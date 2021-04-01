#!/usr/bin/python3
from datetime import datetime
from .Fit4lessAccount import Fit4lessAccount
from .LaFitnessAccount import LaFitnessAccount
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import os
import sys
from time import sleep, time


# Usage: python3 -m application [fit4less/lafitness] [command] [pass] [email] [location] [location-backup] [minimum time to book] [maximum time to book]
# Prereq: Times are in military format (##:##)
#        Commands include: book, reserved, locations, autobook
#        Gyms include 'fit4less', 'lafitness'

# Errorcodes: 
# 0 : Success
# 1 : Invalid location
# 2 : Gym closed
# 3 : Max booked
# 4 : Was able to check for bookings without running into errors but unable to booking
# 5 : Not logged in 
# 500: Api error
# 400: User error

print("---------------Exec----------------", file=sys.stderr)

gym = sys.argv[1]
function = sys.argv[2] 
password = sys.argv[3]
email = sys.argv[4]

options = webdriver.ChromeOptions()
options.add_argument("--window-size=1920,1080");
options.add_argument("--no-sandbox");
# options.add_argument("--headless");
options.add_argument("--disable-gpu");
options.add_argument("--disable-crash-reporter");
options.add_argument("--disable-extensions");
options.add_argument("--disable-in-process-stack-traces");
options.add_argument("--disable-logging");
options.add_argument("--disable-dev-shm-usage");
options.add_argument("--log-level=3");
options.add_argument("--output=/dev/null");


start_time = time()
print(datetime.now(), file=sys.stderr)

if (gym=='fit4less'): person = Fit4lessAccount(password=password, email=email); options.add_argument("--headless");
elif (gym=='lafitness'): person = LaFitnessAccount(password=password, email=email)
else: print("Unknown Gym", file=sys.stderr); sys.exit();

driver=webdriver.Chrome(options=options)
person.driver=driver

print("function: ", function, file=sys.stderr)
print("gym: ", gym, file=sys.stderr)
person.function=function
driver.implicitly_wait(2)

if function == 'book':
    person.location = sys.argv[5].replace('-', ' ')
    person.locationBackup = sys.argv[6].replace('-', ' ')
    person.starttime = sys.argv[7]
    person.endtime = sys.argv[8]

    print("timeslot: ", person.starttime, '-',person.endtime, file=sys.stderr)
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
    person.starttime = sys.argv[7]
    person.endtime = sys.argv[8]

    print("timeslot :", person.starttime, '-',person.endtime, file=sys.stderr)
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
    code = 1 if login==0 else 0

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



