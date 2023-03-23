from http import server
from operator import truediv
from tkinter.filedialog import SaveFileDialog
import mvis
import random as rnd
import speech_recognition as sr
import pyttsx3 as txttospch
import contactServer

class Bye(Exception):
    pass

#variables----------------------------------------------
#input_string = str(input())
#mvis_string = str(mvis.listen())
setkamkom = {
        "กลอนพรี่เน็ท" : "คาบคณิต คิดถึงเธอ จนใจสั่น พักกลางวัน เพ้อถึงเธอ จนหวั่นไหว คาบฟิสิกส์ นึกถึงเธอ ทั้งหัวใจ คาบต่อไป โดดดีกว่า ไปหาเธอ",
        1:"เวลาอกหักอย่าขับรถ เพราะรถมีแต่ที่ปัดน้ำฝน แต่ไม่มีที่ปาดน้ำตา",
        2:"เราชอบหน้าฝนนะ แต่เราชอบหน้าเธอมากกว่า",
        3:"แดดแรงมันแยงตา รอยยิ้มที่เธอส่งมามันแยงใจ โอ้ย"   
    }

#setting&iscellaneous-----------------------------------

#def run():
#def home_setting():
#def keyword_recog(string):


#function & gimmic---------------------------------------
def randomkamkom():
    global setkamkom

    I = rnd.choice(list (i for i in range(1,(len(setkamkom)-1))))
    if False:
        I = "กลอนพรี่เน็ท"
    mvis.say(f'อ่ะแฮ่ม {setkamkom[I]} วี้ดวิ้ว เปนไง เท่อ่ะดิ อิอิ')
    return setkamkom[I]

def addkamkom():
    global setkamkom
    kamkom_adding = mvis.listen()
    setkamkom.update({int(len(setkamkom)):kamkom_adding})

def preugsapanha_tham():
    global saved
    s = True
    z = 0
    saved = {} 
    mvis.say("สวัสดีครับ\n เอมวิส รับฟังคุณเสมอครับผม")
    mvis.say("หากต้องการฝาก กดหนึ่ง หากต้องการดูคำที่ฝากไว้ กดสอง")
    a = int(input("หากต้องการฝาก กด1 หากต้องการดูคำที่ฝากไว้ กด2 :"))
    mvis.listen()
    if a  ==1:
        words = mvis.listen()
        saved.update({words:0})
    else:
        for x in saved:
            print(f'{saved.keys(x)} มีคนบอกว่า {saved.values(x)}')

def preugsapanha_thob():
    global saved
    mvis.say("ยินดีต้อนรับสู่ระบบปรึกษาปัญหา ระบบกำลังทำการเลือกข้อความให้คุณ")
    N = rnd.choice(list(i for i in range(1,len(saved))))
    print(list(saved.keys())[N-1])
    mvis_words = mvis.listen()
    saved[list(saved.keys())[N-1]] = f'มีคนฝากมาบอกคุณว่า{mvis_words}'

def headortail():
    print("กำลังสุ่ม... // headortail function activated")
    if rnd.choice([0,1]) == 1:
        print('Head')
        return "Head"
    else:
        print('Tail')
        return "Tail"


def data_sport_center():
    a = {}
    mvis.say("ต้องการข้อมูลอะไรครับ")
    mvis.listen()
    return a
#def fakbok_mvis():
#def talk():
#def mvis_news():
#def google_it():

#main loop---------------------------------------------

allCommand = {
    "เล่นมุขให้ฟังหน่อย": randomkamkom(),
    "เพิ่มมุขให้" : addkamkom(),
    "อยากได้คำปรึกษา" : preugsapanha_tham(),
    "พร้อมให้คำปรึกษา" : preugsapanha_thob(),
    "สุ่มหัวก้อยให้หน่อย" : headortail(),
    "ศูนย์กีฬามีกี่คน" : data_sport_center()
}

while True:
    try:
        msgtest = str(input("Say Something..."))
        msg = mvis.listen()
        if True:
            mvis.takeAction(allCommand, msgtest)

    except Bye:
        print('exception')
        break
    except KeyError:
        mvis.say('เรื่องนี้ผมอาจจะช่วยไม่ได้ ขอโทษด้วยครับ')
    else:
        mvis.say('ผมช่วยอะไรได้บ้างครับ')
