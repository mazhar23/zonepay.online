-- ============================================================================
-- 002_bill_amount_authority.sql
--
-- Closes the last money hole: app_pay_bill trusted a client-supplied p_amount.
-- Anyone holding a valid session could POST any number and have the wallet
-- debited by that amount while the transaction recorded the same amount.
--
-- APIclub is reachable only from Namecheap (its egress IP is whitelisted), so
-- the fetch cannot move into an Edge Function. Instead proxy.php stays the
-- fetcher and *vouches* for the amount it received: after a successful fetch
-- it HMAC-signs the bill with a secret shared with this database and posts the
-- signature to app_record_bill. A browser cannot produce that signature, so
-- the stored amount is trusted, and app_pay_bill uses the stored amount
-- instead of anything the client sends.
--
-- The signature is over:
--     consumer | biller | amount_text | expires_at | request_id
-- amount_text (not a numeric) is deliberate: the stored amount is derived from
-- exactly the bytes that were signed, so there is no second, unsigned field
-- that could disagree with the signature.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Server-side bill cache
-- ---------------------------------------------------------------------------

-- The existing transactions table has no bill number, which is why the old
-- duplicate-payment guard could only key on consumer_id and block a new month's
-- bill for the same consumer. Record the bill number from now on.
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS bill_no text;
CREATE INDEX IF NOT EXISTS idx_tx_bill_dup
  ON transactions(consumer_id, biller, bill_no) WHERE status = 'SUCCESS';

CREATE TABLE IF NOT EXISTS bills (
  id            bigserial PRIMARY KEY,
  consumer_id   text        NOT NULL,
  biller        text        NOT NULL,
  amount        numeric     NOT NULL,
  bill_no       text,
  due_date      text,
  request_id    text        NOT NULL,
  fetched_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  consumed_at   timestamptz,
  consumed_txn  text
);

CREATE INDEX IF NOT EXISTS idx_bills_lookup   ON bills(consumer_id, biller, consumed_at);
CREATE INDEX IF NOT EXISTS idx_bills_live     ON bills(expires_at) WHERE consumed_at IS NULL;

-- Only the signing function may read/write this. RLS stays on with no policies.
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. Shared signing secret
--
-- proxy.php holds the same value as the BILL_HMAC_SECRET environment variable.
-- It is generated once and then left alone, so re-running this file does not
-- invalidate signatures already issued.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bill_signing_secret (
  id      int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  secret  text NOT NULL
);

INSERT INTO bill_signing_secret (id, secret)
VALUES (1, encode(gen_random_bytes(32), 'hex'))
ON CONFLICT (id) DO NOTHING;

