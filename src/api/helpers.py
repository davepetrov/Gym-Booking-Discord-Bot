
#!/usr/bin/python3
from selenium.common.exceptions import NoSuchElementException  

def scrollTo(parent, element):
    parent.execute_script("""arguments[0].scrollIntoView({
            block: 'center',
            inline: 'center'
        });""", element)
    parent.execute_script("arguments[0].scrollIntoView();", element);
    return element

def elementExistsByClassName(parent, classname):
    try:
        parent.find_element_by_class_name(classname)
    except NoSuchElementException:
        return False
    return True

def elementByXpathExists(parent, xpath):
    try:
        parent.find_element_by_xpath(xpath)
    except NoSuchElementException:
        return False
    return True

def elementByIDExists(parent, id):
    try:
        parent.find_element_by_id(id)
    except NoSuchElementException:
        return False
    return True

def elementByCssSelectorExists(parent, selector):
    try:
        parent.find_element_by_css_selector(selector)
    except NoSuchElementException:
        return False
    return True

def elementExistsByTagName(parent, tag):
    try:
        parent.find_element_by_tag_name(tag)
    except NoSuchElementException:
        return False
    return True

def elementExistsByLinkText(parent, text):
    try:
        parent.find_element_by_link_text(text)
    except NoSuchElementException:
        return False