import speech_recognition as sr
import pyttsx3 as txttospch
import contactServer

def say(message):     
    engine = txttospch.init()
    voices = engine.getProperty('voices')
    # setter method .[0]=male voice and [1]=female voice in set Property.
    engine.setProperty('voice', voices[0].id)
    engine.say(message) 
    engine.runAndWait()
    
def listen(keywords):
    r = sr.Recognizer()
    print('เริ่ม')
    with sr.Microphone() as source:
        while True:
            #print('กำลังฟัง . . .')
            audio = r.listen(source)
            try:
                msg = r.recognize_google(audio, None, 'th')
                #if keywords[0] or keywords[1] in r.recognize_google(audio, None, 'th'):
                 #   return True
                print(msg)
                return msg
            except:
                say('ช่วยพูดอีกครั้งได้ไหมครับ')

def takeAction(commandDict, key):
    commandDict[key]()

def checkIntent():
    pass
