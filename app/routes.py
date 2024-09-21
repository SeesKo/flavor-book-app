"""
Flask routes for user authentication and recipe management.
"""
from flask import Blueprint, render_template, jsonify, request, redirect, send_from_directory, current_app, url_for, flash
from flask_login import login_user, current_user, logout_user, login_required
from email_validator import validate_email, EmailNotValidError
from sqlalchemy import or_
from . import db, bcrypt
from .models import User, Recipe, Comment, Like
import os
import secrets
from PIL import Image


bp = Blueprint('main', __name__)


@bp.route("/", methods=['GET', 'POST'])
@bp.route("/login", methods=['GET', 'POST'])
def login():
    """
    Handle user login.
    """
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))

    if request.method == 'POST':
        if request.is_json:  # Check if the request is JSON
            data = request.get_json()  # Parse JSON data
            email = data.get('email')
            password = data.get('password')

            # Fetch user from database and validate
            user = User.query.filter_by(email=email).first()
            if user and bcrypt.check_password_hash(user.password, password):
                login_user(user)
                return jsonify({
                    'status': 'success',
                    'redirect': url_for('main.home')
                })

            return jsonify({
                'status': 'fail',
                'message': '- Invalid email or password'
            }), 401
        else:
            return jsonify({
                'status': 'fail',
                'message': 'Unsupported media type'
            }), 415

    return render_template('login.html')


@bp.route("/signup", methods=['POST'])
def signup():
    """
    Handle user registration.
    """
    name = request.form.get('name')
    email = request.form.get('email')
    password = request.form.get('password')
    confirm_password = request.form.get('confirmPassword')

    # Check for password match
    if password != confirm_password:
        flash('Passwords do not match', 'danger')
        return redirect(url_for('main.login'))

    # Check if email already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        flash('Email already in use', 'danger')
        return redirect(url_for('main.login'))

    # Create new user
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=name, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    flash('Your account has been created! You are now able to log in', 'success')
    return redirect(url_for('main.login'))


@bp.route("/check_email", methods=['POST'])
def check_email():
    """
    Check if the provided email already exists.
    """
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    return jsonify({'exists': user is not None})


@bp.route("/home", methods=["GET"])
@login_required
def home():
    """
    Render the home page with a paginated list of recipes.
    """
    # Get page number from the query parameter
    # default to 1 if not provided
    page = request.args.get('page', 1, type=int)

    # Fetch recipes with pagination, 6 recipes per page
    per_page = 6
    recipes = Recipe.query.order_by(Recipe.id.desc()).\
        paginate(page=page, per_page=per_page)

    return render_template('home.html', recipes=recipes, user=current_user)


@bp.route('/create', methods=['GET', 'POST'])
@login_required
def create_recipe():
    """
    Create a new recipe.
    """
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        ingredients = request.form.get('ingredients')
        preparation = request.form.get('prep')
        tags = request.form.get('tags')

        # Handle image upload
        image = request.files.get('image')

        # Use save_image function to ensure unique filename
        if image and image.filename != '':
            filename = save_image(image)
        else:
            filename = 'default.jpg'

        # Save the recipe to the database
        recipe = Recipe(
            title=title,
            description=description,
            ingredients=ingredients,
            preparation=preparation,
            tags=tags,
            image_file=filename,
            user_id=current_user.id
        )
        db.session.add(recipe)
        db.session.commit()
        flash('Recipe created successfully!', 'success')
        return redirect(url_for('main.recipe', recipe_id=recipe.id))

    return render_template('create.html')


@bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """
    Serve uploaded files from the upload directory.
    """
    return send_from_directory(
        current_app.config['UPLOAD_FOLDER'],
        filename
    )


@bp.route("/recipe/<int:recipe_id>")
@login_required
def recipe(recipe_id):
    """
    Retrieve and display a specific recipe.
    """
    recipe = Recipe.query.get_or_404(recipe_id)
    return render_template('recipe.html', recipe=recipe)


