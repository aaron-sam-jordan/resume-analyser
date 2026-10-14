from db.database import fetch_one, fetch_all, execute, insert


def create_user(name, email, password_hash, role="user"):
    sql = ("INSERT INTO users (name, email, password_hash, role) "
           "OUTPUT INSERTED.id VALUES (?, ?, ?, ?)")
    return insert(sql, (name, email, password_hash, role))


def get_by_email(email):
    return fetch_one("SELECT * FROM users WHERE email = ?", (email,))


def get_by_id(user_id):
    return fetch_one("SELECT * FROM users WHERE id = ?", (user_id,))


def list_users():
    sql = """
        SELECT u.id, u.name, u.email, u.role, u.is_blocked, u.created_at,
               COUNT(a.id) AS analyses_count
        FROM users u
        LEFT JOIN analyses a ON a.user_id = u.id
        GROUP BY u.id, u.name, u.email, u.role, u.is_blocked, u.created_at
        ORDER BY u.created_at DESC
    """
    return fetch_all(sql)


def set_blocked(user_id, blocked):
    return execute("UPDATE users SET is_blocked = ? WHERE id = ?",
                   (1 if blocked else 0, user_id))


def delete_user(user_id):
    return execute("DELETE FROM users WHERE id = ?", (user_id,))


def count_users():
    row = fetch_one("SELECT COUNT(*) AS total FROM users")
    return row["total"]


def count_blocked():
    row = fetch_one("SELECT COUNT(*) AS total FROM users WHERE is_blocked = 1")
    return row["total"]