# delete_user.py
import sqlite3

username = "thisumdev"  # <- change this

conn = sqlite3.connect("users.db")
cursor = conn.cursor()

cursor.execute("DELETE FROM users WHERE username = ?", (username,))
conn.commit()
conn.close()

print(f"✅ Deleted user: {username}")
