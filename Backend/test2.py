import urllib.request, json, urllib.error
req = urllib.request.Request('http://localhost:5000/api/auth/login', data=json.dumps({'email': 'admin@biu.edu.ng', 'password': 'admin123'}).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
  resp = urllib.request.urlopen(req)
  print(resp.read())
except urllib.error.HTTPError as e:
  print(f'code: {e.code}, body: {e.read()}')
