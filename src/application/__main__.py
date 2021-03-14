#!/usr/bin/python3
from .Fit4lessAccount import Fit4lessAccount
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import os
import sys
from time import sleep, time

# Usage: python3 -m application [fit4less/lafitness] [command] [pass] [email] [location] [location-backup] [minimum time to book] [maximum time to book]
# Prereq: Times are in military format (##:##)
#        Commands include: book, reserved, locations, autobook
#        Gyms include 'fit4less', 'lafitness'

print("----------------------------------------", file=sys.stderr)
start_time = time()

gym = sys.argv[1]
function = sys.argv[2]  # command
password = sys.argv[3]
email = sys.argv[4]

options = webdriver.ChromeOptions()
options.add_argument("--window-size=1920,1080");
options.add_argument("--no-sandbox");
options.add_argument("--headless");
options.add_argument("--disable-gpu");
options.add_argument("--disable-crash-reporter");
options.add_argument("--disable-extensions");
options.add_argument("--disable-in-process-stack-traces");
options.add_argument("--disable-logging");
options.add_argument("--disable-dev-shm-usage");
options.add_argument("--log-level=3");
options.add_argument("--output=/dev/null");

driver = webdriver.Chrome(ChromeDriverManager().install(), options=options, service_log_path='/dev/null')
driver.implicitly_wait(5)

if (gym=='fit4less'): person = Fit4lessAccount(password, email)
# elif (gym=='lafitness'): person = LAFitnessAccount(password, email)
else: print("Unknown Gym", file=sys.stderr); sys.exit();

if person.isClosed(driver):
    driver.quit()
    sys.exit();

if function == 'book':
    person.location = sys.argv[5].replace('-', ' ')
    person.locationBackup = sys.argv[6].replace('-', ' ')

    person.starttime = sys.argv[7]
    person.endtime = sys.argv[8]

    print(function, file=sys.stderr)
    print("timeslot: ", person.starttime, '-',person.endtime, file=sys.stderr)
    print("location: ", person.location, file=sys.stderr)
    print("locationBackup: ", person.locationBackup, file=sys.stderr)
    print("email: ", person.email, file=sys.stderr)
    print("pass:", person.password, file=sys.stderr)

    if person.login(driver):
        person.book(driver)

elif function == 'autobook':
    person.location = sys.argv[5].replace('-', ' ')
    person.starttime = sys.argv[6]
    person.endtime = sys.argv[7]

    print(function, file=sys.stderr)
    print("timeslot :", person.starttime, '-',person.endtime, file=sys.stderr)
    print("location: ", person.location, file=sys.stderr)
    print("locationBackup: ", person.locationBackup, file=sys.stderr)
    print("email: ", person.email, file=sys.stderr)
    print("pass: ", person.password, file=sys.stderr)

    if person.login(driver):
        person.autobook(driver)

elif function == 'reserved':
    print(function, file=sys.stderr)
    print("email: ", person.email, file=sys.stderr)
    print("pass: ", person.password, file=sys.stderr)

    if person.login(driver):
        person.getReserved(driver)

else:
    print("Unknown command", file=sys.stderr)

print("--- %s seconds ---" % round((time() - start_time),5), file=sys.stderr)
driver.quit()
sys.exit();

