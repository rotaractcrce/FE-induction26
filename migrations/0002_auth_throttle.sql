-- Per-IP PIN brute-force throttle. One row per offending IP;
-- rows are deleted on success and harmless if stale.
CREATE TABLE IF NOT EXISTS auth_throttle (
  ip TEXT PRIMARY KEY,
  fails INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0
);
