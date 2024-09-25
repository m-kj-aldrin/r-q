from flask import Flask, render_template, jsonify, request

# Initialize Flask app
app = Flask(__name__)


# Route to serve the index page
@app.route("/")
def index():
    return render_template("index.jinja")


# Users data
users = [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"},
    {"id": 3, "name": "Charlie"},
]


# Route to serve both HTML and JSON at /users
@app.route("/users")
def users_route():
    # Check the 'Accept' header to determine response type
    print("mimetype: ", request.accept_mimetypes)

    if (
        request.accept_mimetypes["application/json"]
        >= request.accept_mimetypes["text/html"]
    ):
        return jsonify(users)  # Return JSON response
    else:
        return render_template(
            "partials/users.jinja", users=users
        )  # Return HTML response


# Run the app
if __name__ == "__main__":
    app.run(debug=True)
