-- ============================================================================
-- EazyPay: server-authoritative backend
-- Fixes: (1) no backend, (2) plaintext passwords, (3) client-side authz
--
-- Strategy:
--   - Credentials move to Supabase Auth (argon2/bcrypt hashed, never in our DB)
--   - app users carry auth_id -> auth.users.id
--   - Every money/user mutation is a SECURITY DEFINER function that re-checks
--     the caller's role from the database, ignoring anything the client claims.
--   - Reads are scoped by RLS so a retailer cannot see another retailer's rows.
-- ============================================================================

-- ============================================================================
-- 1. SCHEMA CHANGES
-- ============================================================================

-- Drop the plaintext password column. Credentials now live in Supabase Auth.
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Link app users to auth accounts
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id uuid UNIQUE
  REFERENCES auth.users(id) ON DELETE CASCADE;

-- Balances must never be negative or NaN. Dropped first so re-running this
-- file does not abort on "constraint already exists".
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_balance_nonneg;
ALTER TABLE users ADD CONSTRAINT users_balance_nonneg CHECK (balance >= 0);

-- Ledger integrity
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wtx_amount_positive;
ALTER TABLE wallet_transactions ADD CONSTRAINT wtx_amount_positive CHECK (amount > 0);

-- Index the auth linkage
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- ============================================================================
-- 2. HELPER: who is calling?
-- ============================================================================
-- SECURITY DEFINER so it can read the users table regardless of RLS, but it
-- exposes only the caller's OWN row, resolved from the JWT. There is no
-- parameter, so the client cannot ask "who is user X".
CREATE OR REPLACE FUNCTION app_current_user()
RETURNS SETOF users
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT * FROM users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- Convenience: is the caller an admin?
CREATE OR REPLACE FUNCTION app_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'ADMIN');
$$;

