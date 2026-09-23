#!/bin/bash
#
# Checks firestore.rules against the Firestore emulator — locally, with no
# Firebase login and without touching the real database.
#
#   ./test-rules.sh
#
# Needs the Firebase CLI and Java:  npm install -g firebase-tools
#
# Worth running after any edit to firestore.rules. Rules are the only thing
# protecting customer details, and a broken one fails in two directions: it
# can refuse every booking, or quietly let the world read your database. A
# rules file can also simply fail to compile, in which case Firestore rejects
# everything and the site looks broken for reasons nothing else explains.

set -u
PROJECT=demo-falcore
BASE="http://127.0.0.1:8080/v1/projects/$PROJECT/databases/(default)/documents/bookings"
ADMIN_EMAIL="${ADMIN_EMAIL:-musa.haseeb2012@gmail.com}"
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
pass=0; fail=0

# The emulator accepts unsigned JWTs, so identities can be minted here.
cat > "$TMP/tok.py" << 'PY'
import base64, json, sys
seg = lambda o: base64.urlsafe_b64encode(json.dumps(o).encode()).decode().rstrip('=')
email, verified, project = sys.argv[1], sys.argv[2] == 'true', sys.argv[3]
print(seg({'alg': 'none', 'typ': 'JWT'}) + '.' + seg({
    'iss': 'https://securetoken.google.com/' + project, 'aud': project,
    'sub': 'uid1', 'user_id': 'uid1', 'email': email, 'email_verified': verified,
    'auth_time': 1, 'iat': 1, 'exp': 9999999999,
    'firebase': {'identities': {}, 'sign_in_provider': 'password'},
}) + '.')
PY

tok() {
  local t
  t=$(python3 "$TMP/tok.py" "$1" "$2" "$PROJECT") || { echo "TOKEN_FAILED"; return 1; }
  [ -n "$t" ] || { echo "TOKEN_EMPTY"; return 1; }
  echo "$t"
}

check() { # label  expected  actual
  if [ "$2" = "$3" ]; then
    printf '  \033[32m✓\033[0m %-34s %s\n' "$1" "$3"; pass=$((pass+1))
  else
    printf '  \033[31m✗\033[0m %-34s got %s, wanted %s\n' "$1" "$3" "$2"; fail=$((fail+1))
  fi
}

post_file() { curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -X POST \
              -H "Content-Type: application/json" --data-binary "@$1" "$BASE"; }

read_as() { # token ("" for signed out)
  if [ -z "$1" ]; then
    curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "$BASE?pageSize=1"
  else
    curl -sS -o /dev/null -w "%{http_code}" --max-time 15 \
         -H "Authorization: Bearer $1" "$BASE?pageSize=1"
  fi
}

python3 - "$TMP" << 'PY'
import json, sys
d = sys.argv[1]
def w(n, o): open(d + '/' + n, 'w').write(json.dumps(o))
s = lambda v: {'stringValue': v}

w('valid.json', {'fields': {
    'name': s('Alex Rivera'), 'phone': s('905-555-0123'),
    'vehicle': s('2019 Honda Civic'), 'size': s('Sedan'),
    'service': s('Full Detail'), 'notes': s('Dog hair'),
    'submittedAt': s('2026-09-06T12:00:00.000Z')}})
w('nophone.json', {'fields': {
    'name': s('x'), 'vehicle': s('v'), 'submittedAt': s('2026-01-01')}})
w('extra.json', {'fields': {
    'name': s('x'), 'phone': s('1'), 'vehicle': s('v'),
    'submittedAt': s('2026-01-01'), 'payload': s('free storage')}})
w('bignotes.json', {'fields': {
    'name': s('x'), 'phone': s('1'), 'vehicle': s('v'),
    'submittedAt': s('2026-01-01'), 'notes': s('z' * 2500)}})
PY

echo
echo "Anyone may submit a booking"
check "valid booking accepted"   200 "$(post_file "$TMP/valid.json")"
check "missing phone rejected"   403 "$(post_file "$TMP/nophone.json")"
check "extra field rejected"     403 "$(post_file "$TMP/extra.json")"
check "oversized notes rejected" 403 "$(post_file "$TMP/bignotes.json")"

echo
echo "Only the owner may read them"
check "owner, verified email"    200 "$(read_as "$(tok "$ADMIN_EMAIL" true)")"
check "owner, unverified email"  403 "$(read_as "$(tok "$ADMIN_EMAIL" false)")"
check "stranger who signed up"   403 "$(read_as "$(tok stranger@example.com true)")"
check "nobody signed in"         403 "$(read_as '')"

echo
if [ "$fail" -eq 0 ]; then
  printf '\033[32m%s checks passed.\033[0m\n\n' "$pass"; exit 0
else
  printf '\033[31m%s failed, %s passed.\033[0m\n\n' "$fail" "$pass"; exit 1
fi
