-- ============================================================
-- AutoService DB — Validation Queries
-- Run these inside psql after seeding demo data.
-- Usage: docker exec -it <CONTAINER_NAME> sh
--        export PGPASSWORD=$POSTGRES_PASSWORD
--        psql -U postgres -d AutoServiceDb
--------------------------OR-----------------------------------
-- Download "SQLTools" extension for VS Code, add a new PostgreSQL connection with the same credentials,
-- and run this file directly in the editor.
-- ============================================================


-- ------------------------------------------------------------
-- 1. ROW COUNTS — quick seed sanity check
--    Expected after fresh seed:
--      people=8, vehicles=5, appointments=5, AspNetUsers=3, refreshtokens=0
-- ------------------------------------------------------------
SELECT 'people' AS tbl, COUNT(*) AS cnt FROM people
UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'appointmentmechanics', COUNT(*) FROM appointmentmechanics
UNION ALL
SELECT 'AspNetUsers (Identity)', COUNT(*) FROM "AspNetUsers"
UNION ALL
SELECT 'refreshtokens', COUNT(*) FROM refreshtokens;


-- ------------------------------------------------------------
-- 2. PEOPLE — all rows, raw
-- ------------------------------------------------------------
SELECT * FROM people ORDER BY "Id";


-- ------------------------------------------------------------
-- 3. MECHANICS — with specialization and expertise
-- ------------------------------------------------------------
SELECT "Id", "FirstName", "LastName", "Email", "PhoneNumber",
       "Specialization", "Expertise"
FROM people
WHERE "PersonType" = 'Mechanic'
ORDER BY "Id";


-- ------------------------------------------------------------
-- 4. CUSTOMERS — passive records, no IdentityUserId
-- ------------------------------------------------------------
SELECT "Id", "FirstName", "LastName", "Email", "PhoneNumber",
       "IdentityUserId"
FROM people
WHERE "PersonType" = 'Customer'
ORDER BY "Id";


-- ------------------------------------------------------------
-- 5. IDENTITY ACCOUNTS — mechanics only
--    Every mechanic must have a matching row in AspNetUsers.
-- ------------------------------------------------------------
SELECT p."Id"   AS person_id,
       p."FirstName" || ' ' || p."LastName" AS full_name,
       p."Email" AS domain_email,
       u."Email" AS identity_email,
       u."Id"    AS identity_user_id
FROM people p
JOIN "AspNetUsers" u ON u."Id" = p."IdentityUserId"
WHERE p."PersonType" = 'Mechanic'
ORDER BY p."Id";


-- ------------------------------------------------------------
-- 6. IDENTITY INTEGRITY — customers must have NULL IdentityUserId
--    Expected: 5
-- ------------------------------------------------------------
SELECT COUNT(*) AS customers_without_account
FROM people
WHERE "PersonType" = 'Customer'
  AND "IdentityUserId" IS NULL;


-- ------------------------------------------------------------
-- 7. VEHICLES — with owner name
-- ------------------------------------------------------------
SELECT v."Id",
       v."LicensePlate",
       v."Brand",
       v."Model",
       v."Year",
       v."MileageKm",
       v."EnginePowerHp",
       v."EngineTorqueNm",
       p."FirstName" || ' ' || p."LastName" AS owner
FROM vehicles v
JOIN people p ON p."Id" = v."CustomerId"
ORDER BY v."Id";


-- ------------------------------------------------------------
-- 8. APPOINTMENTS — with vehicle and customer
-- ------------------------------------------------------------
SELECT a."Id"           AS appt_id,
       a."ScheduledDate",
       a."Status",
       a."TaskDescription",
       v."LicensePlate",
       v."Brand" || ' ' || v."Model"       AS car,
       p."FirstName" || ' ' || p."LastName" AS customer
FROM appointments a
JOIN vehicles v ON v."Id" = a."VehicleId"
JOIN people   p ON p."Id" = v."CustomerId"
ORDER BY a."ScheduledDate";


