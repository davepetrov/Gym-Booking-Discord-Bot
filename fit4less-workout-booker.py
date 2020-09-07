#Assumptions: Account used already exists

import selenium
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
from selenium.webdriver.common.action_chains import ActionChains
import os
import sys
from time import sleep

password_priv='dp05092001'
emailaddress_priv = 'peamap101@gmail.com'
gymlocation_priv = 'Richmond Blundell' # must be exact
try:
    # driver = webdriver.safari.webdriver.WebDriver(quiet=False)
    driver = webdriver.Chrome(os.path.join(os.getcwd(), 'chromedriver'))
    # driver = webdriver.Firefox()
    #driver.maximize_window()


    # 1) Enter https://www.fit4less.ca/ > 
    driver.get('https://www.fit4less.ca/')
    driver.implicitly_wait(5)

    # 2) Book Workout
    # driver.find_element_by_xpath('/html/body/form/div[6]/header/div[2]/div/div[2]/ul/li[2]/a').click()
    # driver.implicitly_wait(5)

    driver.get('https://myfit4less.gymmanager.com/portal/login.asp')


    # # 3) login
    # Find username/email box, set
    email = driver.find_element_by_name('emailaddress')
    email.send_keys(emailaddress_priv)

    # Find password box, set
    password = driver.find_element_by_name('password')
    password.send_keys(password_priv)

    # Find login button, click
    driver.implicitly_wait(5)
    login_button = driver.find_element_by_xpath('/html/body/div[2]/div/div/div/div/form/div[2]/div[1]/div')
    login_button.click()

    # 4) Select Club: Ex: North York Centerpoint Mall
    driver.find_element_by_id('btn_club_select').click()
    location_element = driver.find_element_by_xpath("//div[contains(text(),'{}')]".format(gymlocation_priv))
    location_element.click()


    # 5) Select Day: Ex: Tomorrow. Check todays date, select tomorrows date (Maximum of 3 days in advance)

    days = driver.find_elements_by_class_name('button md-option')
    for day in days:
        print(day.text)



    # 6) Select time: No times avaiable -> Recommend tomorrows times, else: Let me select times. Recommend times between a certain preset range, but show all times too.
except Exception as e:
    print(e)
    driver.quit()