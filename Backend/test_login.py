import urllib.request
import json
import urllib.error

data = json.dumps({'email': 'admin@biu.edu.ng', 'password': 'admin123'}).encode('utf-8')
req = urllib.request.Request('http://localhost:5000/api/auth/login', data=data, headers={'Content-Type': 'application/json'})

try:
    response = urllib.request.urlopen(req)
    print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"Error {e.code}:", e.read().decode('utf-8'))
except Exception as e:
    print("Exception:", str(e))
