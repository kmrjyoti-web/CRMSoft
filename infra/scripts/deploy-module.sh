#!/bin/bash
set -e

MODULE=$1
VERSION=$2

if [ -z "$MODULE" ]; then
  echo "Usage: ./deploy-module.sh <module> [version]"
  echo "Modules: api, crm-admin, vendor-panel, marketplace, wl-api, wl-admin, wl-partner"
  exit 1
fi

# Module → deploy repo mapping
declare -A REPOS
REPOS[api]="crmsoft-api"
REPOS[crm-admin]="crmsoft-crm-admin"
REPOS[vendor-panel]="crmsoft-vendor-panel"
REPOS[marketplace]="crmsoft-marketplace"
REPOS[wl-api]="crmsoft-wl-api"
REPOS[wl-admin]="crmsoft-wl-admin"
REPOS[wl-partner]="crmsoft-wl-partner"

# Module → deploy path mapping
declare -A PATHS
PATHS[api]="/app/api"
PATHS[crm-admin]="/app/crm-admin"
PATHS[vendor-panel]="/app/vendor-panel"
PATHS[marketplace]="/app/marketplace"
PATHS[wl-api]="/app/wl-api"
PATHS[wl-admin]="/app/wl-admin"
PATHS[wl-partner]="/app/wl-partner"

# Module → PM2 process name
declare -A PM2NAMES
PM2NAMES[api]="crmsoft-api"
PM2NAMES[crm-admin]="crmsoft-crm-admin"
PM2NAMES[vendor-panel]="crmsoft-vendor-panel"
PM2NAMES[marketplace]="crmsoft-marketplace"
PM2NAMES[wl-api]="crmsoft-wl-api"
PM2NAMES[wl-admin]="crmsoft-wl-admin"
PM2NAMES[wl-partner]="crmsoft-wl-partner"

REPO=${REPOS[$MODULE]}
DEPLOY_PATH=${PATHS[$MODULE]}
PM2_NAME=${PM2NAMES[$MODULE]}

if [ -z "$REPO" ]; then
  echo "Unknown module: $MODULE"
  exit 1
fi

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║  DEPLOYING: $MODULE                                                 ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"

echo "1. Pulling latest from ${REPO}..."
cd $DEPLOY_PATH
git pull origin main

if [ -n "$VERSION" ]; then
  echo "   Checking out version: $VERSION"
  git checkout $VERSION
fi

echo "2. Installing dependencies..."
npm ci --production

echo "3. Building..."
npm run build

echo "4. Running migrations (if API)..."
if [[ "$MODULE" == "api" || "$MODULE" == "wl-api" ]]; then
  npx prisma migrate deploy
fi

echo "5. Restarting service..."
pm2 restart $PM2_NAME

echo "6. Health check..."
sleep 3

case $MODULE in
  api)          curl -sf http://localhost:3001/health > /dev/null && echo "✅ API healthy" ;;
  crm-admin)    curl -sf http://localhost:3005 > /dev/null && echo "✅ CRM Admin healthy" ;;
  vendor-panel) curl -sf http://localhost:3006 > /dev/null && echo "✅ Vendor Panel healthy" ;;
  marketplace)  curl -sf http://localhost:3007 > /dev/null && echo "✅ Marketplace healthy" ;;
  wl-api)       curl -sf http://localhost:3010/health > /dev/null && echo "✅ WL API healthy" ;;
  wl-admin)     curl -sf http://localhost:3009 > /dev/null && echo "✅ WL Admin healthy" ;;
  wl-partner)   curl -sf http://localhost:3011 > /dev/null && echo "✅ WL Partner healthy" ;;
  *)            echo "✅ $MODULE deployed (no health endpoint)" ;;
esac

echo ""
echo "✅ $MODULE deployed successfully"