-- ------------------------------------------------------------
-- 9. APPOINTMENT–MECHANIC JOIN — who is assigned to what
-- ------------------------------------------------------------
SELECT a."Id"           AS appt_id,
       a."ScheduledDate",
       a."Status",
       m."FirstName" || ' ' || m."LastName" AS mechanic,
       m."Specialization"
FROM appointments a
JOIN appointmentmechanics am ON am."AppointmentId" = a."Id"
JOIN people               m  ON m."Id"             = am."MechanicId"
ORDER BY a."Id", m."LastName";


-- ------------------------------------------------------------
-- 10. FULL OVERVIEW — customer + car + appointment + mechanic
-- ------------------------------------------------------------
SELECT a."Id"             AS appt_id,
       a."ScheduledDate",
       a."Status",
       v."LicensePlate",
       v."Brand" || ' ' || v."Model"              AS car,
       cust."FirstName" || ' ' || cust."LastName" AS customer,
       mech."FirstName" || ' ' || mech."LastName" AS mechanic
FROM appointments a
JOIN vehicles   v    ON v."Id"              = a."VehicleId"
JOIN people     cust ON cust."Id"           = v."CustomerId"
JOIN appointmentmechanics am ON am."AppointmentId" = a."Id"
JOIN people     mech ON mech."Id"           = am."MechanicId"
ORDER BY a."ScheduledDate", mech."LastName";


-- ------------------------------------------------------------
-- 11. FILTER — appointments by status
--     Change value to: 'InProgress', 'Completed', 'Cancelled'
-- ------------------------------------------------------------
SELECT a."Id", a."ScheduledDate", a."TaskDescription",
       v."LicensePlate", v."Brand" || ' ' || v."Model" AS car
FROM appointments a
JOIN vehicles v ON v."Id" = a."VehicleId"
WHERE a."Status" = 'Scheduled'
ORDER BY a."ScheduledDate";


-- ------------------------------------------------------------
-- 12. APPLIED MIGRATIONS
-- ------------------------------------------------------------
SELECT "MigrationId", "ProductVersion"
FROM "__EFMigrationsHistory"
ORDER BY "MigrationId";


-- ------------------------------------------------------------
-- 13. COLUMN-LEVEL SCHEMA — all public tables
-- ------------------------------------------------------------
SELECT table_name,
       column_name,
       data_type,
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;


-- ------------------------------------------------------------
-- 14. REFRESH TOKEN SESSIONS — list with mechanic owner
--    Expected after fresh seed: 0 rows (until first login)
-- ------------------------------------------------------------
SELECT rt."Id",
       rt."MechanicId",
       p."Email" AS mechanic_email,
       rt."CreatedAtUtc",
       rt."ExpiresAtUtc",
       rt."RevokedAtUtc",
       rt."ReplacedByTokenHash",
       (rt."RevokedAtUtc" IS NULL AND rt."ExpiresAtUtc" > NOW()) AS is_active
FROM refreshtokens rt
JOIN people p ON p."Id" = rt."MechanicId"
ORDER BY rt."CreatedAtUtc" DESC;


-- ------------------------------------------------------------
-- 15. REFRESH TOKEN SUMMARY — active/revoked/expired counters
-- ------------------------------------------------------------
SELECT COUNT(*) AS total_tokens,
       COUNT(*) FILTER (WHERE rt."RevokedAtUtc" IS NULL AND rt."ExpiresAtUtc" > NOW()) AS active_tokens,
       COUNT(*) FILTER (WHERE rt."RevokedAtUtc" IS NOT NULL) AS revoked_tokens,
       COUNT(*) FILTER (WHERE rt."ExpiresAtUtc" <= NOW()) AS expired_tokens
FROM refreshtokens rt;


-- ------------------------------------------------------------
-- 16. REFRESH TOKEN ROTATION INTEGRITY
--    Every ReplacedByTokenHash (if set) should point to an existing token hash.
--    Expected: 0 rows.
-- ------------------------------------------------------------
SELECT old_rt."Id" AS old_token_id,
       old_rt."ReplacedByTokenHash"
FROM refreshtokens old_rt
LEFT JOIN refreshtokens new_rt ON new_rt."TokenHash" = old_rt."ReplacedByTokenHash"
WHERE old_rt."ReplacedByTokenHash" IS NOT NULL
  AND new_rt."Id" IS NULL;


