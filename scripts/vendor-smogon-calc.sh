#!/usr/bin/env bash
# Rebuilds vendor/smogon-calc/ from a specific commit of the upstream
# smogon/damage-calc monorepo (the source of @smogon/calc). See
# docs/adr/0005-vendor-smogon-calc.md for why this exists instead of a plain
# npm dependency: npm's @smogon/calc is stuck on an old, irregularly-updated
# release (no CI auto-publish, gaps of a year or more between versions) that
# predates real Pokemon Champions support, and installing straight from a
# git commit fails to build (its bundler needs @babel/core, which is only
# declared at the monorepo root, not inside the calc/ subpackage pnpm
# installs in isolation).
#
# Usage: ./scripts/vendor-smogon-calc.sh
# Then: pnpm install && pnpm test:unit
set -euo pipefail

# The one thing to change to pick up a newer upstream patch (e.g. the next
# Regulation's move balance changes) — find the commit at
# https://github.com/smogon/damage-calc/commits/master/calc/src/data/moves.ts
COMMIT=fc17f51822249b44c9f4ff36c03ba40d0541a6e9

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR_DIR="$REPO_ROOT/vendor/smogon-calc"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "==> Cloning smogon/damage-calc @ $COMMIT"
git clone --quiet https://github.com/smogon/damage-calc.git "$WORKDIR/damage-calc"
git -C "$WORKDIR/damage-calc" fetch --quiet --depth 1 origin "$COMMIT"
git -C "$WORKDIR/damage-calc" checkout --quiet "$COMMIT"

# Installed at the monorepo ROOT, not inside calc/ — calc's own build
# (`node bundle`) requires @babel/core and friends, which only exist as
# optionalDependencies on the root package.json. The root's own
# "postinstall": "subpkg install" then installs+builds calc/ from there,
# where that Node module resolution walk-up actually finds them.
echo "==> npm install (root, so calc/'s own build step can find @babel/core)"
npm install --prefix "$WORKDIR/damage-calc" --no-audit --no-fund --silent

echo "==> Copying calc/dist into $VENDOR_DIR"
rm -rf "$VENDOR_DIR"
mkdir -p "$VENDOR_DIR"
cp -r "$WORKDIR/damage-calc/calc/dist" "$VENDOR_DIR/dist"
cp "$WORKDIR/damage-calc/LICENSE" "$VENDOR_DIR/LICENSE"

# A minimal package.json — deliberately not a copy of calc/package.json:
# that one's "scripts"/devDependencies assume the full monorepo checkout
# this vendored copy doesn't have, and would make pnpm try (and fail) to
# re-run the "prepare" build step on every install.
node -e "
const src = require('$WORKDIR/damage-calc/calc/package.json');
const fs = require('fs');
fs.writeFileSync('$VENDOR_DIR/package.json', JSON.stringify({
	name: src.name,
	version: src.version,
	description: src.description,
	license: src.license,
	main: src.main,
	types: src.types,
	unpkg: src.unpkg
}, null, '\t') + '\n');
"

cat > "$VENDOR_DIR/PROVENANCE.md" <<EOF
# Provenance

Built from [smogon/damage-calc](https://github.com/smogon/damage-calc)
at commit \`$COMMIT\`, subdirectory \`calc/\`, via \`scripts/vendor-smogon-calc.sh\`.
Regenerate with that script after bumping \`COMMIT\` in it — do not hand-edit
anything under \`dist/\`.

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

echo "==> Done. vendor/smogon-calc is now at $COMMIT."
echo "    Next: pnpm install && pnpm test:unit"
