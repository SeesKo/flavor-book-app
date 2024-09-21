"""
Database models for user, recipe, comment, and like management.
"""
from datetime import datetime
from . import db, bcrypt
from flask_login import UserMixin


class User(db.Model, UserMixin):
    """
    User model for application users.
    """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    recipes = db.relationship('Recipe', backref='author', lazy=True)
    likes = db.relationship('Like', backref='user', lazy=True)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"

    def set_password(self, password):
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)


class Recipe(db.Model):
    """
    Recipe model representing a recipe created by a user.
    """
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    ingredients = db.Column(db.Text, nullable=False)
    preparation = db.Column(db.Text, nullable=False)
    tags = db.Column(db.String(200), nullable=True)
    image_file = db.Column(db.String(120), nullable=False, default='default.jpg')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comments = db.relationship(
        'Comment', backref='recipe',
        lazy=True, cascade="all, delete-orphan"
    )
    likes = db.relationship(
        'Like', backref='recipe',
        lazy=True, cascade='all, delete-orphan'
    )
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"Recipe('{self.title}', '{self.user_id}')"


class Comment(db.Model):
    """
    Comment model representing user comments on recipes.
    """
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='comments')

    def __repr__(self):
        return f"Comment('{self.text}', '{self.user.username}')"


class Like(db.Model):
    """
    Like model representing user likes on recipes.
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)

    def __repr__(self):
        return f"Like('{self.user_id}', '{self.recipe_id}')"