from flask import Flask, request, Response
import os
import socket
from os import listdir
from os.path import isfile, join
import json

app = Flask(__name__)
HOST = "localhost"
PORT = 9999
mypath = './data/output'
UPLOAD_FOLDER = './data/input'

@app.route('/knn/<string:trajID>/<string:k>')
def getknn(trajID,k):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((HOST, PORT))
    query = 'get-knn '+ str(trajID) + ' ' + str(k) + '\n'
    sock.sendall(query.encode())
    data = sock.recv(1024)
    sock.close()
    return {"status":200}

@app.route('/spatial/<string:lat1>/<string:long1>/<string:lat2>/<string:long2>')
def getspatial(lat1,long1,lat2,long2):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((HOST, PORT))
    query = 'get-spatial-range '+ str(lat1) + ' ' + str(long1) + ' ' + str(lat2) + ' ' + str(long2) + '\n'
    sock.sendall(query.encode())
    data = sock.recv(1024)
    sock.close()

    print("Hello")
    
    resp = Response()
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/spatiotemporal/<string:start>/<string:end>/<string:lat1>/<string:long1>/<string:lat2>/<string:long2>')
def getspatiotemporal(start,end,lat1,long1,lat2,long2):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((HOST, PORT))
    query = 'get-spatiotemporal-range '+ str(start) + ' ' + str(end) + ' ' + str(lat1) + ' ' + str(long1) + ' ' + str(lat2) + ' ' + str(long2) + '\n'
    sock.sendall(query.encode())
    data = sock.recv(1024)
    sock.close()
    return {"status":200}

@app.route('/viewKnn')
def viewKnn():

    onlyfiles = [f for f in listdir(mypath+'/knn') if isfile(join(mypath+'/knn', f))]
    fullData = []
    for f in onlyfiles:
        if f[-5:]=='.json':

            with open(mypath+'/knn/'+f, 'r') as jf:
                for values in jf.readlines():
                    fullData.append(json.loads(values))

    return fullData

@app.route('/viewSpatial')
def viewSpatial():

    onlyfiles = [f for f in listdir(mypath+'/spatial') if isfile(join(mypath+'/spatial', f))]
    fullData = []
    for f in onlyfiles:
        if f[-5:]=='.json':

            with open(mypath+'/spatial/'+f, 'r') as jf:
                for values in jf.readlines():
                    fullData.append(json.loads(values))
    for data in fullData:
        data['timestamp'] = [x - data['timestamp'][0] for x in data['timestamp']]
        data['location'] = [[x[1],x[0]] for x in data['location']]

    resp = Response(fullData)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/viewSpatiotemporal')
def viewSpatiotemporal():

    onlyfiles = [f for f in listdir(mypath+'/spatiotemporal') if isfile(join(mypath+'/spatiotemporal', f))]
    fullData = []
    for f in onlyfiles:
        if f[-5:]=='.json':

            with open(mypath+'/spatiotemporal/'+f, 'r') as jf:
                for values in jf.readlines():
                    fullData.append(json.loads(values))
    for data in fullData:
        data['timestamp'] = [x - data['timestamp'][0] for x in data['timestamp']]
        data['location'] = [[x[1],x[0]] for x in data['location']]

    return fullData


@app.route('/upload', methods=['POST'])
def fileUpload():
    target=UPLOAD_FOLDER
    if not os.path.isdir(target):
        os.mkdir(target)
    file = request.files['file'] 
    filename = 'input.json'
    destination="/".join([target, filename])
    print(destination)
    file.save(destination)
    resp = Response()
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == "__main__":
    app.run(debug=True)