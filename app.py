from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os

import requests
import uuid

def generate_unique_user_id():
    # Generate a unique user ID using UUID
    return str(uuid.uuid4())

auth_key = os.getenv("AUTH_KEY")
url = os.getenv("CHATBOT_URL")
app = Flask(__name__)
cors = CORS(app, resources={r"/predict": {"origins": "*"}}, supports_credentials=True)
print(auth_key)
conversation_history = {}

@app.get("/")
def index_get():
    return render_template("base.html")


@app.post("/predict")
def predict():
    global conversation_history

    if id(request) not in conversation_history:
        conversation_history[id(request)] = {"request":None, "history": []}

    data = conversation_history[id(request)]
    text = request.get_json().get("message")
    data["request"] = text
    selected_role = request.get_json().get("role")
    data["userRole"] = selected_role

    response_content = ""

    with requests.post(url + "bot-response", json=data,
                       headers={"accept": "*/*",
                                "Content-Type": "application/json",
                                "Authorization": auth_key},
                       stream=True,
                       verify=False) as r:
        for chunk in r.iter_content(chunk_size=None):
            chunk = chunk.decode()
            response_content += chunk  #concatena il chunk
            #print(chunk)
            #print(chunk, end="")
    message = {"answer": response_content}
    #message = {"answer": chunk}


    data["history"].append({"role": "Human", "content": text})
    data["history"].append({"role": "AI", "content": response_content})
    print(data)

    return jsonify(message)


