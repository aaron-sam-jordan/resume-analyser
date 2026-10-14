from db.database import fetch_one, fetch_all, execute, insert


def get_all():
    return fetch_all("SELECT id, name, category FROM skills ORDER BY category, name")


def get_by_name(name):
    return fetch_one("SELECT id, name, category FROM skills WHERE name = ?", (name,))


def add_skill(name, category):
    sql = "INSERT INTO skills (name, category) OUTPUT INSERTED.id VALUES (?, ?)"
    return insert(sql, (name, category))


def remove_skill(skill_id):
    return execute("DELETE FROM skills WHERE id = ?", (skill_id,))