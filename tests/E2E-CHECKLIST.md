# E2E Test Checklist — FIRST MAG POS

## Prerequisites
- [ ] `cargo check` passes (no errors)
- [ ] `npm run build` passes
- [ ] SQLite DB initialized (auto-created on first run)

## 1. Authentication
- [ ] Login modal appears on app start
- [ ] Admin login (code: 1, PIN: 1234) succeeds
- [ ] Cashier login (code: 2, PIN: 0000) succeeds
- [ ] Wrong PIN shows error toast
- [ ] User name shown in header and sidebar
- [ ] Logout works from sidebar button

## 2. POS (Caisse)
- [ ] Register must be open to use POS (yellow banner if closed)
- [ ] Search articles by name shows results
- [ ] Search by barcode adds article directly
- [ ] Enter key selects first result
- [ ] Click article adds to ticket panel
- [ ] +/- buttons adjust quantity
- [ ] × button removes line
- [ ] "Annuler" clears entire ticket
- [ ] "Paiement" opens payment dialog
- [ ] Payment mode selector (cash/card/cheque/transfer)
- [ ] Cash: quick-amount buttons (Exact/+1/+5/+10 D) work
- [ ] Change displayed correctly
- [ ] Confirm payment creates document
- [ ] Receipt preview shown after payment
- [ ] "Ticket" button prints 80mm PDF receipt
- [ ] "Facture" button prints A4 PDF invoice
- [ ] "Nouveau" starts a new ticket
- [ ] F1 focuses search input
- [ ] F2 opens payment dialog
- [ ] Escape closes dialogs

## 3. Sales (Ventes)
- [ ] Lists invoice documents
- [ ] Detail panel shows document lines
- [ ] Transformer button changes status (quote→order→delivery→invoice)
- [ ] Confirmer button confirms draft
- [ ] Imprimer button prints invoice PDF

## 4. Articles
- [ ] Lists all articles
- [ ] Search/filter works
- [ ] Create new article
- [ ] Edit existing article
- [ ] Delete article
- [ ] Barcode field accepted

## 5. Partners (Tiers)
- [ ] Lists clients
- [ ] Create new partner
- [ ] Search by name works

## 6. Stock
- [ ] Shows stock levels per article
- [ ] Stock movements list loads

## 7. Reports (États)
- [ ] Rapport X button loads daily sales
- [ ] Rapport Z button loads daily sales
- [ ] On-screen preview shows totals
- [ ] Imprimer button prints PDF report
- [ ] Fermer closes preview

## 8. Settings (Config)
- [ ] Caisse tab: open/close session
- [ ] Fiscale tab: connect/disconnect COM port
- [ ] Fiscale tab: CPX→CPM→CPB test
- [ ] Fiscale tab: RSX/RSZ/RUz buttons
- [ ] Société tab: company info form
- [ ] TVA tab: displays tax rates
- [ ] Séries tab: document numbering

## 9. UI/UX
- [ ] Sidebar navigation works
- [ ] Sidebar auto-collapses on mobile nav
- [ ] Dark mode toggle persists across reload
- [ ] Toast notifications appear/disappear
- [ ] Status bar shows register state

## 10. Data Migration
- [ ] `cargo run --bin import_hfsql <db> <csvdir>` runs without error
- [ ] ARTICLE.csv imports correctly
- [ ] CLIENT.csv imports correctly
- [ ] CODEABARRE.csv updates barcodes
- [ ] ENTETE.csv + LIGNE.csv import documents
