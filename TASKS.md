# FIRSTMAG Parity Execution Tasks

## Wave 0 - Baseline Lock
- [x] Keep stabilization baseline intact (buildable and bundle-ready).
- [x] Create machine-readable parity tracker as single source of truth.
- [x] Freeze parity scope into core / advanced / optional vertical modules.

## Wave 1 - UX Middle Ground Foundation
- [x] Add legacy navigation map (old menu order reflected in modern shell).
- [x] Add legacy naming aliases in navigation/header.
- [x] Add keyboard parity profile (F-keys, Escape, scanner-first focus helper).
- [x] Add classic density mode toggle.
- [x] Add migration helper panel with dismiss/disable behavior.
- [x] Add configuration toggles in settings for the parity UX profile.
- [x] Align sales/purchase action wording with legacy workflow ("transformer en ...", settlement verification).

## Wave 2 - Core Transactional Parity
- [x] Sales lifecycle parity (quote/order/delivery/invoice/return + transform matrix + payment status control).
- [x] Purchase lifecycle parity (order/delivery/invoice/return + supplier payment status control).
- [x] Stock lifecycle parity completion (entry/exit/transfer + verification + barcode import support create/update/delete/confirm flows with runtime-stable selector behavior and transfer guardrails).
- [x] Stock reporting parity completed with backend aggregated article/depot summaries by period and initial/final stock calculations.
- [x] POS parity completion (payment line edit/delete, cheque detail capture, global discount controls, deferred/partial settlement status alignment, held-ticket hold/restore/restore-to-pay, restore-safe hold of current ticket, held-ticket context restore for customer+discount with backend customer refresh on restore, strict available-credit guard with disabled defer toggle when unavailable, projected customer balance update after partial settlement, and mixed-tender constraints with cash-only change computation implemented).
- [x] Cash lifecycle completion (open/close/movements/totals by register-cashier-period).

## Wave 3 - Reference/Master Data Parity
- [x] Add magasins, rayons, gondoles, caissiers, caisses (depots/magasins + caissiers + caisses + rayons + gondoles command/API/db parity shipped).
- [x] Add gammes, tariff/accounting categories, advanced tax tables.
- [x] Add country/parameter/organization parity structures.
- [x] Add nomenclature/BOM flows.
- [x] Add role/authorization matrix parity (role + permission backend commands, PIN login via DB users, permission-guarded navigation/routes, and admin UI matrix shipped).

## Wave 4 - CRM/Loyalty Parity
- [x] Extend customer profile to legacy commercial depth.
- [x] Add loyalty barcode/deferred discount workflows.
- [x] Add purchase-history KPIs and follow-up metrics.
- [x] Add complaints/reclamations module.

## Wave 5 - Reports/Analytics Parity
- [x] Build complete report inventory mapping legacy -> new.
- [x] Implement document print parity (sales/purchase/returns/periodic docs).
- [x] Implement settlement reports (cheque/traite/payment ledgers).
- [x] Implement stock/barcode movement reports.
- [x] Implement dashboard/query parity (top clients, turnover evolution, analysis views).

## Wave 6 - Hardware/Sync/Optional Verticals
- [x] Hardware configuration parity (scanner/display/drawer/printers/touch mode).
- [x] Fiscal integration parity (X/Z + PLU upload path).
- [x] Backup/restore + DB verification + scheduled/site communication.
- [x] External register article import/merge workflow.
- [x] Barcode label printing protocol support.
- [x] Optional vertical modules behind feature flags (restaurant/salon/fuel/customs/medical/budget/SMS).
