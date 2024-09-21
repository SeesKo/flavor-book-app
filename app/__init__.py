from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_migrate import Migrate
from datetime import datetime
import os


db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = 'main.login'
migrate = Migrate()


def create_app():
    app = Flask(__name__)

    # Ensure 'instance' folder exists before setting SQLAlchemy URI
    os.makedirs(app.instance_path, exist_ok=True)
    print(f"Instance path: {app.instance_path}")

    # Explicitly set the database URI to the instance folder
    db_path = os.path.join(app.instance_path, 'site.db')
    app.config['SECRET_KEY'] = 'your_secret_key'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

    # Configurations for file uploads
    app.config['UPLOAD_FOLDER'] = os.path.join('app', 'static', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Enable debugging mode
    app.config['DEBUG'] = False

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    login_manager.init_app(app)

    from app.routes import bp
    app.register_blueprint(bp)

    from app.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))


    # Custom Jinja2 filter for "time ago"
    @app.template_filter('time_ago')
    def time_ago(date):
        now = datetime.utcnow()
        diff = now - date

        seconds = diff.total_seconds()
        if seconds < 60:
            return f"{int(seconds)} second{'s' if int(seconds) != 1 else ''} ago"
        elif seconds < 3600:
            minutes = int(seconds // 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif seconds < 86400:
            hours = int(seconds // 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        else:
            days = int(seconds // 86400)
            return f"{days} day{'s' if days != 1 else ''} ago"

    # Check if the database file exists, and create if not
    with app.app_context():
        if not os.path.exists(db_path):
            db.create_all()
            print("Database created and tables initialized.")
        else:
            print("Database already exists.")

    return app