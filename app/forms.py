"""
Forms used in the application for user registration,
login, and recipe submission.
"""
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, Email, EqualTo


class RegistrationForm(FlaskForm):
    """
    Form for user registration.
    """
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    confirm_password = PasswordField(
        'Confirm Password',
        validators=[
            DataRequired(),
            EqualTo('password', message='Passwords must match')
        ]
    )
    submit = SubmitField('Sign Up')


class LoginForm(FlaskForm):
    """
    Form for user login.
    """
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Log In')


class RecipeForm(FlaskForm):
    """
    Form for submitting a new recipe.
    """
    title = StringField('Title', validators=[DataRequired()])
    content = StringField('Content', validators=[DataRequired()])
    submit = SubmitField('Post')