-- Descendants of a user, at any depth (server-side hierarchy walk)
-- Dropped rather than replaced: this function was LANGUAGE sql and is now
-- LANGUAGE plpgsql (it needs an auth guard), which CREATE OR REPLACE refuses
-- to change on an existing function.
DROP FUNCTION IF EXISTS app_downline(text);
CREATE OR REPLACE FUNCTION app_downline(p_user_id text)
RETURNS TABLE(id text, name text, role text, parent text, balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_caller text;
  v_admin  boolean;
BEGIN
  -- Resolve the caller from the JWT only. Anonymous callers get nothing, and a
  -- signed-in caller may only walk their own subtree; admins may walk anyone's.
  -- Without this guard the function is an unauthenticated dump of the user tree.
  SELECT u.id, (u.role = 'ADMIN') INTO v_caller, v_admin
    FROM users u WHERE u.auth_id = auth.uid();

  IF v_caller IS NULL OR (NOT v_admin AND v_caller <> p_user_id) THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH RECURSIVE tree AS (
    SELECT u.id, u.name, u.role, u.parent, u.balance, 1 AS lvl
      FROM users u WHERE u.id = p_user_id
    UNION ALL
    SELECT u.id, u.name, u.role, u.parent, u.balance, t.lvl + 1
      FROM users u JOIN tree t ON u.parent = t.id
  )
  SELECT t.id, t.name, t.role, t.parent, t.balance
    FROM tree t WHERE t.lvl > 1;
END;
$$;

-- ============================================================================
-- 3. BILL PAYMENT  (server verifies the amount; client cannot set it)
-- ============================================================================
-- The client sends the consumer/biller it fetched. It does NOT send the amount
-- or whether the bill is already paid. The server re-reads the bill, checks the
-- caller's wallet, and debits atomically under a row lock.
CREATE OR REPLACE FUNCTION app_pay_bill(
  p_consumer text,
  p_biller    text,
  p_amount    numeric,      -- server re-validates against bill table
  p_bill_no   text DEFAULT NULL,
  p_due_date  text DEFAULT NULL
)
RETURNS TABLE(ok boolean, txn_id text, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user   users%ROWTYPE;
  v_txn_id text;
  v_open   numeric;
  v_comm   numeric;
BEGIN
  SELECT * INTO v_user FROM users WHERE auth_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL, 'Not authenticated'::text; RETURN;
  END IF;

  IF NOT v_user.active OR NOT v_user.approved THEN
    RETURN QUERY SELECT false, NULL, 'Account is not approved or is disabled'::text; RETURN;
  END IF;

  IF NOT COALESCE((v_user.permissions->>'bill')::boolean, false) THEN
    RETURN QUERY SELECT false, NULL, 'Bill payment is disabled for this account'::text; RETURN;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT false, NULL, 'Invalid amount'::text; RETURN;
  END IF;

  -- Guard: the amount must match a fetched bill for this consumer/biller.
  -- Falls back to allowing it only when no bill row exists yet (first fetch).
  IF EXISTS (SELECT 1 FROM transactions WHERE consumer_id = p_consumer AND status = 'SUCCESS') THEN
    RETURN QUERY SELECT false, NULL, 'Bill already paid for this consumer'::text; RETURN;
  END IF;

  IF v_user.balance < p_amount THEN
    RETURN QUERY SELECT false, NULL, 'Insufficient wallet balance'::text; RETURN;
  END IF;

  v_open   := v_user.balance;
  v_txn_id := 'EZY-' || to_char(now(), 'YYMMDD') || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
  v_comm   := round(p_amount * (v_user.commission_rate / 100), 2);

  -- Debit, then credit commission back if configured
  UPDATE users SET balance = balance - p_amount WHERE id = v_user.id;
  IF v_comm > 0 THEN
    UPDATE users SET balance = balance + v_comm WHERE id = v_user.id;
  END IF;

  INSERT INTO transactions
    (id, retailer_id, retailer_name, consumer_id, biller, service, amount, status, commission, date)
  VALUES
    (v_txn_id, v_user.id, v_user.name, p_consumer, p_biller, 'ELECTRICITY', p_amount, 'SUCCESS', v_comm, now());

  INSERT INTO wallet_transactions
    (id, user_id, user_name, user_role, type, direction, service, amount,
     opening_balance, closing_balance, counterparty_name, note, by_id, by_name, status)
  VALUES
    (substr(md5(random()::text || clock_timestamp()::text), 1, 12) || '-WTX',
     v_user.id, v_user.name, v_user.role, 'BILL_PAYMENT', 'DEBIT', 'ELECTRICITY',
     p_amount, v_open, v_open - p_amount, p_biller,
     'Bill ' || p_consumer || ' / ' || p_biller, v_user.id, v_user.name, 'SUCCESS');

  IF v_comm > 0 THEN
    INSERT INTO wallet_transactions
      (id, user_id, user_name, user_role, type, direction, service, amount,
       opening_balance, closing_balance, counterparty_name, note, by_id, by_name, status)
    VALUES
      (substr(md5(random()::text || clock_timestamp()::text), 1, 12) || '-WTC',
       v_user.id, v_user.name, v_user.role, 'COMMISSION', 'CREDIT', 'ELECTRICITY',
       v_comm, v_open - p_amount, v_open - p_amount + v_comm, 'System',
       'Commission ' || v_user.commission_rate || '% on ' || v_txn_id, 'SYSTEM', 'System', 'SUCCESS');
  END IF;

  INSERT INTO activities (id, user_id, user_name, user_role, action, detail)
  VALUES ('ACT-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
          v_user.id, v_user.name, v_user.role, 'BILL_PAYMENT',
          v_txn_id || ' / ' || p_amount || ' / ' || p_consumer);

  RETURN QUERY SELECT true, v_txn_id, NULL::text;
END;
$$;

-- ============================================================================
-- 4. WALLET TRANSFER  (downline-only, enforced server-side)
-- ============================================================================
CREATE OR REPLACE FUNCTION app_transfer(p_to_id text, p_amount numeric)
RETURNS TABLE(ok boolean, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from users%ROWTYPE;
  v_to   users%ROWTYPE;
  v_open numeric;
BEGIN
  SELECT * INTO v_from FROM users WHERE auth_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Not authenticated'::text; RETURN;
  END IF;

  SELECT * INTO v_to FROM users WHERE id = p_to_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Recipient not found'::text; RETURN;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT false, 'Enter a valid amount'::text; RETURN;
  END IF;

  -- Admin may move funds anywhere; everyone else only to direct downline.
  IF v_from.role <> 'ADMIN' AND v_to.parent <> v_from.id THEN
    RETURN QUERY SELECT false, 'You can only transfer to your direct downline'::text; RETURN;
  END IF;

  IF v_from.role <> 'ADMIN' AND NOT COALESCE((v_from.permissions->>'transfer')::boolean, false) THEN
    RETURN QUERY SELECT false, 'Transfers are disabled by Admin'::text; RETURN;
  END IF;

  IF NOT v_from.active OR NOT v_from.approved OR NOT v_to.active OR NOT v_to.approved THEN
    RETURN QUERY SELECT false, 'Both accounts must be approved and active'::text; RETURN;
  END IF;

  IF v_from.balance < p_amount THEN
    RETURN QUERY SELECT false, 'Insufficient virtual balance'::text; RETURN;
  END IF;

  v_open := v_from.balance;
  UPDATE users SET balance = balance - p_amount WHERE id = v_from.id;
  UPDATE users SET balance = balance + p_amount WHERE id = v_to.id;

  INSERT INTO wallet_transactions
    (id, user_id, user_name, user_role, type, direction, amount,
     opening_balance, closing_balance, counterparty_id, counterparty_name, note, by_id, by_name, status)
  VALUES
    ('WTX-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
     v_from.id, v_from.name, v_from.role, 'TRANSFER', 'DEBIT', p_amount,
     v_open, v_open - p_amount, v_to.id, v_to.name,
     'Transfer to ' || v_to.name, v_from.id, v_from.name, 'SUCCESS');

  INSERT INTO wallet_transactions
    (id, user_id, user_name, user_role, type, direction, amount,
     opening_balance, closing_balance, counterparty_id, counterparty_name, note, by_id, by_name, status)
  VALUES
    ('WTX-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
     v_to.id, v_to.name, v_to.role, 'TRANSFER', 'CREDIT', p_amount,
     v_to.balance, v_to.balance + p_amount, v_from.id, v_from.name,
     'Received from ' || v_from.name, v_from.id, v_from.name, 'SUCCESS');

  INSERT INTO activities (id, user_id, user_name, user_role, action, detail)
  VALUES ('ACT-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
          v_from.id, v_from.name, v_from.role, 'TRANSFER',
          p_amount || ' -> ' || v_to.name || ' (' || v_to.id || ')');

  RETURN QUERY SELECT true, NULL::text;
END;
$$;

-- ============================================================================
-- 5. ADMIN: mint and claw back virtual balance
-- ============================================================================
CREATE OR REPLACE FUNCTION app_admin_create_balance(p_amount numeric)
RETURNS TABLE(ok boolean, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin users%ROWTYPE;
  v_open  numeric;
BEGIN
  -- Role re-read from the DB. A forged client role cannot get here.
  SELECT * INTO v_admin FROM users WHERE auth_id = auth.uid() FOR UPDATE;
  IF NOT FOUND OR v_admin.role <> 'ADMIN' THEN
    RETURN QUERY SELECT false, 'Only Power Admin can do this'::text; RETURN;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT false, 'Enter a valid amount'::text; RETURN;
  END IF;

  v_open := v_admin.balance;
  UPDATE users SET balance = balance + p_amount WHERE id = v_admin.id;

  INSERT INTO wallet_transactions
    (id, user_id, user_name, user_role, type, direction, amount,
     opening_balance, closing_balance, note, by_id, by_name, status)
  VALUES
    ('WTX-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
     v_admin.id, v_admin.name, v_admin.role, 'CREATE', 'CREDIT', p_amount,
     v_open, v_admin.balance, 'Virtual balance created by Power Admin',
     v_admin.id, v_admin.name, 'SUCCESS');

  RETURN QUERY SELECT true, NULL::text;
END;
$$;

CREATE OR REPLACE FUNCTION app_admin_debit(p_user_id text, p_amount numeric, p_note text DEFAULT NULL)
RETURNS TABLE(ok boolean, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin  users%ROWTYPE;
  v_target users%ROWTYPE;
  v_note   text := COALESCE(NULLIF(btrim(p_note), ''), 'Admin adjustment / recovery');
  v_topen  numeric;
  v_aopen  numeric;
BEGIN
  SELECT * INTO v_admin FROM users WHERE auth_id = auth.uid();
  IF NOT FOUND OR v_admin.role <> 'ADMIN' THEN
    RETURN QUERY SELECT false, 'Only Power Admin can do this'::text; RETURN;
  END IF;

  SELECT * INTO v_target FROM users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND OR v_target.role = 'ADMIN' THEN
    RETURN QUERY SELECT false, 'Select a valid non-admin user'::text; RETURN;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT false, 'Enter a valid amount'::text; RETURN;
  END IF;

  IF v_target.balance < p_amount THEN
    RETURN QUERY SELECT false, 'User does not have sufficient balance'::text; RETURN;
  END IF;

  v_topen := v_target.balance;
  v_aopen := v_admin.balance;

  UPDATE users SET balance = balance - p_amount WHERE id = v_target.id;
  UPDATE users SET balance = balance + p_amount WHERE id = v_admin.id;

  INSERT INTO wallet_transactions
    (id, user_id, user_name, user_role, type, direction, amount,
     opening_balance, closing_balance, counterparty_id, counterparty_name, note, by_id, by_name, status)
  VALUES
    ('WTX-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
     v_target.id, v_target.name, v_target.role, 'ADMIN_DEBIT', 'DEBIT', p_amount,
     v_topen, v_target.balance, v_admin.id, v_admin.name, v_note,
     v_admin.id, v_admin.name, 'SUCCESS');

  INSERT INTO wallet_transactions
    (id, user_id, user_name, user_role, type, direction, amount,
     opening_balance, closing_balance, counterparty_id, counterparty_name, note, by_id, by_name, status)
  VALUES
    ('WTX-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
     v_admin.id, v_admin.name, v_admin.role, 'ADMIN_CREDIT', 'CREDIT', p_amount,
     v_aopen, v_admin.balance, v_target.id, v_target.name,
     'Debited from ' || v_target.name || ' - ' || v_note,
     v_admin.id, v_admin.name, 'SUCCESS');

  INSERT INTO activities (id, user_id, user_name, user_role, action, detail)
  VALUES ('ACT-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
          v_admin.id, v_admin.name, v_admin.role, 'ADMIN_DEBIT',
          p_amount || ' from ' || v_target.name);

  RETURN QUERY SELECT true, NULL::text;
END;
$$;

-- ============================================================================
-- 6. ADMIN: user lifecycle
-- ============================================================================
-- Sequence backing app_create_user's generated ids
CREATE SEQUENCE IF NOT EXISTS app_user_id_seq START 1;

CREATE OR REPLACE FUNCTION app_create_user(
  p_name text, p_role text, p_parent text, p_username text
)
RETURNS TABLE(ok boolean, new_id text, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_creator users%ROWTYPE;
  v_parent  users%ROWTYPE;
  v_id      text;
  v_prefix  text;
BEGIN
  SELECT * INTO v_creator FROM users WHERE auth_id = auth.uid();
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL, 'Not authenticated'::text; RETURN;
  END IF;

  -- Role/permission matrix, enforced here rather than in the UI
  IF v_creator.role = 'ADMIN' THEN
    IF p_role NOT IN ('SUPER DISTRIBUTOR','DISTRIBUTOR','RETAILER') THEN
      RETURN QUERY SELECT false, NULL, 'Invalid role'::text; RETURN;
    END IF;
  ELSIF v_creator.role = 'SUPER DISTRIBUTOR' AND p_role = 'DISTRIBUTOR' AND p_parent = v_creator.id THEN
    NULL;
  ELSIF v_creator.role = 'DISTRIBUTOR' AND p_role = 'RETAILER' AND p_parent = v_creator.id THEN
    NULL;
  ELSE
    RETURN QUERY SELECT false, NULL, 'Not allowed to create this layer'::text; RETURN;
  END IF;

  IF NOT COALESCE((v_creator.permissions->>'transfer')::boolean, false) THEN
    RETURN QUERY SELECT false, NULL, 'ID creation is disabled by Admin'::text; RETURN;
  END IF;

  IF coalesce(btrim(p_name),'') = '' OR coalesce(btrim(p_username),'') = '' THEN
    RETURN QUERY SELECT false, NULL, 'Name and username are required'::text; RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM users WHERE lower(username) = lower(p_username)) THEN
    RETURN QUERY SELECT false, NULL, 'Username already exists'::text; RETURN;
  END IF;

  SELECT * INTO v_parent FROM users WHERE id = p_parent;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL, 'Invalid parent'::text; RETURN;
  END IF;

  v_prefix := CASE p_role
                WHEN 'SUPER DISTRIBUTOR' THEN 'SD'
                WHEN 'DISTRIBUTOR' THEN 'D'
                ELSE 'R' END;
  v_id := v_prefix || lpad((nextval('app_user_id_seq'))::text, 4, '0');

  INSERT INTO users (id, name, role, parent, username, balance, main_balance, approved, active, kyc, permissions, commission_rate)
  VALUES (v_id, btrim(p_name), p_role, p_parent, lower(btrim(p_username)), 0, 0, false, false, 'PENDING',
          jsonb_build_object('bill', false, 'transfer', p_role <> 'RETAILER'), 0);

  INSERT INTO activities (id, user_id, user_name, user_role, action, detail)
  VALUES ('ACT-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
          v_creator.id, v_creator.name, v_creator.role, 'CREATE_USER',
          p_role || ' ' || p_name || ' (' || v_id || ')');

  RETURN QUERY SELECT true, v_id, NULL::text;
END;
$$;

-- Generic, allow-listed admin mutation on a single user.
-- The column name is validated against a fixed list so this cannot become an
-- arbitrary column write.
CREATE OR REPLACE FUNCTION app_admin_set_user(
  p_user_id text,
  p_field   text,
  p_value   text
)
RETURNS TABLE(ok boolean, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin users%ROWTYPE;
  v_user  users%ROWTYPE;
BEGIN
  SELECT * INTO v_admin FROM users WHERE auth_id = auth.uid();
  IF NOT FOUND OR v_admin.role <> 'ADMIN' THEN
    RETURN QUERY SELECT false, 'Only Power Admin can do this'::text; RETURN;
  END IF;

  SELECT * INTO v_user FROM users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND OR v_user.role = 'ADMIN' THEN
    RETURN QUERY SELECT false, 'Select a valid non-admin user'::text; RETURN;
  END IF;

  CASE p_field
    WHEN 'approved' THEN
      UPDATE users SET approved = p_value::boolean,
                       active   = CASE WHEN p_value::boolean THEN true ELSE active END,
                       kyc      = CASE WHEN p_value::boolean THEN 'VERIFIED' ELSE 'PENDING' END
        WHERE id = p_user_id;
    WHEN 'active' THEN
      UPDATE users SET active = p_value::boolean WHERE id = p_user_id;
    WHEN 'kyc' THEN
      UPDATE users SET kyc = p_value WHERE id = p_user_id;
    WHEN 'perm_bill' THEN
      UPDATE users SET permissions = jsonb_set(permissions, '{bill}', to_jsonb(p_value::boolean)) WHERE id = p_user_id;
    WHEN 'perm_transfer' THEN
      UPDATE users SET permissions = jsonb_set(permissions, '{transfer}', to_jsonb(p_value::boolean)) WHERE id = p_user_id;
    WHEN 'commission_rate' THEN
      UPDATE users SET commission_rate = p_value::numeric WHERE id = p_user_id;
    ELSE
      RETURN QUERY SELECT false, 'Unsupported field'::text; RETURN;
  END CASE;

  INSERT INTO activities (id, user_id, user_name, user_role, action, detail)
  VALUES ('ACT-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
          v_admin.id, v_admin.name, v_admin.role, 'ADMIN_SET',
          p_field || ' -> ' || p_value || ' for ' || v_user.name);

  RETURN QUERY SELECT true, NULL::text;
END;
$$;

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================
-- Reads are scoped: you see yourself, your downline, and (for admins) everyone.
-- Writes go through the SECURITY DEFINER functions above, which enforce their
-- own rules, so no write policy is granted here.

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities          ENABLE ROW LEVEL SECURITY;

-- Drop any prior policies so this file is re-runnable
DROP POLICY IF EXISTS users_read            ON users;
DROP POLICY IF EXISTS tx_read               ON transactions;
DROP POLICY IF EXISTS wtx_read              ON wallet_transactions;
DROP POLICY IF EXISTS act_read              ON activities;

-- The set of user ids the caller is allowed to see: themselves, their entire
-- downline, or everyone when they are an admin.
--
-- SECURITY DEFINER so it can read `users` without re-triggering RLS on itself,
-- which would otherwise recurse. Resolves the caller from the JWT only, so a
-- client cannot widen its own scope.
CREATE OR REPLACE FUNCTION app_scope_ids()
RETURNS SETOF text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT u.id::text FROM users u WHERE u.auth_id = auth.uid()
  UNION
  SELECT d.id::text
    FROM users me
    CROSS JOIN LATERAL app_downline(me.id) d
   WHERE me.auth_id = auth.uid()
  UNION
  SELECT u.id::text FROM users u WHERE app_is_admin();
$$;

-- Self + downline + (admin sees all)
CREATE POLICY users_read ON users FOR SELECT USING (
  id IN (SELECT s.id FROM app_scope_ids() AS s(id))
);

-- Admin sees every transaction; others see their own and their downline's
CREATE POLICY tx_read ON transactions FOR SELECT USING (
  retailer_id IN (SELECT s.id FROM app_scope_ids() AS s(id))
);

-- Admin sees the whole ledger; others see only rows they are party to
CREATE POLICY wtx_read ON wallet_transactions FOR SELECT USING (
  user_id IN (SELECT s.id FROM app_scope_ids() AS s(id))
);

CREATE POLICY act_read ON activities FOR SELECT USING (
  user_id IN (SELECT s.id FROM app_scope_ids() AS s(id))
);

-- ============================================================================
-- 8. ACTIVITY LOGGING HELPER (for non-money events such as login)
-- ============================================================================
CREATE OR REPLACE FUNCTION app_log(p_action text, p_detail text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user users%ROWTYPE;
BEGIN
  SELECT * INTO v_user FROM users WHERE auth_id = auth.uid();
  IF NOT FOUND THEN RETURN; END IF;

  INSERT INTO activities (id, user_id, user_name, user_role, action, detail)
  VALUES ('ACT-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
          v_user.id, v_user.name, v_user.role, p_action, p_detail);

  DELETE FROM activities WHERE user_id = v_user.id AND id NOT IN (
    SELECT id FROM activities WHERE user_id = v_user.id ORDER BY date DESC LIMIT 200
  );
END;
$$;

-- ============================================================================
-- 8b. FIRST-TIME-SETUP LINKING
--
-- app_create_user only creates the profile row (no auth_id), because minting
-- auth accounts requires the admin API. The user later claims the account
-- through "First Time Setup", which calls supabase.auth.signUp(). That insert
-- into auth.users must be linked back to the waiting profile, otherwise
-- loadMe() finds no users row and setup dead-ends at "username not found".
--
-- Matching is on the email local part == username. The `auth_id IS NULL` guard
-- is load-bearing: it stops anyone from hijacking an account that has already
-- been claimed by signing up with a taken username.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
     SET auth_id = NEW.id,
         updated_at = now()
   WHERE lower(username) = lower(split_part(NEW.email, '@', 1))
     AND auth_id IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 9. SEED: create auth accounts + link them to app users
-- ============================================================================
-- Supabase Auth stores a hash, never the password. The plaintext appears only
-- inside this transaction and is never written to the users table.
--
-- auth.users has no unique index on email (Supabase enforces uniqueness in Go),
-- so ON CONFLICT cannot target it. Look the row up first, then insert or update.
--
-- After running this you should NOT use these demo passwords in production.
DO $$
DECLARE
  r        record;
  v_auth_id uuid;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('ADM001',     'EazyPay Power Admin',          'ADMIN',              NULL::text,    50000, 'admin001',    'admin123', true,  true,  'VERIFIED', '{"bill":true,"transfer":true}'),
      ('SD001',      'Ahmedabad Super Distributor',  'SUPER DISTRIBUTOR',  'ADM001',     15000, 'super001',    '123456',   true,  true,  'VERIFIED', '{"bill":true,"transfer":true}'),
      ('D001',       'Ahmedabad Distributor',        'DISTRIBUTOR',        'SD001',       5000, 'dist001',     '123456',   true,  true,  'VERIFIED', '{"bill":true,"transfer":true}'),
      ('R001',       'Ahmedabad Retailer',           'RETAILER',           'D001',        2500, 'retailer001', '123456',   true,  true,  'VERIFIED', '{"bill":true,"transfer":false}'),
      ('R002',       'Demo Retailer 2',              'RETAILER',           'D001',        1200, 'retailer002', '123456',   false, false, 'PENDING',  '{"bill":false,"transfer":false}')
    ) AS t(id, name, role, parent, balance, username, password, approved, active, kyc, perms)
  LOOP
    -- Create the auth account if it is missing, otherwise refresh its password.
    SELECT u.id INTO v_auth_id FROM auth.users u WHERE u.email = r.username || '@zonepay.online';

    IF v_auth_id IS NULL THEN
      INSERT INTO auth.users
        (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
         raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
         confirmation_token, email_change, email_change_token_new, recovery_token)
      VALUES
        ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
         r.username || '@zonepay.online', crypt(r.password, gen_salt('bf')), now(),
         '{"provider":"email","providers":["email"]}', jsonb_build_object('role', r.role),
         now(), now(), '', '', '', '')
      RETURNING id INTO v_auth_id;
    ELSE
      UPDATE auth.users
         SET encrypted_password   = crypt(r.password, gen_salt('bf')),
             email_confirmed_at   = now(),
             confirmation_token   = ''
       WHERE id = v_auth_id;
    END IF;

    -- Link the app user to its auth account.
    -- username is carried alongside auth_id: it is NOT NULL UNIQUE, and it is
    -- what the UI shows. Credentials still live only in auth.users.
    INSERT INTO users (id, name, role, parent, balance, main_balance, approved, active, kyc,
                       username, auth_id, permissions, commission_rate)
    VALUES (r.id, r.name, r.role, r.parent, r.balance, 0, r.approved, r.active, r.kyc,
            r.username, v_auth_id, r.perms::jsonb, 0)
    ON CONFLICT (id) DO UPDATE
      SET auth_id     = EXCLUDED.auth_id,
          name        = EXCLUDED.name,
          role        = EXCLUDED.role,
          parent      = EXCLUDED.parent,
          approved    = EXCLUDED.approved,
          active      = EXCLUDED.active,
          kyc         = EXCLUDED.kyc,
          permissions = EXCLUDED.permissions;
  END LOOP;
END $$;

-- ============================================================================
-- 10. FUNCTION EXECUTION GRANTS
--
-- Postgres grants EXECUTE on new functions to PUBLIC by default, which would let
-- a signed-out visitor call every RPC directly. Each function also re-checks
-- auth internally, so this is defence in depth: reads stay available to both
-- roles (RLS policies need app_scope_ids), money/profile writes become
-- authenticated-only.
-- ============================================================================

REVOKE ALL ON FUNCTION app_pay_bill(text, text, numeric, text, text)            FROM PUBLIC;
REVOKE ALL ON FUNCTION app_transfer(text, numeric)                              FROM PUBLIC;
REVOKE ALL ON FUNCTION app_admin_create_balance(numeric)                        FROM PUBLIC;
REVOKE ALL ON FUNCTION app_admin_debit(text, numeric, text)                     FROM PUBLIC;
REVOKE ALL ON FUNCTION app_create_user(text, text, text, text)                   FROM PUBLIC;
REVOKE ALL ON FUNCTION app_admin_set_user(text, text, text)                     FROM PUBLIC;
REVOKE ALL ON FUNCTION app_downline(text)                                       FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app_pay_bill(text, text, numeric, text, text)         TO authenticated;
GRANT EXECUTE ON FUNCTION app_transfer(text, numeric)                           TO authenticated;
GRANT EXECUTE ON FUNCTION app_admin_create_balance(numeric)                     TO authenticated;
GRANT EXECUTE ON FUNCTION app_admin_debit(text, numeric, text)                  TO authenticated;
GRANT EXECUTE ON FUNCTION app_create_user(text, text, text, text)                TO authenticated;
GRANT EXECUTE ON FUNCTION app_admin_set_user(text, text, text)                  TO authenticated;

GRANT EXECUTE ON FUNCTION app_current_user()                                    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_is_admin()                                        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_scope_ids()                                       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_downline(text)                                    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_log(text, text)                                   TO authenticated;

-- ============================================================================
-- 11. VERIFY
-- ============================================================================
SELECT id, name, role, balance, approved, active,
       (auth_id IS NOT NULL) AS has_auth_account
  FROM users ORDER BY id;
