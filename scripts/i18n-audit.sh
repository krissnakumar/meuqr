#!/usr/bin/env bash
#
# i18n Audit Script
# =================
# Scans the MeuQR codebase for i18n issues:
#   1. Hardcoded Portuguese strings not wrapped in t()
#   2. t() keys referenced in code but missing from locale files
#   3. Unused translation keys in locale files
#   4. Hardcoded error messages in API route files
#   5. Cross-locale key coverage (en, es vs pt-BR)
#
# Usage:
#   ./scripts/i18n-audit.sh              # full audit
#   ./scripts/i18n-audit.sh --quick       # skip per-file detail, just summary
#   ./scripts/i18n-audit.sh --files-only  # only report files with issues
#
# Exit codes:
#   0  – no issues found
#   1  – issues found (or runtime error)
#

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

QUICK=false
FILES_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --quick) QUICK=true ;;
    --files-only) FILES_ONLY=true ;;
  esac
done

PASS=0
FAIL=0
ISSUES=0

pass() { PASS=$((PASS+1)); }
fail() { FAIL=$((FAIL+1)); ISSUES=$((ISSUES+1)); }

# ──────────────────────────────────────────────
# Helper: header / divider
# ──────────────────────────────────────────────
h1() { echo; echo "════════════════════════════════════════════"; echo "  $1"; echo "════════════════════════════════════════════"; }
h2() { echo; echo "  ── $1 ──"; }
ok()  { echo "   ✅ $1"; }
warn(){ echo "   ⚠️  $1"; }
err() { echo "   ❌ $1"; }

# ──────────────────────────────────────────────
# 1) Hardcoded Portuguese text strings
# ──────────────────────────────────────────────
h1 "1. Hardcoded Portuguese strings (not wrapped in t())"

# common Portuguese patterns that should almost always be translated
PT_PATTERNS=(
  "Carregando"
  "carregando"
  "Preencha"
  "Adicione"
  "Configurar"
  "Selecione"
  "Endereço"
  "Voltar"
  "Próximo"
  "Concluir"
  "Validar"
  "Cancelar"
  "Excluir"
  "Obrigatório"
  "Negócio"
  "Pedido"
  "Orçamento"
  "Agendamento"
  "Cadastrar"
  "Categoria"
  "Descrição"
  "Telefone"
  "WhatsApp"
  "Compartilhar"
  "Publicar"
  "Filtrar"
  "Continuar"
  "Remover"
  "Enviar"
  "Entrar"
  "Baixar"
  "Salvando"
  "processando"
  "Processando"
  "Gerando"
  "gerando"
  "Verificar"
  "verificar"
  "Escolha"
  "escolha"
  "Tem certeza"
  "tem certeza"
  "Nenhum resultado"
  "nenhum resultado"
  "Atualizar"
  "atualizar"
)

ALL_HARDCODED_FILE=""
HARDCODED_TMP=$(mktemp)

for pattern in "${PT_PATTERNS[@]}"; do
  grep -rn "$pattern" apps/ packages/ --include='*.tsx' --include='*.ts' \
    | grep -v node_modules \
    | grep -v 't(' \
    | grep -v '.test.' \
    | grep -v '__tests__' \
    | grep -v '\.spec\.' \
    | grep -v '/__tests__/' \
    | grep -v "^packages/shared/src/i18n/" \
    | grep -v '//.*ignore-i18n' \
    >> "$HARDCODED_TMP" || true
done

if [ -s "$HARDCODED_TMP" ]; then
  sort -u "$HARDCODED_TMP" > "${HARDCODED_TMP}_sorted"
  TOTAL=$(wc -l < "${HARDCODED_TMP}_sorted")
  err "Found $TOTAL potential hardcoded Portuguese strings"
  ALL_HARDCODED_FILE="${HARDCODED_TMP}_sorted"
  if [ "$FILES_ONLY" = true ]; then
    cut -d: -f1 "${HARDCODED_TMP}_sorted" | sort -u | while IFS= read -r f; do
      warn "$f"
    done
  elif [ "$QUICK" = false ]; then
    head -80 "${HARDCODED_TMP}_sorted" | while IFS=: read -r file line rest; do
      echo "         $file:$line  →  $(echo "$rest" | sed 's/^[[:space:]]*//')"
    done
    TOTAL_LINES=$(wc -l < "${HARDCODED_TMP}_sorted")
    if [ "$TOTAL_LINES" -gt 80 ]; then
      echo "         ... and $(($TOTAL_LINES - 80)) more matches (use --quick to suppress details)"
    fi
  fi
  fail
else
  ok "No obvious hardcoded Portuguese strings detected"
  pass
fi

# ──────────────────────────────────────────────
# 2) Missing translation keys (referenced but not defined)
# ──────────────────────────────────────────────
h1 "2. Translation keys referenced but missing from locale files"