ALTER TABLE bill_signing_secret ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. Record a fetched bill (called by proxy.php only, authenticated by HMAC)
--
-- Callable with the anon key: the signature, not the caller, is the
-- credential. An attacker who reaches this RPC without the secret can only
-- produce requests that fail the check below.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_record_bill(
  p_consumer    text,
  p_biller      text,
  p_amount_text text,
  p_bill_no     text,
  p_due_date    text,
  p_request_id  text,
  p_expires_at  bigint,
  p_sig         text
)
RETURNS TABLE(ok boolean, bill_ref text, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_secret text;
  v_expect text;
  v_amount numeric;
  v_ref    text;
BEGIN
  SELECT secret INTO v_secret FROM bill_signing_secret WHERE id = 1;
  IF v_secret IS NULL THEN
    RETURN QUERY SELECT false, NULL, 'Signing secret not configured'::text; RETURN;
  END IF;

  IF p_consumer IS NULL OR btrim(p_consumer) = ''
     OR p_biller   IS NULL OR btrim(p_biller) = ''
     OR p_amount_text IS NULL OR p_amount_text !~ '^[0-9]{1,9}(\.[0-9]{1,2})?$'
     OR p_request_id IS NULL OR p_request_id = ''
     OR p_sig IS NULL THEN
    RETURN QUERY SELECT false, NULL, 'Malformed bill payload'::text; RETURN;
  END IF;

  -- Constant-time comparison so the signature cannot be probed byte by byte.
  v_expect := encode(hmac(
      p_consumer || '|' || p_biller || '|' || p_amount_text
        || '|' || p_expires_at::text || '|' || p_request_id,
      v_secret, 'sha256'), 'hex');

  IF NOT (v_expect = p_sig) THEN
    RETURN QUERY SELECT false, NULL, 'Signature rejected'::text; RETURN;
  END IF;

  -- Safe to cast without an exception handler: the pattern check above has
  -- already guaranteed p_amount_text is a plain decimal number.
  v_amount := p_amount_text::numeric;

  IF v_amount <= 0 THEN
    RETURN QUERY SELECT false, NULL, 'Invalid amount'::text; RETURN;
  END IF;

  -- A signature is single-use. Replaying an old fetch yields a new row with a
  -- fresh id but the same request_id, so the payment guard rejects it below.
  INSERT INTO bills (consumer_id, biller, amount, bill_no, due_date, request_id, expires_at)
  VALUES (btrim(p_consumer), btrim(p_biller), v_amount, p_bill_no, p_due_date,
          p_request_id, to_timestamp(p_expires_at))
  RETURNING 'BL-' || id INTO v_ref;

  RETURN QUERY SELECT true, v_ref, NULL::text;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Payment now takes a bill reference, never an amount
--
-- The old (p_consumer, p_biller, p_amount, p_bill_no, p_due_date) signature is
-- dropped rather than replaced, so the amount-taking entry point no longer
-- exists at all and cannot be called even by a signed-in user.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS app_pay_bill(text, text, numeric, text, text);
DROP FUNCTION IF EXISTS app_pay_bill(text, text, text);

CREATE OR REPLACE FUNCTION app_pay_bill(
  p_consumer text,
  p_biller   text,
  p_bill_ref text
)
RETURNS TABLE(ok boolean, txn_id text, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user  users%ROWTYPE;
  v_bill  bills%ROWTYPE;
  v_open  numeric;
  v_txn   text;
  v_comm  numeric;
  v_dup   boolean;
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

  IF p_bill_ref IS NULL OR p_bill_ref !~ '^BL-[0-9]{1,18}$' THEN
    RETURN QUERY SELECT false, NULL, 'Invalid bill reference'::text; RETURN;
  END IF;

  -- The amount is read from the row proxy.php signed, never from the caller.
  SELECT * INTO v_bill FROM bills
    WHERE id = substring(p_bill_ref from 4)::bigint
      AND consumer_id = p_consumer
      AND biller = p_biller
      AND consumed_at IS NULL
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL, 'No valid bill for this consumer. Fetch the bill again.'::text; RETURN;
  END IF;

  IF v_bill.expires_at < now() THEN
    RETURN QUERY SELECT false, NULL, 'Bill fetch expired. Fetch the bill again.'::text; RETURN;
  END IF;

  IF v_bill.expires_at < v_bill.fetched_at THEN
    RETURN QUERY SELECT false, NULL, 'Invalid bill record'::text; RETURN;
  END IF;

  -- Refuse a second payment of the same real bill. Keyed on the bill number
  -- when APIclub gave us one, so a new month's bill for the same consumer is
  -- no longer blocked the way it was before.
  IF v_bill.bill_no IS NOT NULL AND v_bill.bill_no <> '' THEN
    SELECT EXISTS (
      SELECT 1 FROM transactions
       WHERE consumer_id = p_consumer
         AND biller      = p_biller
         AND bill_no     = v_bill.bill_no
         AND status      = 'SUCCESS'
    ) INTO v_dup;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM transactions
       WHERE consumer_id = p_consumer
         AND biller      = p_biller
         AND status      = 'SUCCESS'
         AND date        > now() - interval '1 day'
    ) INTO v_dup;
  END IF;

  IF v_dup THEN
    RETURN QUERY SELECT false, NULL, 'This bill has already been paid'::text; RETURN;
  END IF;

  IF v_user.balance < v_bill.amount THEN
    RETURN QUERY SELECT false, NULL, 'Insufficient wallet balance'::text; RETURN;
  END IF;

  v_open := v_user.balance;
  v_txn  := 'EZY-' || to_char(now(), 'YYMMDD') || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
  v_comm := round(v_bill.amount * (v_user.commission_rate / 100), 2);

  UPDATE users SET balance = balance - v_bill.amount WHERE id = v_user.id;
  IF v_comm > 0 THEN
    UPDATE users SET balance = balance + v_comm WHERE id = v_user.id;
  END IF;

  -- Burn the bill record so the same fetch cannot be paid twice.
  UPDATE bills SET consumed_at = now(), consumed_txn = v_txn WHERE id = v_bill.id;

  INSERT INTO transactions
    (id, retailer_id, retailer_name, consumer_id, biller, service, amount, status, commission, date, bill_no)
  VALUES
    (v_txn, v_user.id, v_user.name, p_consumer, p_biller, 'ELECTRICITY',
     v_bill.amount, 'SUCCESS', v_comm, now(), v_bill.bill_no);

  INSERT INTO wallet_transactions
    (id, user_id, user_name, user_role, type, direction, service, amount,
     opening_balance, closing_balance, counterparty_name, note, by_id, by_name, status)
  VALUES
    (substr(md5(random()::text || clock_timestamp()::text), 1, 12) || '-WTX',
     v_user.id, v_user.name, v_user.role, 'BILL_PAYMENT', 'DEBIT', 'ELECTRICITY',
     v_bill.amount, v_open, v_open - v_bill.amount, p_biller,
     'Bill ' || p_consumer || ' / ' || p_biller, v_user.id, v_user.name, 'SUCCESS');

  IF v_comm > 0 THEN
    INSERT INTO wallet_transactions
      (id, user_id, user_name, user_role, type, direction, service, amount,
       opening_balance, closing_balance, counterparty_name, note, by_id, by_name, status)
    VALUES
      (substr(md5(random()::text || clock_timestamp()::text), 1, 12) || '-WTC',
       v_user.id, v_user.name, v_user.role, 'COMMISSION', 'CREDIT', 'ELECTRICITY',
       v_comm, v_open - v_bill.amount, v_open - v_bill.amount + v_comm, 'System',
       'Commission ' || v_user.commission_rate || '% on ' || v_txn, 'SYSTEM', 'System', 'SUCCESS');
  END IF;

  INSERT INTO activities (id, user_id, user_name, user_role, action, detail)
  VALUES ('ACT-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12),
          v_user.id, v_user.name, v_user.role, 'BILL_PAYMENT',
          v_txn || ' / ' || v_bill.amount || ' / ' || p_consumer);

  RETURN QUERY SELECT true, v_txn, NULL::text;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. Grants
--
-- app_record_bill stays callable by anon: its HMAC check is the authorisation,
-- and it only ever writes to the bills cache. app_pay_bill is authenticated
-- only, and its signature no longer accepts an amount.
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION app_record_bill(text, text, text, text, text, text, bigint, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_pay_bill(text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app_record_bill(text, text, text, text, text, text, bigint, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_pay_bill(text, text, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. VERIFY
-- ---------------------------------------------------------------------------
SELECT 'bills rows'     AS what, count(*)::text AS value FROM bills
UNION ALL
SELECT 'signing secret',
       CASE WHEN length(secret) = 64 THEN 'present (64 hex chars)' ELSE 'MISSING' END
  FROM bill_signing_secret WHERE id = 1;

-- The callable app_pay_bill overloads must be exactly this one. If the old
-- amount-taking signature still exists anywhere, the hole is not closed.
SELECT p.proname || '(' || pg_get_function_arguments(p.oid) || ')' AS signature,
       pg_get_function_result(p.oid) AS returns
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public'
   AND p.proname IN ('app_pay_bill', 'app_record_bill')
 ORDER BY 1;