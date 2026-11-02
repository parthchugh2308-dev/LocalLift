"""
LocalLift Stage 10 - Multi-Vendor Checkout Schema Migration
Adds idempotency_key column + unique index to Order_Groups table.
Safe to run multiple times (idempotent).
"""
import os, sqlite3

db_path = os.environ.get('DATABASE_PATH', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'LocalLift_DB.sqlite'))
print(f"Running Stage 10 migration on: {db_path}")

conn = sqlite3.connect(db_path, timeout=20.0)
conn.execute("PRAGMA foreign_keys = ON")
cur = conn.cursor()

# Check if column already exists
existing_cols = [row[1] for row in conn.execute("PRAGMA table_info(Order_Groups)").fetchall()]
if 'idempotency_key' not in existing_cols:
    cur.execute("ALTER TABLE Order_Groups ADD COLUMN idempotency_key TEXT")
    print("Added column 'idempotency_key' to 'Order_Groups'.")
else:
    print("Column 'idempotency_key' already exists in 'Order_Groups'. Skipping.")

# Create unique index separately (SQLite supports this)
existing_indexes = [row[1] for row in conn.execute("PRAGMA index_list(Order_Groups)").fetchall()]
if 'idx_order_groups_idempotency' not in existing_indexes:
    try:
        cur.execute("CREATE UNIQUE INDEX idx_order_groups_idempotency ON Order_Groups(idempotency_key) WHERE idempotency_key IS NOT NULL")
        print("Created unique index on Order_Groups.idempotency_key.")
    except sqlite3.OperationalError as e:
        print(f"Index creation note: {e}")
else:
    print("Unique index on idempotency_key already exists. Skipping.")

result = conn.execute("PRAGMA integrity_check").fetchone()[0]
conn.commit()
conn.close()
print(f"Stage 10 migration complete. Integrity check: {result}")