def save_image(image_file):
    """
    Save an uploaded image to the static uploads directory.
    """
    # Generate a random filename using secrets module
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(image_file.filename)
    image_filename = random_hex + f_ext
    image_path = os.path.join(
        current_app.root_path, 'static/uploads', image_filename
    )

    # Resize the image to a 6x4 aspect ratio (600px by 400px)
    output_size = (600, 400)
    i = Image.open(image_file)
    i.thumbnail(output_size)
    i.save(image_path)

    return image_filename


@bp.route('/recipe/edit/<int:recipe_id>', methods=['GET', 'POST'])
@login_required
def edit_recipe(recipe_id):
    """
    Edit an existing recipe.
    """
    recipe = Recipe.query.get_or_404(recipe_id)

    if recipe.author != current_user:
        flash('You do not have permission to edit this recipe.', 'danger')
        return redirect(url_for('main.home'))

    if request.method == 'POST':
        recipe.title = request.form['title']
        recipe.description = request.form['description']
        recipe.ingredients = request.form['ingredients']
        recipe.preparation = request.form['prep']
        recipe.tags = request.form['tags']

        # Check if an image is being uploaded
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file.filename != '':
                # Save the new image
                new_image_filename = save_image(image_file)

                # Remove the old image if it exists
                if recipe.image_file and os.path.exists(
                    os.path.join(
                        current_app.root_path, 'static/uploads', recipe.image_file
                    )
                ):
                    os.remove(
                        os.path.join(
                            current_app.root_path, 'static/uploads', recipe.image_file
                        )
                    )

                # Assign the new filename to the recipe
                recipe.image_file = new_image_filename

        # Commit changes to the database
        db.session.commit()
        flash('Recipe has been updated!', 'success')
        return redirect(url_for('main.recipe', recipe_id=recipe.id))

    return render_template('edit.html', recipe=recipe)


@bp.route('/recipe/<int:recipe_id>/delete', methods=['POST'])
@login_required
def delete_recipe(recipe_id):
    """
    Delete a specific recipe.
    """
    recipe = Recipe.query.get_or_404(recipe_id)

    # Ensure that only the creator can delete their recipe
    if recipe.user_id != current_user.id:
        flash('You are not authorized to delete this recipe.', 'danger')
        return redirect(url_for('main.recipe', recipe_id=recipe.id))

    # Remove the image file if it exists and is not the default image
    if recipe.image_file and recipe.image_file != 'default.jpg':
        image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], recipe.image_file)
        try:
            os.remove(image_path)
        except FileNotFoundError:
            # Optionally, handle the case where the file is not found
            flash('Image file not found, but recipe was deleted.', 'warning')

    # Delete the recipe from the database
    db.session.delete(recipe)
    db.session.commit()
    flash('Recipe deleted successfully!', 'success')
    return redirect(url_for('main.home'))


@bp.route('/recipe/<int:recipe_id>', methods=['GET', 'POST'])
@login_required
def interact_with_recipe(recipe_id):
    """
    Interact with a specific recipe.
    """
    recipe = Recipe.query.get_or_404(recipe_id)

    if request.method == 'POST':
        if not current_user.is_authenticated:
            return jsonify({'error': 'You need to log in to comment.'}), 401

        comment_text = request.form.get('comment')
        if comment_text:
            comment = Comment(text=comment_text, recipe_id=recipe.id, user_id=current_user.id)
            db.session.add(comment)
            db.session.commit()
            updated_comment_count = Comment.query.filter_by(recipe_id=recipe.id).count()
            return jsonify({
                'success': True,
                'comment': {
                    'id': comment.id,
                    'text': comment.text,
                    'user': {
                        'username': current_user.username
                    }
                },
                'comment_count': updated_comment_count
            })
        else:
            return jsonify({'error': 'Comment cannot be empty!'}), 400

    # If it's a GET request, render the page normally
    comments = Comment.query.filter_by(recipe_id=recipe.id).all()
    return render_template('recipe.html', recipe=recipe, comments=comments)