LOCALE_FILES=(
  "packages/shared/src/i18n/locales/pt-BR.json"
  "packages/shared/src/i18n/locales/en.json"
  "packages/shared/src/i18n/locales/es.json"
)

# Extract all t('...') and t("...") keys from source
T_USED_TMP=$(mktemp)
grep -rn "t(" apps/ packages/ --include='*.tsx' --include='*.ts' \
  | grep -v node_modules \
  | grep -oP "t\(['\"]([^'\"]+)['\"]\)" \
  | sed "s/t(['\"]//; s/['\"])//" \
  | sort -u \
  > "$T_USED_TMP" || true

# Remove noise: keys that are actually variables, not string literals
# Filter to only keep keys that look like dotted paths (e.g., "errors.generic")
T_USED_CLEAN=$(mktemp)
grep '\.' "$T_USED_TMP" > "$T_USED_CLEAN" || true

for locale_file in "${LOCALE_FILES[@]}"; do
  if [ ! -f "$locale_file" ]; then
    warn "Locale file not found: $locale_file"
    continue
  fi
  h2 "Checking against: $(basename "$locale_file")"

  # Extract all keys from this locale file as dotted paths
  LOCALE_KEYS_TMP=$(mktemp)
  python3 -c "
import json, sys
with open('$locale_file') as f:
    data = json.load(f)
def flatten(obj, prefix=''):
    for k, v in obj.items():
        key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            flatten(v, key)
        else:
            print(key)
flatten(data)
" 2>/dev/null | sort > "$LOCALE_KEYS_TMP" || {
    warn "Could not parse $locale_file (might have trailing commas or invalid JSON)"
    rm -f "$LOCALE_KEYS_TMP"
    continue
  }

  MISSING_TMP=$(mktemp)
  comm -23 "$T_USED_CLEAN" "$LOCALE_KEYS_TMP" > "$MISSING_TMP" || true

  if [ -s "$MISSING_TMP" ]; then
    COUNT=$(wc -l < "$MISSING_TMP")
    err "$COUNT key(s) used in code but missing from $(basename "$locale_file"):"
    cat "$MISSING_TMP" | while IFS= read -r key; do
      echo "         - $key"
    done
    fail
  else
    ok "All used keys are defined in $(basename "$locale_file")"
    pass
  fi

  rm -f "$MISSING_TMP" "$LOCALE_KEYS_TMP"
done

rm -f "$T_USED_TMP" "$T_USED_CLEAN"

# ──────────────────────────────────────────────
# 3) Unused translation keys
# ──────────────────────────────────────────────
h1 "3. Unused translation keys (defined but never referenced in code)"

# Re-extract the used keys for comparison
USED_KEYS_TMP=$(mktemp)
grep -rn "t(" apps/ packages/ --include='*.tsx' --include='*.ts' \
  | grep -v node_modules \
  | grep -oP "t\(['\"]([^'\"]+)['\"]\)" \
  | sed "s/t(['\"]//; s/['\"])//" \
  | sort -u \
  | grep '\.' \
  > "$USED_KEYS_TMP" || true

for locale_file in "${LOCALE_FILES[@]}"; do
  if [ ! -f "$locale_file" ]; then continue; fi
  h2 "Unused keys in $(basename "$locale_file")"

  LOCALE_KEYS_TMP=$(mktemp)
  python3 -c "
import json
with open('$locale_file') as f:
    data = json.load(f)
def flatten(obj, prefix=''):
    for k, v in obj.items():
        key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            flatten(v, key)
        else:
            print(key)
flatten(data)
" 2>/dev/null | sort > "$LOCALE_KEYS_TMP" || { rm -f "$LOCALE_KEYS_TMP"; continue; }

  # comm -23 = lines only in locale keys (unused)
  UNUSED_TMP=$(mktemp)
  comm -23 "$LOCALE_KEYS_TMP" "$USED_KEYS_TMP" > "$UNUSED_TMP" || true

  UNUSED_COUNT=$(wc -l < "$UNUSED_TMP" 2>/dev/null || echo 0)
  TOTAL_COUNT=$(wc -l < "$LOCALE_KEYS_TMP" 2>/dev/null || echo 1)

  if [ "$UNUSED_COUNT" -gt 0 ]; then
    UNUSED_PCT=$(( UNUSED_COUNT * 100 / TOTAL_COUNT ))
    warn "$UNUSED_COUNT / $TOTAL_COUNT keys unused ($UNUSED_PCT%)"
    if [ "$QUICK" = false ] && [ "$UNUSED_COUNT" -le 30 ]; then
      cat "$UNUSED_TMP" | head -30 | while IFS= read -r key; do
        echo "         - $key"
      done
    elif [ "$UNUSED_COUNT" -gt 30 ]; then
      echo "         (too many to list; use --quick to suppress)"
    fi
    # Don't fail for unused keys — they might be reserved for future use
    warn "This is informational — unused keys may be intentional (future use / templates)"
  else
    ok "All keys in $(basename "$locale_file") are used"
  fi

  rm -f "$UNUSED_TMP" "$LOCALE_KEYS_TMP"
