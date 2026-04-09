#!/bin/bash
# fix-case-context.sh - Replace invalid v1p1 context with valid v1p0 context

set -e

OLD_CONTEXT="https://purl.imsglobal.org/spec/case/v1p1/context/imscasev1p1_context_v1p1.jsonld"
NEW_CONTEXT="https://purl.imsglobal.org/spec/case/v1p0/context/imscasev1p0_context_v1p0.jsonld"

echo "🔧 Updating CASE context URLs..."

# Update framework
if [[ -f framework/it-solution-architect-framework.jsonld ]]; then
  sed -i "s|$OLD_CONTEXT|$NEW_CONTEXT|g" framework/it-solution-architect-framework.jsonld
  echo "✅ Updated framework document"
fi

# Update all skills
count=0
for file in skills/*.jsonld; do
  [[ -f "$file" ]] || continue
  sed -i "s|$OLD_CONTEXT|$NEW_CONTEXT|g" "$file"
  ((count++)) || true
done
echo "✅ Updated $count skill files"

# Add caseVersion to framework if missing
if ! grep -q '"caseVersion"' framework/it-solution-architect-framework.jsonld; then
  sed -i 's|"licenseURI": {|"caseVersion": "1.1",\n  "licenseURI": {|' framework/it-solution-architect-framework.jsonld
  echo "✅ Added caseVersion: 1.1 to framework"
fi

echo "✨ All files updated with valid CASE v1.0 context (compatible with v1.1)"
