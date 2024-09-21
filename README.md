# FlavorBook

## Project Description
This Recipe Sharing Platform allows users to create, view, and share their favorite recipes. Users can sign up, log in, and manage their personal recipe collections, as well as explore recipes shared by other users. It also includes features like image uploads, pagination, search functionality, and account management.

The platform is ideal for home chefs who want to keep their recipes organized, share their culinary creations, and explore new dishes.

## Features
- User Authentication (Sign up, Log in, Log out)
- Create, view, edit & update, and delete recipes
- Upload images for recipes
- Search recipes by title, ingredients, and tags
- Pagination for large lists of recipes
- Account management (delete account with confirmation)
- View personal recipe collection via "My Recipes"

## Technologies Used
- **Python (Flask):** Backend framework
- **Jinja2:** Templating engine for rendering HTML
- **SQLAlchemy:** ORM for database interactions
- **SQLite:** Database
- **Flask-WTF:** For forms and CSRF protection
- **Flask-Login:** User authentication
- **Flask-Bcrypt:** Password hashing
- **Pillow (Python Imaging Library):** A library for opening, manipulating, and saving many different image file formats
- **HTML, CSS:** For the frontend user interface
- **JavaScript:** Frontend user interface and client-side validation
- **Bootstrap:** Frontend styling and components

## Installation and Setup
1. **Clone the Repository**
    ```bash
    git clone https://github.com/Seesko/flavor-book-app.git
    cd flavor-book-app
    ```

2. **Create a Virtual Environment and Install Dependencies**
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows use venv\Scripts\activate
    pip install -r requirements.txt
    ```

3. **Set Up the Database**
    - Create an `.env` file in the project root with the following variables:
      ```
      SECRET_KEY=your_secret_key
      SQLALCHEMY_DATABASE_URI=sqlite:///site.db
      ```
    - Initialize the database:
      ```bash
      flask db init
      flask db migrate
      flask db upgrade
      ```

4. **Run the Application**
    ```bash
    flask run
    ```

5. **Access the App**
    Visit `http://localhost:5000` in your browser to access the application.

## Usage
1. **Sign Up and Log In**
   - Create a new account or log in with your existing credentials.

2. **Create a Recipe**
   - Once logged in, click the "Create Recipe" button in the navigation bar to create a new recipe. Fill out the title, description, ingredients, tags, and optionally upload an image.

3. **My Recipes**
   - Visit "My Recipes" from the user menu to view, edit, or delete any of your previously created recipes.

4. **Search Recipes**
   - Use the search bar to find recipes by keywords in titles, ingredients, or tags.

5. **Account Management**
   - From the settings menu, you can manage your account or delete it entirely.

## Database Schema

The project uses SQLAlchemy ORM for database management. Here’s an overview of the main database tables and their relationships:

### Users Table
| Column    | Type          | Description                |
|-----------|---------------|----------------------------|
| id        | Integer (PK)   | Unique user identifier     |
| username  | String         | Username of the user       |
| email     | String         | Email address (unique)     |
| password  | String         | Hashed password            |

### Recipes Table
| Column      | Type          | Description                        |
|-------------|---------------|------------------------------------|
| id          | Integer (PK)   | Unique recipe identifier           |
| title       | String         | Title of the recipe                |
| description | String         | Brief description of the recipe    |
| ingredients | Text           | List of ingredients                |
| instructions| Text           | Preparation instructions           |
| image_file  | String         | Filename of uploaded image         |
| user_id     | Integer (FK)   | ID of the user who created recipe  |
| timestamp   | DateTime       | Creation timestamp                 |

### Likes Table (for Recipe Likes)
| Column    | Type          | Description                        |
|-----------|---------------|------------------------------------|
| id        | Integer (PK)   | Unique like identifier             |
| user_id   | Integer (FK)   | ID of the user who liked the recipe|
| recipe_id | Integer (FK)   | ID of the recipe being liked       |

### Relationships
- A **User** can create multiple **Recipes**.
- A **Recipe** can receive multiple **Likes** from different **Users**.


## Screenshots



## API Endpoints
- **`POST /login`:** Logs in a user with an email and password.
- **`POST /delete_account`:** Deletes the current user's account after confirmation.
- **`GET /my_recipes`:** Returns a paginated list of the current user's recipes.

## Author
Siiko: [Connect with me on LinkedIn](https://www.linkedin.com/in/siiko/)

## License
For inquiries regarding licensing or use of this software, please contact this account.