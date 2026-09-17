#!/usr/bin/env bash
# Rebuilds vendor/ncp-common-sets/ from a specific commit of
# nerd-of-now/NCP-VGC-Damage-Calculator's setdex_ncp-g10.js — its own
# actively-maintained current-regulation set library (this same commit is
# the one that added "Reg M-C sets", the regulation this app itself
# targets). See docs/adr/0006-vendor-common-sets.md.
#
# Usage: ./scripts/vendor-common-sets.sh
# Then: pnpm test:unit
set -euo pipefail

# The one thing to change to pick up a newer commit's sets — find one at
# https://github.com/nerd-of-now/NCP-VGC-Damage-Calculator/commits/main/script_res/setdex_ncp-g10.js
COMMIT=1369b359b85f0a6343df006acde92cc4a7d07805

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR_DIR="$REPO_ROOT/vendor/ncp-common-sets"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

RAW_BASE="https://raw.githubusercontent.com/nerd-of-now/NCP-VGC-Damage-Calculator/$COMMIT"

echo "==> Fetching setdex_ncp-g10.js @ $COMMIT"
curl -fsSL "$RAW_BASE/script_res/setdex_ncp-g10.js" -o "$WORKDIR/setdex.js"
curl -fsSL "$RAW_BASE/LICENSE" -o "$WORKDIR/LICENSE"

echo "==> Converting the JS var literal to plain JSON"
rm -rf "$VENDOR_DIR"
mkdir -p "$VENDOR_DIR"
node -e "
const fs = require('fs');
const src = fs.readFileSync('$WORKDIR/setdex.js', 'utf8');
// The file is a single \`var SETDEX_GEN10 = {...};\` — no requires, no
// side effects — so evaluating it and reading the var back out converts
// its (JS, not strict-JSON: trailing commas, ...) object literal into a
// real object without hand-writing a parser for it.
const data = new Function(src + '; return SETDEX_GEN10;')();
fs.writeFileSync('$VENDOR_DIR/setdex.json', JSON.stringify(data, null, '\t') + '\n');
"
cp "$WORKDIR/LICENSE" "$VENDOR_DIR/LICENSE"

cat > "$VENDOR_DIR/PROVENANCE.md" <<EOF
# Provenance

Converted from [nerd-of-now/NCP-VGC-Damage-Calculator](https://github.com/nerd-of-now/NCP-VGC-Damage-Calculator)'s
\`script_res/setdex_ncp-g10.js\` at commit \`$COMMIT\`, via
\`scripts/vendor-common-sets.sh\`. Regenerate with that script after bumping
\`COMMIT\` in it — do not hand-edit \`setdex.json\`.

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

echo "==> Done. vendor/ncp-common-sets is now at $COMMIT."
echo "    Next: pnpm test:unit"