done
rm -f "$USED_KEYS_TMP"

# ──────────────────────────────────────────────
# 4) Hardcoded Portuguese in API routes
# ──────────────────────────────────────────────
h1 "4. Hardcoded Portuguese error messages in API routes"

API_TMP=$(mktemp)
grep -rn 'Erro\|erro\|Sucesso\|sucesso\|negócio\|Negócio\|agendamento\|Agendamento\|pedido\|Pedido\|orçamento\|Orçamento' \
  apps/web/src/app/api/ --include='*.ts' --include='*.tsx' \
  | grep -v node_modules \
  | grep -v 't(' \
  | grep -v '.test.' \
  | grep -v '__tests__' \
  > "$API_TMP" || true

if [ -s "$API_TMP" ]; then
  TOTAL_API=$(wc -l < "$API_TMP")
  err "$TOTAL_API hardcoded Portuguese string(s) in API route files"
  if [ "$QUICK" = false ]; then
    cat "$API_TMP" | while IFS=: read -r file line rest; do
      echo "         $file:$line  →  $(echo "$rest" | sed 's/^[[:space:]]*//')"
    done
  fi
  fail
else
  ok "No hardcoded Portuguese strings in API routes"
  pass
fi
rm -f "$API_TMP"

# ──────────────────────────────────────────────
# 5) Cross-locale key parity
# ──────────────────────────────────────────────
h1 "5. Cross-locale key parity (en / es vs pt-BR)"

PT_FILE="packages/shared/src/i18n/locales/pt-BR.json"
EN_FILE="packages/shared/src/i18n/locales/en.json"
ES_FILE="packages/shared/src/i18n/locales/es.json"

for locale_pair in "$PT_FILE:$EN_FILE" "$PT_FILE:$ES_FILE" "$EN_FILE:$ES_FILE"; do
  SRC="${locale_pair%%:*}"
  TGT="${locale_pair##*:}"
  SRC_NAME=$(basename "$SRC")
  TGT_NAME=$(basename "$TGT")

  if [ ! -f "$SRC" ] || [ ! -f "$TGT" ]; then
    warn "Missing locale file: $SRC or $TGT"; continue
  fi

  h2 "$SRC_NAME → $TGT_NAME"

  SRC_KEYS=$(mktemp)
  TGT_KEYS=$(mktemp)

  python3 -c "
import json
with open('$SRC') as f: data = json.load(f)
def flatten(obj, prefix=''):
    for k,v in obj.items():
        key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict): flatten(v, key)
        else: print(key)
flatten(data)
" 2>/dev/null | sort > "$SRC_KEYS" || { rm -f "$SRC_KEYS" "$TGT_KEYS"; continue; }

  python3 -c "
import json
with open('$TGT') as f: data = json.load(f)
def flatten(obj, prefix=''):
    for k,v in obj.items():
        key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict): flatten(v, key)
        else: print(key)
flatten(data)
" 2>/dev/null | sort > "$TGT_KEYS" || { rm -f "$SRC_KEYS" "$TGT_KEYS"; continue; }

  MISSING_IN_TGT=$(comm -23 "$SRC_KEYS" "$TGT_KEYS")
  MISSING_IN_SRC=$(comm -23 "$TGT_KEYS" "$SRC_KEYS")

  if [ -n "$MISSING_IN_TGT" ]; then
    COUNT=$(echo "$MISSING_IN_TGT" | wc -l)
    err "$COUNT key(s) in $SRC_NAME missing from $TGT_NAME"
    if [ "$QUICK" = false ] && [ "$COUNT" -le 20 ]; then
      echo "$MISSING_IN_TGT" | while IFS= read -r key; do
        echo "         - $key"
      done
    fi
    fail
  else
    ok "$SRC_NAME and $TGT_NAME have identical key sets"
    pass
  fi

  if [ -n "$MISSING_IN_SRC" ]; then
    COUNT=$(echo "$MISSING_IN_SRC" | wc -l)
    warn "$COUNT extra key(s) in $TGT_NAME not in $SRC_NAME"
  fi

  rm -f "$SRC_KEYS" "$TGT_KEYS"
done

# ──────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────
h1 "Summary"

echo "  Passed checks:  $PASS"
echo "  Failed checks:  $FAIL"
echo

if [ "$ISSUES" -eq 0 ]; then
  ok "No i18n issues found! 🎉"
  exit 0
else
  err "$ISSUES total issue(s) found."
  echo
  echo "  Quick fix tips:"
  echo "    - Wrap Portuguese strings in t('namespace.key') and ensure the key exists in locale files"
  echo "    - Run 'pnpm t typecheck' after adding new translation keys"
  echo "    - Unused keys are informational; remove them or add // i18n-ignore-use if intentional"
  echo "    - Add '// ignore-i18n' on a line to silence false positives"
  exit 1
fi