-- ------------------------------------------------------------
-- 17. PERSON/IDENTITY EMAIL CONSISTENCY (mechanics)
--    Expected: 0 rows.
-- ------------------------------------------------------------
SELECT p."Id" AS mechanic_id,
       p."Email" AS person_email,
       u."Email" AS identity_email
FROM people p
JOIN "AspNetUsers" u ON u."Id" = p."IdentityUserId"
WHERE p."PersonType" = 'Mechanic'
  AND LOWER(TRIM(p."Email")) <> LOWER(TRIM(u."Email"));


-- ------------------------------------------------------------
-- 18. PHONE NORMALIZATION CHECK (mechanics)
--    Expected: 0 rows.
--    Canonical format:
--      - 361xxxxxxx (Budapest, 10 digits total)
--      - 36(20|21|30|31|50|70)xxxxxxx (mobile/nomadic, 11 digits)
--      - 36<approved 2-digit area>xxxxxx (geographic, 10 digits)
-- ------------------------------------------------------------
SELECT p."Id" AS mechanic_id,
       p."PhoneNumber"
FROM people p
WHERE p."PersonType" = 'Mechanic'
  AND p."PhoneNumber" IS NOT NULL
  AND NOT (
      p."PhoneNumber" ~ '^361[0-9]{7}$'
      OR p."PhoneNumber" ~ '^36(20|21|30|31|50|70)[0-9]{7}$'
      OR p."PhoneNumber" ~ '^36(22|23|24|25|26|27|28|29|32|33|34|35|36|37|42|44|45|46|47|48|49|52|53|54|56|57|59|62|63|66|68|69|72|73|74|75|76|77|78|79|82|83|84|85|87|88|89|92|93|94|95|96|99)[0-9]{6}$'
  );


-- ------------------------------------------------------------
-- 19. NORMALIZED PHONE DUPLICATE CHECK (identity users)
--    Expected: 0 rows.
-- ------------------------------------------------------------
WITH normalized_identity_phone AS (
    SELECT u."Id" AS user_id,
           u."PhoneNumber" AS raw_phone,
       regexp_replace(u."PhoneNumber", '\\D', '', 'g') AS digits_only
  FROM "AspNetUsers" u
),
country_normalized AS (
  SELECT user_id,
       raw_phone,
           CASE
         WHEN raw_phone IS NULL OR BTRIM(raw_phone) = '' THEN NULL
         WHEN digits_only LIKE '0036%' THEN SUBSTRING(digits_only FROM 3)
         WHEN digits_only LIKE '06%' THEN '36' || SUBSTRING(digits_only FROM 3)
         WHEN digits_only LIKE '36%' THEN digits_only
         ELSE NULL
       END AS candidate_e164
  FROM normalized_identity_phone
),
validated_identity_phone AS (
  SELECT user_id,
       raw_phone,
       CASE
         WHEN candidate_e164 IS NULL THEN NULL
         WHEN candidate_e164 ~ '^361[0-9]{7}$' THEN candidate_e164
         WHEN candidate_e164 ~ '^36(20|21|30|31|50|70)[0-9]{7}$' THEN candidate_e164
         WHEN candidate_e164 ~ '^36(22|23|24|25|26|27|28|29|32|33|34|35|36|37|42|44|45|46|47|48|49|52|53|54|56|57|59|62|63|66|68|69|72|73|74|75|76|77|78|79|82|83|84|85|87|88|89|92|93|94|95|96|99)[0-9]{6}$' THEN candidate_e164
               ELSE
           NULL
           END AS normalized_phone
  FROM country_normalized
)
SELECT normalized_phone,
       COUNT(*) AS duplicate_count,
       STRING_AGG(user_id, ', ') AS identity_user_ids,
       STRING_AGG(COALESCE(raw_phone, '<NULL>'), ', ') AS raw_values
FROM validated_identity_phone
WHERE normalized_phone IS NOT NULL
GROUP BY normalized_phone
HAVING COUNT(*) > 1
ORDER BY normalized_phone;