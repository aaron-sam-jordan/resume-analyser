from db.database import fetch_one, execute, insert


def create_reset(user_id, otp_hash, expires_at):
    execute("DELETE FROM password_resets WHERE user_id = ?", (user_id,))
    sql = ("INSERT INTO password_resets (user_id, otp_hash, expires_at) "
           "OUTPUT INSERTED.id VALUES (?, ?, ?)")
    return insert(sql, (user_id, otp_hash, expires_at))


def get_latest(user_id):
    return fetch_one(
        "SELECT TOP 1 * FROM password_resets WHERE user_id = ? ORDER BY id DESC", (user_id,))


def add_attempt(reset_id):
    return execute("UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?", (reset_id,))


def delete_for_user(user_id):
    return execute("DELETE FROM password_resets WHERE user_id = ?", (user_id,))