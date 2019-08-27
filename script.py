from flask import *
from flask_socketio import SocketIO, emit, join_room, leave_room, send
from flask_session import Session
import uuid
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

SESSION_TYPE = 'filesystem'
app.config.from_object(__name__)
Session(app)

users = {}


@app.route("/")
def slash():
    token = session.get("token", False)
    newtoken = token

    if not token:
        newtoken = str(uuid.uuid4())
        session["token"] = newtoken
        users[newtoken] = {"x": 0, "y": 0, "holding": False}

    return render_template("index.html", data=json.dumps(users), you=newtoken)


@socketio.on("location")
def msg(obj):
    token = session.get("token", False)
    if token:
        if users.get(token, False):
            users[token]["x"] = obj["x"]
            users[token]["y"] = obj["y"]
        else:
            users[token] = {"x": obj["x"], "y": obj["y"]}

        emit(
            "usermove", {
                'token': token,
                'x': obj["x"],
                'y': obj["y"]
            },
            room="main",
            json=True)
    else:
        pass


@socketio.on('connect')
def connect():
    token = session.get("token", False)

    if token:
        join_room("main")


if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0")
