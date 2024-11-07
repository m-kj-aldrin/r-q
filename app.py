from flask import Flask, request, render_template, redirect, url_for, abort
from peewee import SqliteDatabase, Model, IntegerField, CharField, IntegrityError
from peewee import DoesNotExist
import os
from random import randint

app = Flask(__name__)

# Configure the SQLite database using Peewee
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "reminders.db")
db = SqliteDatabase(db_path)


# Define a BaseModel to specify the database
class BaseModel(Model):
    class Meta:
        database = db


# Define the Reminder model using Peewee
class Reminder(BaseModel):
    mmid = IntegerField(primary_key=True, unique=True, null=True)
    description = CharField(max_length=200)

    def __repr__(self):
        return f"<Reminder {self.mmid}: {self.description}>"


# Initialize the database
def init_db():
    db.connect()
    db.create_tables([Reminder], safe=True)
    # Uncomment below lines to add sample data on first run
    if Reminder.select().count() == 0:
        for _ in range(8):
            try:
                Reminder.create(mmid=randint(0, 2048), description="Sample reminder")
            except IntegrityError:
                pass  # Skip duplicates
    db.close()


init_db()  # Initialize the database when the application starts


# Ensure the database connection is closed after each request
@app.teardown_appcontext
def close_db(error):
    if not db.is_closed():
        db.close()


# Route: Home Page
@app.route("/")
def index():
    reminders = Reminder.select().order_by(Reminder.mmid.asc())
    return render_template("index.jinja", reminders=reminders)


# Route: Get all reminders and create a new reminder
@app.route("/reminders/", methods=["GET", "POST"])
def manage_reminders():
    if request.method == "GET":
        # Get all reminders ordered by mmid ascending
        reminders = Reminder.select().order_by(Reminder.mmid.asc())
        return render_template("reminders.jinja", reminders=reminders)

    elif request.method == "POST":
        # Create a new reminder
        mmid = request.form.get("mmid")
        description = request.form.get("description")

        if not description:
            return "Description is required.", 400

        if mmid:
            try:
                mmid = int(mmid)
            except ValueError:
                return "mmid must be an integer.", 400

            # Check for uniqueness
            if Reminder.select().where(Reminder.mmid == mmid).exists():
                return f"Reminder with mmid {mmid} already exists.", 400
        else:
            mmid = None  # Let SQLite auto-assign if mmid is None

        try:
            new_reminder = Reminder.create(mmid=mmid, description=description)
        except IntegrityError:
            return f"Failed to create reminder with mmid {mmid}.", 400

        # Retrieve all reminders after insertion
        reminders = Reminder.select().order_by(Reminder.mmid.asc())
        return render_template("reminders.jinja", reminders=reminders)


# Route: Get, Update, or Delete a single reminder
@app.route("/reminders/<int:mmid>", methods=["GET", "PUT", "DELETE"])
def handle_reminder(mmid):
    try:
        reminder = Reminder.get(Reminder.mmid == mmid)
    except DoesNotExist:
        abort(404, description=f"No reminder found with mmid {mmid}.")

    if request.method == "GET":
        # Optionally, you can render a detailed view
        # For consistency, rendering the reminders list
        reminders = Reminder.select().order_by(Reminder.mmid.asc())
        return render_template("reminders.jinja", reminders=reminders)

    elif request.method == "PUT":
        # Update a reminder
        description = request.form.get("description")
        if not description:
            return "Description is required.", 400

        reminder.description = description
        reminder.save()

    elif request.method == "DELETE":
        # Delete a reminder
        reminder.delete_instance()

    # After update or delete, retrieve all reminders
    reminders = Reminder.select().order_by(Reminder.mmid.asc())
    return render_template("reminders.jinja", reminders=reminders)


# Optional: Error handlers for better error messages
# @app.errorhandler(404)
# def not_found(error):
#     return render_template("404.html", message=error.description), 404


# @app.errorhandler(400)
# def bad_request(error):
#     return render_template("400.html", message=error.description), 400


if __name__ == "__main__":
    app.run(debug=True)
