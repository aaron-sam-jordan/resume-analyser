import getpass
from werkzeug.security import generate_password_hash
from models import user_model


def main():
    name = input("Admin name: ").strip() or "Admin"
    email = input("Admin email: ").strip().lower()
    password = getpass.getpass("Admin password (min 8 characters): ")

    if not email or len(password) < 8:
        print("Email is required and the password needs at least 8 characters.")
        return

    existing = user_model.get_by_email(email)
    if existing:
        print("This email already exists with role:", existing["role"])
        return

    user_model.create_user(name, email, generate_password_hash(password), role="admin")
    print("Admin created:", email)


if __name__ == "__main__":
    main()