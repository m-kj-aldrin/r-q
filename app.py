from flask import Flask, render_template, jsonify, request
import uuid
from random import randint

# Initialize Flask app
app = Flask(__name__)


# Route to serve the index page
@app.route("/")
def index():
    return render_template("index.jinja", random=randint(0, 1024))


# Users data
users = [
    {"id": uuid.uuid4(), "name": "Alice"},
    {"id": uuid.uuid4(), "name": "Bob"},
    {"id": uuid.uuid4(), "name": "Charlie"},
]


@app.get("/random")
def random_number():
    return str(randint(0, 1024))


@app.route("/users/clear", methods=["DELETE"])
def clear_users():
    users.clear()
    return render_template("partials/users.jinja", users=users)


@app.route("/users/<uuid:user_id>", methods=["DELETE"])
def delete_user(user_id):

    user_to_delete = next((user for user in users if user["id"] == user_id), None)

    print("userid: ", user_id)

    if user_to_delete:
        users.remove(user_to_delete)  # Remove the user from the list
    return render_template("partials/users.jinja", users=users)


# Route to serve both HTML and JSON at /users
@app.route("/users", methods=["GET", "POST"])
def users_route():

    if request.method == "GET":
        if (
            request.accept_mimetypes["application/json"]
            >= request.accept_mimetypes["text/html"]
        ):
            return jsonify(users)  # Return JSON response
        else:
            return render_template(
                "partials/users.jinja", users=users
            )  # Return HTML response
    if request.method == "POST":
        form_data = request.form

        print("form")
        for key, value in form_data.items():
            print(f"{key}: {value}")

        new_user = {k: v for k, v in form_data.items()}
        new_user.setdefault("id", uuid.uuid4())

        users.append(new_user)

        if (
            request.accept_mimetypes["application/json"]
            >= request.accept_mimetypes["text/html"]
        ):
            return jsonify(users)  # Return JSON response
        else:
            return render_template(
                "partials/users.jinja", users=users, random=randint(0, 1024)
            )  # Return HTML response


# Run the app
if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=9090)
