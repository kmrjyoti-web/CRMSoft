# CRMSoft — Dev Commands
# Usage: make dev | make dev-crm | make dev-wl | make dev-api ...

.PHONY: dev dev-crm dev-wl kill \
        dev-api dev-admin dev-vendor dev-portal dev-marketplace \
        dev-wl-api dev-wl-admin dev-wl-partner \
        build build-api build-admin build-vendor build-portal build-marketplace \
        build-wl-api build-wl-admin build-wl-partner \
        test-api test-wl

CONCURRENTLY = npx concurrently

kill:
	lsof -ti tcp:3000,3005,3006,3007,3008,3009,3010,3011 | xargs kill -9 2>/dev/null; sleep 1

# ── Run all 8 services ─────────────────────────────────────────────────────────
dev: kill
	$(CONCURRENTLY) --kill-others-on-fail \
	  --names "API,ADMIN,VENDOR,PORTAL,MKT,WL-API,WL-ADMIN,WL-PARTNER" \
	  --prefix-colors "cyan,magenta,yellow,green,blue,red,white,gray" \
	  "make dev-api" "make dev-admin" "make dev-vendor" "make dev-portal" \
	  "make dev-marketplace" "make dev-wl-api" "make dev-wl-admin" "make dev-wl-partner"

# ── CRM stack only ─────────────────────────────────────────────────────────────
dev-crm: kill
	$(CONCURRENTLY) --names "API,ADMIN,VENDOR,PORTAL" --prefix-colors "cyan,magenta,yellow,green" \
	  "make dev-api" "make dev-admin" "make dev-vendor" "make dev-portal"

# ── WhiteLabel stack only ──────────────────────────────────────────────────────
dev-wl:
	$(CONCURRENTLY) --names "WL-API,WL-ADMIN,WL-PARTNER" --prefix-colors "red,white,gray" \
	  "make dev-wl-api" "make dev-wl-admin" "make dev-wl-partner"

# ── Individual services ────────────────────────────────────────────────────────
dev-api:
	cd Application/backend && npm run start:dev

dev-admin:
	cd Customer/frontend/crm-admin && pnpm dev

dev-vendor:
	cd Vendor/frontend/vendor-panel && pnpm dev

dev-portal:
	cd Application/frontend/customer-portal && pnpm dev

dev-marketplace:
	cd Application/frontend/marketplace && npm run dev

dev-wl-api:
	cd WhiteLabel/wl-api && npm run start:dev

dev-wl-admin:
	cd WhiteLabel/wl-admin && npm run dev

dev-wl-partner:
	cd WhiteLabel/wl-partner && npm run dev

# ── Builds ────────────────────────────────────────────────────────────────────
build-api:
	cd Application/backend && npm run build

build-admin:
	cd Customer/frontend/crm-admin && npm run build

build-vendor:
	cd Vendor/frontend/vendor-panel && npm run build

build-portal:
	cd Application/frontend/customer-portal && pnpm build

build-marketplace:
	cd Application/frontend/marketplace && npm run build

build-wl-api:
	cd WhiteLabel/wl-api && npm run build

build-wl-admin:
	cd WhiteLabel/wl-admin && npm run build

build-wl-partner:
	cd WhiteLabel/wl-partner && npm run build

build:
	$(CONCURRENTLY) --names "API,ADMIN,VENDOR,PORTAL,MKT,WL-API,WL-ADMIN,WL-PARTNER" \
	  "make build-api" "make build-admin" "make build-vendor" "make build-portal" \
	  "make build-marketplace" "make build-wl-api" "make build-wl-admin" "make build-wl-partner"

# ── Tests ─────────────────────────────────────────────────────────────────────
test-api:
	cd Application/backend && npm run test

test-wl:
	cd WhiteLabel/wl-api && npm run test
