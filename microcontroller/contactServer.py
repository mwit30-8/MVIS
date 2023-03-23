import requests

def askFor(ploads, address):
    r = requests.post(address,data = ploads)
    print(r.text)
    return r.text
    
def receiveData(ploads, address):
    r = requests.get(address,params = ploads)
    print(r.text)
    print(r.url)
    return r.text