@bp.route('/recipe/<int:recipe_id>/like', methods=['POST'])
@login_required
def like_recipe(recipe_id):
    """
    Like or unlike a recipe.
    """
    recipe = Recipe.query.get_or_404(recipe_id)
    like = Like.query.filter_by(user_id=current_user.id, recipe_id=recipe_id).first()

    if like:  # If the like already exists, remove it (unlike)
        db.session.delete(like)
        db.session.commit()
    else:  # If the like does not exist, create it
        new_like = Like(user_id=current_user.id, recipe_id=recipe_id)
        db.session.add(new_like)
        db.session.commit()

    like_count = Like.query.filter_by(recipe_id=recipe_id).count()

    # Determine if the current user liked the recipe
    liked = bool(Like.query.filter_by(user_id=current_user.id, recipe_id=recipe_id).first())

    # Create like count text
    if liked:
        if like_count == 1:
            like_count_text = 'You liked this.'
        elif like_count == 2:
            like_count_text = 'You and 1 other liked this.'
        else:
            like_count_text = f'You and {like_count - 1} others liked this.'
    else:
        if like_count == 0:
            like_count_text = 'No ratings yet. Be the first to like.'
        elif like_count == 1:
            like_count_text = '1 person likes this.'
        elif like_count == 2:
            like_count_text = '2 people like this.'
        else:
            like_count_text = f'{like_count} people like this.'

    return jsonify({
        'liked': liked,
        'like_count_text': like_count_text,
        'like_count': like_count
    })


@bp.route('/comment/<int:comment_id>/delete', methods=['POST'])
@login_required
def delete_comment(comment_id):
    """
    Delete a specific comment.
    """
    comment = Comment.query.get_or_404(comment_id)

    if comment.user_id != current_user.id:
        return jsonify({'error': 'You are not authorized to delete this comment.'}), 403

    db.session.delete(comment)
    db.session.commit()

    # Get updated comment count after deletion
    updated_comment_count = Comment.query.filter_by(recipe_id=comment.recipe_id).count()

    return jsonify({
        'success': True,
        'comment_id': comment_id,
        'comment_count': updated_comment_count
    })


@bp.route('/my_recipes', methods=['GET'])
@login_required
def my_recipes():
    """
    Display the current user's recipes.
    """
    page = request.args.get('page', 1, type=int)
    per_page = 6  # Same pagination as search

    # Fetch the current user's recipes
    recipes = Recipe.query.filter_by(user_id=current_user.id).\
        order_by(Recipe.id.desc()).paginate(page=page, per_page=per_page)

    # Pass a flag to indicate if there are no results
    no_results = recipes.total == 0

    # Reuse the 'home.html' template to display the recipes
    return render_template('home.html', recipes=recipes, no_results=no_results, query='My Recipes')


def search_recipes(query):
    """
    Build a query to search recipes by ingredients, title, and tags.
    """
    search_terms = query.split()

    # Build search filters for ingredients, title, and tags
    ingredient_filters = [Recipe.ingredients.ilike(f"%{term}%") for term in search_terms]
    title_filters = [Recipe.title.ilike(f"%{term}%") for term in search_terms]
    tag_filters = [Recipe.tags.ilike(f"%{term}%") for term in search_terms]

    # Combine all filters
    filters = ingredient_filters + title_filters + tag_filters

    # Return the query so we can paginate it later
    return Recipe.query.filter(or_(*filters))


@bp.route('/search', methods=['GET'])
@login_required
def search():
    """
    Search for recipes based on a query.
    """
    query = request.args.get('query', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = 6

    if query:
        # Perform the search and paginate results
        recipes = search_recipes(query).order_by(Recipe.id.desc()).\
            paginate(page=page, per_page=per_page)
    else:
        # Redirect to the homepage if the search query is empty
        return redirect(url_for('main.home', page=page))

    # Pass a flag to indicate whether there are no results
    no_results = recipes.total == 0
    return render_template('home.html', recipes=recipes, query=query, no_results=no_results)


@bp.route('/settings')
@login_required
def settings():
    """
    Render the settings page for the user.
    """
    return render_template('settings.html')


@bp.route('/update_name', methods=['POST'])
@login_required
def update_name():
    """
    Update the current user's username.
    """
    new_name = request.form.get('name')
    max_length = 20

    if new_name and len(new_name) <= max_length:
        current_user.username = new_name
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Name updated successfully!'})
    else:
        return jsonify({'status': 'error', 'message': 'Name cannot be empty.'})


@bp.route('/update_email', methods=['POST'])
@login_required
def update_email():
    """
    Update the current user's email address.
    """
    new_email = request.form.get('email')

    if not new_email:
        return jsonify({'status': 'error', 'message': 'Email address cannot be empty.'})

    try:
        # Validate the email address format
        v = validate_email(new_email)
        normalized_email = v['email']

        # Check if the email is already in use by another user
        if User.query.filter_by(email=normalized_email).first():
            return jsonify({'status': 'error', 'message': 'Email address is already in use.'})

        # Update the user's email address
        current_user.email = normalized_email
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Email address updated successfully!'})

    except EmailNotValidError as e:
        # Handle invalid email error
        return jsonify({'status': 'error', 'message': str(e)})

    except Exception as e:
        # Handle unexpected errors
        return jsonify({'status': 'error', 'message': 'An unexpected error occurred.'})


@bp.route('/update_password', methods=['POST'])
@login_required
def update_password():
    """
    Update the current user's password.
    """
    current_password = request.form.get('currentPassword')
    new_password = request.form.get('newPassword')
    confirm_password = request.form.get('confirmPassword')

    # Check if the new password is at least 8 characters long
    if len(new_password) < 8:
        return jsonify({
            'status': 'error',
            'message': 'New password must be at least 8 characters long.'
        })

    # Check if the current password is correct
    if not current_user.check_password(current_password):
        return jsonify({'status': 'error', 'message': 'Current password is incorrect.'})

    # Check if the new passwords match
    if new_password != confirm_password:
        return jsonify({'status': 'error', 'message': 'New passwords do not match.'})

    # Set the new password
    current_user.set_password(new_password)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Password updated successfully!'})


@bp.route('/delete_account', methods=['POST'])
@login_required
def delete_account():
    """
    Delete the current user's account along with associated data.
    """
    if current_user.is_authenticated:
        try:
            user = User.query.get(current_user.id)
            if user:
                # Remove associated recipes and their images
                recipes = Recipe.query.filter_by(user_id=user.id).all()
                for recipe in recipes:
                    # Remove the associated image file if not default
                    if recipe.image_file != 'default.jpg':
                        image_path = os.path.join(
                            current_app.config['UPLOAD_FOLDER'],
                            recipe.image_file
                        )
                        if os.path.isfile(image_path):
                            os.remove(image_path)

                    # Delete the recipe
                    db.session.delete(recipe)

                # Remove associated comments and likes
                Comment.query.filter_by(user_id=user.id).delete()
                Like.query.filter_by(user_id=user.id).delete()

                # Delete the user
                db.session.delete(user)
                db.session.commit()

                # Log the user out
                logout_user()

                # Redirect to login after successful deletion
                return redirect(url_for('main.login'))

        except Exception as e:
            # Handle unexpected errors
            db.session.rollback()
            flash('An error occurred while deleting your account. Please try again.', 'danger')
            return redirect(url_for('main.settings'))

    return redirect(url_for('main.login'))


@bp.route("/logout", methods=['POST'])
@login_required
def logout():
    """
    Log the current user out and redirect to the login page.
    """
    logout_user()
    return redirect(url_for('main.login'))