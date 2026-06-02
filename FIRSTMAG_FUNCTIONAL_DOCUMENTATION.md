# FIRST MAG — Functional Documentation

> Reverse-engineering documentation for the **FIRST MAG** desktop application (a PC Soft WinDev product, distributed by SIMSOFT), built from the current on-disk artifacts. This document is the functional spec for a future rebuild in Rust.

---

## 1. Product Identity

| Field | Value |
|---|---|
| Product name | FIRSTMAG (FIRST MAG) |
| Publisher | SIMSOFT (SCD) — Tunisia |
| Internal code name | SCD |
| File version | 1.0.424.0 |
| Platform | Windows desktop |
| Framework | PC Soft WinDev 23 (code derived from WinDev 5.5 / 5.50 RAD project `SCD.WD5` / `SCD.WD7`) |
| Database engine | HFSQL Classic (HyperFile Classic), file-per-table, binary `.FIC`/`.NDX`/`.MMO` |
| UI languages | French, English, German, Dutch, Portuguese (`.WQP` translation files) |
| Active data path | `C:\ProgramData\FIRSTMAG` |
| Main executable | `D:\hamma\FIRSTMAG\FIRSTMAG.exe` (104 MB debug build) |
| Nested executable | `D:\hamma\FIRSTMAG\FIRSTMAG\FIRSTMAG.exe` (46 MB release build) |

The product is a **multi-store, multi-cashier retail management suite**: back-office (articles, customers, suppliers, sales/purchase documents, stock movements, multi-depot inventory) plus a full POS/cash register module and a built-in reporting engine.

---

## 2. Source Artefacts Inventory

### 2.1 Application folder — `D:\hamma\FIRSTMAG`

**Executables and libraries:**
- `FIRSTMAG.exe` (104 MB — debug build with symbols), `First mag.exe`
- `Scd.wdl` — compiled WinDev library
- `Scd.wx`, `Scd.wdl`, `Scd.wdd` — WinDev manifest and analysis
- `FIRSTMAG.wx` — data path manifest
- `FIRSTMAG.env` (13,928 bytes) — environment variables for reports module
- `FIRSTMAG.REP` — HFSQL analysis metadata (logical file list)
- `Scd.wd7/scd.WDD` — original analysis description (binary schema, 415 KB)
- `WD230*.DLL` — WinDev 23 runtime (comm, controls, DB, objects, OLE, PDF, RTF, XLS, XML, ZIP)
- `WD551*.DLL`, `WD553*.DLL` — WinDev 5.5/5.5B legacy runtimes
- `WDJournal.exe/.wx`, `WDTrans.exe/.wx`, `WDSQL.exe/.wx`, `WDOptimiseur.exe/.wx`, `WDConver.exe` — bundled WinDev tools
- `INSTALL.EXE`, `INSTALL.ZIP`, `WDUNINST.EXE`, `uninst.inf` — installer/uninstaller
- `FIRSTMAG.lnk` — shortcut

**Support files:**
- `CAISSIER.TXT`, `DEPARTEMENT.TXT`, `TAXE.TXT`, `ENTETE.TXT` — config text dumps
- `PLU.TXT`, `PLU.CSV`, `OLYMPIAPLU.TXT` — article catalogue exports for fiscal printer
- `HATEM.TXT` — sample data dump
- `user.FIC.txt` — user records with permission matrix
- `QDRIVER.LOG`, `QDRIVER.TXT`, `QDRIVER.CMD` etc. — fiscal printer session logs and scripts
- `CCSauvegarde.log`, `WDJournal.log` — backup logs
- `WD5HTML.HTM` — old WinDev 5 HTML report export
- `WDGEN.TXT` — WinDev generated source (one window)
- `SIM.FIC`, `DECLARATION.SIM` — state and customs declaration data
- `RSIM104.SIM`–`RSIM115.SIM` — older SIM snapshots
- `CERTIFY.BVD` — fiscal certification file (Tunisian tax authority)
- `FIRSTMAG.ICO`, `FIRSTMAG.zip`, `FIRSTMAG.jpg` — branding

**Subdirectories:**

| Directory | Contents |
|---|---|
| `Etats et Requêtes/` | 50+ compiled WinDev reports (`.wde`), report cache (`.cpl`), logos, `FIRSTMAG.env` |
| `Etats et Requêtes Partagés/` | Shared reports — contains only `XX12.wde$` (lock file) |
| `FIRSTMAG/` | Compact deployment: 46 MB release exe, WX, link, Declaration.SIM, SQL CE |
| `INSTALL/` | Installer ZIP packages (see §11) |
| `Sauvegarde/` | Full application backup: 104 MB exe, all WX files, REP, SIM, installers |
| `scd.wd7/` | Contains `scd.WDD` (analysis source, 415 KB) |
| `_chm_WDJournal/` | Extracted WDJournal.chm help |
| `_chm_WDSQL/` | Extracted WDSQL.chm help |
| `_chm_WDTrans/` | Extracted WDTrans.chm help |
| `_odbc_pkg/`, `_odbc_unpack/`, `_odbc32_payload/`, `_odbc64_payload/` | Staged ODBC driver installation |
| `_odbc_extracted/`, `_odbc_extracted2/` | Empty — cleaned after extraction |
| `_oledb_pkg/` | Staged OLE DB provider |
| `_restored_backup/` | Old HFSQL data restore (subset model — 28 `.fic` tables) |

### 2.2 Reports folder — `D:\hamma\FIRSTMAG\Etats et Requêtes`

50+ compiled WinDev reports (`.WDE`):

| Report file | Purpose |
|---|---|
| `FACTURE_VENTE.wde` | Sales invoice (main layout) |
| `FACTURE_VENTE3.wde` | Sales invoice (v3) |
| `FACTURE_VENTE3(model1).wde` | Sales invoice (v3 model 1) |
| `FACTURE_VENTEPERIDIQUE.wde` | Periodic sales invoice |
| `FACTURE_DE_RETOUR.wde` | Credit note (client) |
| `facture d'achat.wde`, `facture d'achat2.wde` | Purchase invoice |
| `BON_DE_COMMANDE.wde` | Sales order |
| `bondecommandeACHAT.wde` | Purchase order |
| `bon_de_livraison.wde` | Delivery note |
| `BONACHAT1.wde` | Purchase order (alt) |
| `DEVIS.wde` | Quote |
| `analclient.wde` | Client analytics |
| `analfr.wde` | Supplier analytics |
| `STATCLIENT1_1_10.wde` | Client statistics |
| `statistique.wde` | Statistics |
| `cheque.wde`, `chequeC.wde` | Cheque (FR and custom) |
| `TRAITE.wde`, `TRAITEC.wde` | Bill of exchange |
| `codeabarre128.wde` | Barcode 128 label |
| `mouvement de stock.wde` | Stock movement report |
| `mouvcl12.wde` | Client movement |
| `mouvfr.wde`, `mouvfr12.wde` | Supplier movement |
| `mvssr.wde` | Stock movement SR |
| `relvcl.wde` | Client statement |
| `RS.wde`, `RS1.wde`, `RSv.wde` | Statement (Recap/Relevé) |
| `serapv.wde`, `serapv1.wde`, `SERVAP.wde` | Service APV |
| `testbl.wde` | Test delivery note |
| `XX.wde` | Generic/unknown |

Shared assets: customer logos (SMDS, LG, TCL, Samsung, Condor, Huawei, MAMINOX, SimSoft), report cache `FIRSTMAG.cpl`, environment `FIRSTMAG.env`, style `FIRSTMAG.sty`, performance log `HstDuree.log`.

### 2.3 Data folder — `C:\ProgramData\FIRSTMAG`

- ~290 HFSQL `.FIC` files, plus `.NDX` (indexes) and `.MMO` (memos)
- Subfolder `BB/` — empty (may be used at runtime for temporary backup branches)
- `SIM.FIC` (current state table) + `Declaration.SIM` (customs declaration table) — only 2 SIM files exist (no SIM1–143 series)
- `FIRSTMAG.exe`, `FIRSTMAG.lnk`, `FIRSTMAG.REP`, `FIRSTMAG.wx` — data-folder-level app instances
- `Microsoft.SqlServer.Compact.400.64.bc` — SQL CE 4.0 database (embedded, coexists with HFSQL)
- Snapshot backups (`Sauvegarde des données de Exe (12-05-2007 19.56)`)

---

## 3. Technical Fingerprint

- Application family: **WinDev business application** (`.wx`, `.wdl`, `.wdw`, `.wde`, `wd230*.dll`)
- DB layer: **HFSQL Classic** (file-per-table). `FIRSTMAG.env` `[LIVEDATAOK_]` inventory lists **274 logical tables**; on-disk `.FIC` count is ~290 (includes `.NDX`/`.MMO` companions and snapshot files).
- Multilingual: 5 languages with `.WQP` translation sources.
- Touch screen: `EcranTactile.WDK`.
- Fiscal register integration: **QDRIVER** — CASIO/Epson-class protocol over RS-232 at 57600 baud.
- Kitchen printer: `IMPRIMENTECUIS.FIC` / `imprimentecuisine.fic`.
- Restaurant / salon de thé mode referenced in config.
- Coding style: French WinDev RAD output (`Ouvre`, `si…alors`, `TableAffiche`, `HLitPremier`).
- Architecture: monolithic SDI with side panels; multiple project libraries (`Scd.wdl`, `Ajout d'un document stock.wx`).

---

## 4. Data Model

The complete model is in `Scd.wd7/scd.WDD` and `FIRSTMAG.REP`. The `FIRSTMAG.env` `[LIVEDATAOK_]` section inventory confirms **274 table names** (below is the entity catalog from on-disk `.FIC` files, REP localizations, screen dumps, and the env inventory).

### 4.1 Reference / master data

| Table | Purpose |
|---|---|
| `ARTICLE` | Products: code, design, family, sub-family, purchase HT/TTC, margin, conditionnement, sale unit, barcode, PLU, type, 3 tax rates, weight unit, net weight, avg sale/cost price, gamme, image |
| `ARTICLE2`, `ARTICLEx`, `ARTICLE_1`, `ARTIMPORT` | Article staging / import / export variants |
| `ARTTRACE` | Article traceability / serial numbers / lots |
| `ARTDpt` | Article ↔ Department/deposit link (multi-depot pricing/stock) |
| `ARTDptSG`, `ARTDptSGx`, `ARTDptSGy`, `ARTDpty` | Sub-gamme and variant-level article-depot rows |
| `ARTSGAMM` | Sub-gammes (article variants / packs) |
| `artcais` | Articles per cash register (POS-specific catalogue) |
| `ARTFac` | Invoiced article history |
| `ARTtapis` | Check-out belt article list |
| `BLVART` | Delivery-note line history |
| `bonART`, `bon_c_cl` | Ordered articles / customer orders |
| `BONACH`, `bonch`, `prep bc` | Purchase order headers / pre-purchase orders |
| `BONDACHATCNAM` | CNAM (Tunisian health insurance) purchase order variant |
| `B_CART`, `B_CD`, `B_liv_fr`, `B_CD_fr` | Purchase document lines (cart, CD, delivery, CD-fr) |
| `B_LVR` | Delivery-note header |
| `Ligneseie` | Seized/saisie intermediate lines |
| `cliart`, `clibao` | Client-article / client-bank-account links |
| `Devart` | Quote lines |
| `Devis` | Quotes |
| `entete` | Generic document headers |
| `ligne` (+ `.mmo`) | Main document line table |
| `LIGNE_FCT`, `LIGNE_BC`, `LIGNE_BL`, `LIGNE_DV`, `LIGNE_FC` | Per-document-type line tables (Fct=Function, BC=Bon Commande, BL=Bon Livraison, DV=Devis, FC=Facture) |
| `LIGNE_FACTX`, `LIGNE FACTX` | Special invoice lines (FactX) |
| `LIGNEtable` | Restaurant table lines |
| `LIGNEbrT`, `LIGNEPOCH` | Return / pochette lines |
| `ligne mouvement entree stock`, `ligne mouvement sortie stock` | Stock movement lines |
| `ligne virement depot a depot` | Inter-depot transfer lines |
| `ligne bon de retour`, `ligne facture d'avoir` | Return / credit-note lines (client + supplier) |
| `LIGGAMME` | Gamme (variant) lines |
| `bonliv` | Delivery-note header |
| `Facture` | Sales invoice header |
| `Facture attente` | Pending invoice |
| `Fact_fr`, `facture d'avoir`, `facture d'avoir fournisseur` | Supplier invoice, client/supplier credit notes |
| `FactureT` | Periodic invoice |
| `Facturetable` | Restaurant table invoice |
| `FactureX`, `LIGNE_FACTX` | Special FactX invoice + lines |
| `bon de retour client` | Customer return header |
| `Rendu`, `retourc`, `RetourcT` | Returns / rendered lines |
| `regclien`, `RegclienT` | Customer payment/settlement |
| `regl_frs` | Supplier payment/settlement |

### 4.2 Partners

| Table | Purpose |
|---|---|
| `CLIENT` (+ `.mmo`) | Customer master: identity, fiscal info, tariff category, payment model, deposit/shipping, currency, comment, credit limit, loyalty barcode, birth/marriage dates, spouse/children, deferred discount, last invoice/purchase, purchase history per year/month, **family situation** (CRM-heavy) |
| `CLIFAM` | Client ↔ family grouping |
| `CLTRACE` | Client trace (history) |
| `cont_clt` | Client contacts |
| `TRCLIENT` (+ `.mmo`) | Client trace / translation |
| `FSSEUR` | Supplier master: reference, name, contact, account, quality, address, fiscal info, fiscal stamp, article-linked discount lines, statistics |
| `compleme`, `compleme_1` | Complementary info |
| `RESPBLE` | Person in charge (deposit manager) |
| `PAYS` | Countries |
| `Contact` | Generic contact book |

### 4.3 Stock and warehouses

| Table | Purpose |
|---|---|
| `Dptstock` | Deposit master (indexed by COD_DPT, ADRESSE, COD_RESPBLE) |
| `MAGASIN` | Store master |
| `RAYON` | Section / aisle |
| `Gondole` | Shelf (gondola) layout |
| `etager` | Shelves/levels |
| `tradepot` | Deposit translations |
| `Nomen` | Bill of materials (recipes/assemblies) |
| `Collecti` | Collection / assortment |
| `Liaison` | Link/pairing table |
| `CARLIGVENTE` | Cart ↔ sale line |
| `Carciterne`, `CarGroupe`, `Carpistolet`, `Carponpe`, `Carponpiste`, `Carvanete` | Fuel-station module: tanker card, group card, pistol card, pump card, pump lane card, forecourt card |

### 4.4 Pricing, taxes, units

| Table | Purpose |
|---|---|
| `TARIF` | Pricing |
| `CATTARIF` | Pricing category |
| `categori` | Article category |
| `TAUXTAX` | Tax rate |
| `Taux_Tax` | Tax rate (current naming) |
| `TAUX_TX2` | Tax rate 2 |
| `TVA` | VAT table |
| `XTAUXTVA` | VAT rate extended/snapshot |
| `UNITE` | Unit of measure |
| `DEVISE` | Currency |
| `DEVsoc` | Company currency |
| `Frais` | Fees / surcharges |
| `comiss1`, `comiss2`, `comiss3`, `comiss4`, `commissi` | Commission tiers |
| `remff` | Remise fournisseur (supplier discount) |

### 4.5 Point of Sale / Cash register

| Table | Purpose |
|---|---|
| `CAISSE` | Cash register master |
| `CAISSIER` | Cashier master |
| `CAICAI` | Cashier ↔ register link |
| `CHIFCAIS` | Cash totals per register |
| `Fondcais` | Cash float / opening fund per session |
| `Mouv_cai`, `mouv_cai` | Cash movement journal |
| `artcais` | Articles per cash register |
| `paracais` | Cash register parameters |
| `ticket`, `HTIKET` | Tickets / held tickets |
| `temp`, `tempscd` | POS temporary working files |
| `ppostes` | POS posts / workstations |
| `Parampoint` | POS parameters |
| `Inerface` | Interface/integration parameters |
| `Configuration` | System configuration |
| `palmencour` | Palm / handheld running list |
| `serapv*`, `SERAPV` | Service APV tables |
| `RS*` | Recap/statement tables |

**X/Z-Report working tables** (POS day-end processing):

| Prefix | Purpose |
|---|---|
| `X*` (e.g. `Xcaiart1`, `Xcai_cai`, `Xtr`) | Mid-day / extract snapshot |
| `Z*` (e.g. `Zcaiarre`, `Zcaiart1`, `Zcai_cai`) | End-of-day / closing report |
| `w*` (e.g. `w_cai_R`, `w_cai_tik`, `wFacture`) | Working set during the day |
| `z*` (e.g. `zcai_tik`, `zfondcai`, `zmouv_ca`) | End-of-day snapshot (alt naming) |

This is the classic retail POS "X-report / Z-report" pattern.

### 4.6 Restaurant / café module

| Table | Purpose |
|---|---|
| `Tables` | Physical restaurant tables |
| `Groupes` | Staff groups |
| `LIEU`, `LIEU_LVR` | Place / delivery place |
| `PERSONNE` | Staff members |
| `TACHE`, `TYPE` | Task and type |
| `JOURFERIE` | Public holidays |
| `Facturetable` | Table invoice |
| `LIGNEtable`, `Detlignetab`, `DetailTab` | Table order lines and detail |
| `IMPRIMENTECUIS`, `imprimentecuisine` | Kitchen printer (both spellings exist — typo preserved in code) |

### 4.7 Medical / RH module

| Table | Purpose |
|---|---|
| `MEDCIN` | Doctor master |
| `VISITEMEDICAL` (+ `.mmo`) | Medical visit record |
| `PERSONNE` | Staff / employees |
| `TACHE` | Task assignment |
| `JOURFERIE` | Public holidays |

### 4.8 Bank, payments, settlement

| Table | Purpose |
|---|---|
| `BANQUE`, `BANQUE_f` | Bank master (standard + function variant) |
| `MDL_RGLT` | Payment model/settlement template |
| `CLIBAO` | Client bank account |
| `Paramcheque` | Cheque print parameters |

### 4.9 Reports / analytics data

| Table | Purpose |
|---|---|
| `rapport1`–`rapport10` | Report data tables |
| `rapport1x`–`rapport6x` | Report variants |
| `rappor4x` | Report 4 variant |
| `etat`, `etetetat` | State tables |
| `lignetat` | State lines |
| `statarti`, `statarti_a` | Article statistics |
| `STATCLT` | Client statistics |
| `statfr` | Supplier statistics |
| `Glossaire` | Report glossary |
| `REQ_*` | Saved queries (seen in existing scan: REQ_CAMois, REQ_CAAnn, REQ_Top5Clients, etc.) |

### 4.10 Customer complaints

| Table | Purpose |
|---|---|
| `Reclamation` | Complaint header |
| `RECLAD` | Complaint address |
| `Detreclam`, `Detreclamt` | Complaint detail lines |

### 4.11 Audit / history (`h*` prefix)

| Table | Purpose |
|---|---|
| `hARTICLE` (+ `.mmo`) | Article change history |
| `hARTSGAMM` | Article-sgamme history |
| `hARTDpt`, `hARTDpt SOUS GAMME_1` | Article-depot history |
| `hCLIENT_1` | Client change history |
| `hcomiss1`, `HCOMISS2` | Commission history |
| `hTAUXTAX`, `hTaux_Tax` | Tax rate change history |
| `hvirement depot a depot_1`, `h ligne virement depot a depot` | Transfer history |
| `HTIKET` | Ticket history |
| `Mouchf`, `Mouchsup` | Tamper-proof audit log ("mouchard") + supervisor log |

The app maintains a **full change log** for articles, clients, taxes, commissions, and stock transfers. This audit trail must be replicated.

### 4.12 Additional tables

| Table | Purpose |
|---|---|
| `BUDGET1` | Budget module |
| `Souche` | Document number series |
| `FSSEUR` | Supplier commission |
| `Substitu` | Article substitution rules |
| `Validiteart` | Article validity period |
| `codeabarre` | Barcode records |
| `Impcodeb` | Barcode print parameters |
| `sms1`, `SMS2` | SMS templates / sent messages |
| `FONCB` | Function B |
| `FCTMDL`, `MDL_ART`, `MDLFac`, `FCTART` | Module function/article/invoice templates |
| `CPTCOMPT` | Accounting account |
| `pascompt` | Accounting password |
| `nomen` | Nomenclature (BOM) |
| `douchett` | Scanner/customer-display/cash-drawer COM port settings |
| `EcranTactile` (`.WDK`) | Touch screen component |
| `Serveur` | Server / site-to-site sync settings |
| `LIAISON` | Cross-document link |
| `Date` | Date utilities |
| `Palmencour` | Handheld (Palm) running list |
| `preimpti` | Pre-printed |
| `contrebo` | Counter-bon |
| `pochette` | Envelope/pocket |
| `Euro1` | Euro conversion (legacy) |
| `H ligne virement depot a depot` | Transfer history line |

---

## 5. Confirmed Modules

### 5.1 Master data

- Articles (multi-tax, multi-unit, image, variants, traceability, conditionnement)
- Familles / sous-familles (product hierarchy)
- Gammes / sous-gammes (variants)
- Catégories tarifaires / comptables
- Rayons / gondoles / étagères (merchandising layout)
- Unités de mesure
- Taxes (3 rates per article)
- Devises, Pays
- Fournisseurs, Clients (full CRM), Vendeurs, Caissiers, Caisses, Postes, Banques, Modes de paiement, Dépôts / magasins

### 5.2 Sales back-office

Document lifecycle: `DEVIS` (quote) → `BON DE COMMANDE` (order) → `BON LIVRAISON` (delivery) → `FACTURE` (invoice) → `FACTURE_VENTEPERIDIQUE` (periodic) / `FACTURE_DE_RETOUR` (credit note)

Features: create, modify, delete, print/reprint, transform to next stage, search by code/date, sort by date/client, verify payments, generic transform + specific transforms (from quote, from delivery).

### 5.3 Purchase back-office

Document lifecycle: `BON COMM ACH` (order), `BON LIV ACH` (delivery), `FACTURE ACHAT` (invoice), `FACTURE RETOUR ACHAT` (credit note), `BONDACHATCNAM` (CNAM variant)

Features same as sales plus supplier payment verification.

### 5.4 Stock and warehouse

- Stock entry / exit / inter-depot transfer
- Stock verification / inventory
- Stock reports
- Barcode-driven stock import
- Multi-depot support (`ARTDpt`)

### 5.5 Point of Sale / Cash register

- Register opening (caisse + caissier + password + opening fund)
- Counter sale / ticket entry
- Held ticket / suspended sale
- Multiple payment modes per ticket
- Amount and percent discount
- Deferred discount
- Cheque printing
- Ticket printing
- Customer balance display
- Cash movement journal
- Reports: by article / register / cashier / time range
- X/Z reports (`X*` / `Z*` table pattern)
- Touch screen mode
- Restaurant / table mode
- Salon de thé mode

### 5.6 CRM and loyalty

Customer master supports: tariff category, payment model, credit limit, loyalty barcode, birth/marriage dates, family situation, spouse/children, deferred discount, last invoice/purchase dates, purchase history, visits, reclamations, top-client queries.

### 5.7 Reports and analytics

- 50+ WinDev reports (invoice, credit note, delivery, order, cheque, barcode, statistics, movement)
- Dashboard views (`FI_EvolutionCA`, `FI_Indicateurs`, `FI_RechercheClients`, `FI_RechercheProduits`, `FI_Volet_TCD_Ventes`)
- Client / supplier analytics
- Periodic invoicing reports
- Cheque / TRAITE reports

### 5.8 Configuration and maintenance

- Touch screen, barcode, ticket layout, kitchen printer, scanner/cash drawer, cheque print
- Database verification (server vs client)
- Site-to-site communication (`Serveur`, `Mouchf`, `Mouchsup`)
- Import from external register (`QDRIVER`)
- Backup/restore (`WDJournal`, `CCSauvegarde`)

### 5.9 Industry-specific modules

| Module | Evidence |
|---|---|
| Restaurant / salon de thé | `Tables`, `LIEU`, `Groupes`, `PERSONNE`, `JOURFERIE`, `TACHE`, `TYPE`, `IMPRIMENTECUIS`, `Facturetable`, `LIGNEtable` |
| Kitchen printer | `IMPRIMENTECUIS.FIC` / `imprimentecuisine.fic` |
| Fuel station | `Carciterne`, `CarGroupe`, `Carpistolet`, `Carponpe`, `Carponpiste`, `Carvanete`, `CARLIGVENTE` |
| Customs declaration | `Declaration.SIM` |
| Medical / occupational health | `MEDCIN`, `VISITEMEDICAL` |
| SMS | `sms1`, `SMS2` |
| Cheque printing | `cheque.wde`, `chequeC.wde`, `Paramcheque` |
| Barcode labels | `codeabarre128.wde`, `Impcodeb` |
| CNAM purchase | `BONDACHATCNAM` |
| Article label printing (INTART) | `INTART.CMD` + `COMMAND=D10000` |
| Budget | `BUDGET1` |

---

## 6. Screens

From `WDGEN.TXT` (depot selection `DP_VIS`):

- Fields: `__RECH1` (Cod dépôt, key `COD_DPT`), `__RECH2` (Adresse, key `ADRESSE`, 40 chars), `__RECH3` (Cod responsable, key `COD_RESPBLE`)
- Table columns: `COD_DPT`, `ADRESSE`, `TEL`, `CONTACT`, `COD_RESPBLE`
- Buttons: `VALIDE` (validate), `ANNULE` (cancel), `NOUVEAU` (opens `DP_FIC` in creation mode)

From `user.FIC.txt`:

- `CODE_USER`, `NOM`, `MOTPASSE` (password)
- 9 module-level permission flags
- 17 function-level flags
- 22 detail-level flags
- 28 cash-level flags
- 4 miscellaneous flags
- Per-cashier sub-mode flags

---

## 7. Business Flows

### 7.1 Reference setup
Create families, sub-families, gammes, taxes, units, currencies, depots, magasins, rayons, gondoles, suppliers, clients, articles, payment modes, cash registers, users.

### 7.2 Sales document lifecycle
Open sales area → choose document type (devis/BC/BL/facture/avoir) → fill client + lines → print/save → transform to next stage → verify payment → print final → view history.

### 7.3 Purchase document lifecycle
Same flow as sales but with supplier-side documents.

### 7.4 Stock movement lifecycle
Open stock documents → choose entry/exit/transfer → choose depot(s) → validate → print → verify/inventory.

### 7.5 POS / counter sale
Cashier opens session → scan/enter articles → modify/delete lines/hold ticket → apply discounts → enter payment → print ticket → run X/Z reports.

### 7.6 Customer loyalty
Create customer → assign barcode + tariff + discount → track purchases → review history → top-client analytics.

### 7.7 Reporting
Print predefined reports → view dashboards (turnover, top clients, search, pivot).

### 7.8 Fiscal register session
Push PLU catalogue (`QDRIVERPLU.CMD`) → print labels (`INTART.CMD` via `D10000`) → run day → pull X reports mid-day (`QDRIVERRX.CMD` via `RSX000001`–`RSX000006`) → pull Z reports at close (`QDRIVERR.CMD` via `RSZ000001`–`RSZ000006`) → read journal (`JOURNAL.CMD` via `RUz1010004` + `TSYSTEM`).

---

## 8. Likely User Roles

From the user/permission matrix:

- **Administrator** (code 01, "ADMINISTRATEUR", password "5533"): full access
- **Director General** (code 02, "DG", password "YASMINE"): near-full, some restrictions
- **Cashiers** (codes 03–08, "CAISSE RDC/RDC 1ER/2EME/3EME"): restricted to POS functions
- **Manager** (code 06, "Manager 6"): between admin and cashier
- **Trainee** (code 07, "Ecole 7"): limited access

Permissions are a flat boolean matrix controlling access to specific functions and registers.

---

## 9. Hardware and External Integrations

| Integration | Evidence |
|---|---|
| Barcode scanner (douchette) | `Douchett` table (COM port) |
| Customer display | Port setting in `Douchett` |
| Cash drawer | Port setting in `Douchett` |
| Fiscal/receipt printer (CASIO/Epson) | `QDRIVER.*` files (see §10) |
| Article label printer (INTART) | `INTART.CMD`, `COMMAND=D10000` |
| Cheque printer | `cheque.wde`, `chequeC.wde`, `Paramcheque` |
| Kitchen printer | `IMPRIMENTECUIS.FIC` |
| Touch screen | `EcranTactile.WDK` |
| Barcode label printer | `codeabarre128.wde`, `Impcodeb.FIC` |
| Electronic scale / balance | Part of fuel-station module |
| External register import | `QDRIVER` PLU upload protocol |
| Site-to-site sync | `Serveur`, `Mouchf`/`Mouchsup`, `WDTrans.exe` |
| SMS gateway | `sms1`, `SMS2` |
| Fiscal certification | `CERTIFY.BVD` (Tunisian tax authority) |

---

## 10. Fiscal Register Protocol (QDRIVER — CASIO/Epson Class)

The app uses `QDRIVER.EXE` to communicate with an external fiscal/receipt printer (CASIO or Epson-compatible) over RS-232 at 57600 baud. Eight command files define the protocol:

### 10.1 Confirmed session workflow

From `QDRIVER.LOG`, a successful fiscal session follows:

```
START → ABORT (clear log) → BAUDRATE=57600 → PORT=1 → REGISTER=1 → CPX (clear) → UPLOAD plu.csv → CPM → CPB → END
```

Protocol version: `<1.13>`, COM1, 57600 baud.

### 10.2 Command files

| File | Commands | Purpose |
|---|---|---|
| `QDRIVER.CMD` | CPX, upload plu.csv, CPM, CPB | Push PLU catalogue to register |
| `QDRIVERP.CMD` | D10000 | Print article labels / shelf tags |
| `QDRIVERPLU.CMD` | upload plu.csv, CPM, CPB | PLU push only |
| `QDRIVERR.CMD` | RSZ000001 → RSZ000006 | Read 6 Z-reports (per department) |
| `QDRIVERRX.CMD` | RSX000001 → RSX000006 | Read 6 X-reports (per department) |
| `JOURNAL.CMD` | RUz1010004, TSYSTEM | Read fiscal journal + system status |
| `INTART.CMD` | D10000 | Article label print (same as QDRIVERP) |
| `MAJPLU.CMD` | upload plu.csv, CPM, CPB | PLU update (MAJ = Mise À Jour) |

### 10.3 Command reference

| Command | Meaning |
|---|---|
| `CPX` | Clear / Cancel transaction |
| `CPM` | Cash Program Memory (flush programming) |
| `CPB` | PLU Buffer flush |
| `D10000` | Display/Print — article label command (10000 = format/article range) |
| `RSZ000001` | Read Z-report, department 1 (RS=Read Report, Z=Z-type, 000001=dept) |
| `RSX000001` | Read X-report, department 1 |
| `RUz1010004` | Read Unit(ary) Journal, format z, parameters 1010004 |
| `TSYSTEM` | Test system (register status) |
| `UPLOAD=plu.csv` | Upload CSV file to register |
| `NEWFILE=<name>` | Local output file for register response |
| `BAUDRATE=57600` | RS-232 baud rate |
| `PORT=1` | COM port 1 |
| `REGISTER=1` | Register number 1 |
| `CLEARLOG=1` | Clear log before session |
| `ABORT=1` | Abort on error |
| `RESULT=1` | Display result |

### 10.4 X/Z report output format

The `RAPPORT*.TXT` files in the app folder are **fiscal register outputs** (not WinDev report definitions). They are pulled by `QDRIVERR.CMD` / `QDRIVERRX.CMD` and saved as semicolon-separated text with the following line-type structure:

| Type | Line example | Meaning |
|---|---|---|
| Header | `0;0;0;0;1;"Periode : Standard";"Z";"khalil allah"` | Period label, Z/X type, cashier |
| Sale line | `1;1;1;2;1;"JUST PRIX";1;2;100,000;0;;;;` | Dept/category codes, label, qty, amount |
| Payment line | `1;1;1;6;1;"ESPECES";12;;49,890;;;;;` | Payment mode ("CASH"), qty, amount |
| X-counter | `0;0;0;0;4;"X-Compteur  :000004";4` | Current X counter |
| Z-counter | `0;0;0;0;5;"Z-Compteur  :000128";128` | Current Z counter |
| Date | `0;0;0;0;6;"Jeudi 13-10-2005";"12:26:32";7` | Day, date, time, day-of-week |
| End | `0;0;0;0;0;"Terminé!";0` | End of report |

RAPPORT files with `X` suffix (e.g. `RAPPORT1X.TXT`) are X-reports (mid-day). Files without suffix are Z-reports (end-of-day). Zero-length files were never pulled. `RAPPORT4X.TXT` (3702 bytes) and `RAPPORT24.TXT` (3495 bytes) contain detailed transaction-level data.

### 10.5 PLU upload format

The PLU CSV (`PLU.CSV`, `PLU.TXT`, `OLYMPIAPLU.TXT`) is a fixed-position comma/semicolon-separated file:

```
article_code;barcode;name;family;subfamily;...;purchase_price_HT;sale_price;margin;...
```

A full dump in `OLYMPIAPLU.TXT` contains 5000 PLUs (`plu3001`–`plu5000`) used for register pre-population.

---

## 11. Installer and Distribution

The `INSTALL` folder and `INSTALL.ZIP` contain the original deployment packages:

| Package | Size | Contents |
|---|---|---|---|
| `__WDINST.ZIP` | 185 MB | WinDev 23 runtime (the entire runtime installation) |
| `_ODBC.ZIP` | 64 MB | HFSQL ODBC driver |
| `_FRAMEWORK.ZIP` | 23 MB | .NET Framework runtime installer |
| `_MODAUTO.ZIP` | 4.8 MB | WinDev 23 "Mode Auto" runtime DLLs (`wdmod230.dll`, `wd230uni.dll`, `wd230rpl.dll`) + embedded analysis (`EXE0073/scd.wdd`) |
| `_OLEDBHF.ZIP` | 70.7 MB | OLE DB provider for HFSQL |
| `_ER.ZIP` | 276 MB | Etats et Requêtes (reports/query package — largest package) |

The `_MODAUTO.ZIP` contains the **WinDev auto-execution runtime** (`wdmod230.dll`, `wd230uni.dll`, `wd230rpl.dll`) plus a copy of the compiled analysis (`scd.wdd` at path `EXE0073/`). It is NOT additional business modules — it is the framework that enables the `FIRSTMAG.exe` to run without the full WinDev development environment. The `.NET ZipFile` API reports 0 entries (possibly a ZIP-encoding quirk), but manual central-directory parsing confirms 4 files with a total uncompressed size of ~10.5 MB.

---

## 12. Backup and Restore

From `CCSauvegarde.log` and `WDJournal.log`:

1. Lists every `.fic`, `.ndx`, `.mmo` to back up (one line per file)
2. Generates a temporary archive (`WDJournal*.WDZ`)
3. Compresses the archive
4. Copies to destination
5. Creates identification files
6. Marks backup successful

The `Sauvegarde/` folder is a **complete application backup** containing: 104 MB debug exe, all `.wx` files, `FIRSTMAG.REP` (dated 2026-05-25 — same as live data), `SIM.FIC` (2023-02-14), `DECLARATION.SIM`, all WinDev tools, `uninst.inf`, and `INSTALL.ZIP`. Plus legacy files: `CERTIFY.BVD`, `CADRAN.BAK`, `CHOIXDAT.BAK`, `CIRC3.VBX` (VB3 control), `FAX.ICO`, `DECORCAM.PCX`, `CCMenu.WDK`.

The nested `Sauvegarde/FIRSTMAG/` folder contains a **compact release deployment**: 46 MB release exe (44.1 MB on disk), `Declaration.SIM` (1653 bytes, slightly different timestamp from the main copy), and `.DS_Store` (Mac artifact). This is the clean compiled build without debug symbols.

A rebuild should produce an equivalent backup/restore mechanism.

---

## 13. Executable Size Analysis

| Location | Size | Implication |
|---|---|---|
| `D:\hamma\FIRSTMAG\FIRSTMAG.exe` | 104,272,384 (104 MB) | Debug build — likely contains WinDev debug symbols (procedures, variable names) |
| `D:\hamma\FIRSTMAG\FIRSTMAG\FIRSTMAG.exe` | 46,260,224 (46 MB) | Release build — smaller, no debug symbols |
| `D:\hamma\FIRSTMAG\Sauvegarde\FIRSTMAG.exe` | 104,272,384 (104 MB) | Same as main — backup of debug build |

The 104 MB debug build may be decompilable with WinDev decompile tools to recover source-level information (window/form names, field names, procedure code).

---

## 14. Configuration / Settings Files

| File | Purpose |
|---|---|
| `CAISSIER.TXT` | Cashier accounts (semicolons) |
| `DEPARTEMENT.TXT` | Department / depot codes |
| `TAXE.TXT` | Tax rate codes |
| `ENTETE.TXT` | Report header/footer text |
| `PLU.TXT` / `PLU.CSV` | Article catalogue dumps for printer |
| `OLYMPIAPLU.TXT` | 5000-PLU pre-population dump |
| `HATEM.TXT` | Sample data dump |
| `user.FIC.txt` | User records + permission matrix |
| `QDRIVER.LOG` | Fiscal printer session log — confirms protocol v1.13, COM1 57600 baud, workflow: START → ABORT → BAUDRATE → PORT → REGISTER → CPX → UPLOAD plu.csv → CPM → CPB → END |
| `CCSauvegarde.log` | Backup log |
| `WDJournal.log` | Journal log |
| `WDGEN.TXT` | WinDev generated source (DP_VIS window) |
| `FIRSTMAG.env` (reports folder) | WinDev project environment file (13,928 bytes, Unicode). Contains 7+ sections: graphics settings (`PRJ_GRAPH_`), recent WDE reports (`PRJ_FICHIERRECENT_`: FACTURE_VENTEPERIODIQUE, bon_de_livraison, bondecommandeACHAT, BON_DE_COMMANDE, chequec, TRAITE), debugger state (`COD_`), window placements (`WDPRJ_Project_`), report editor state (`Etat_`), and most importantly the full **274-table inventory** in `LIVEDATAOK_` (all known tables) + `LIVEDATAACTIF_` (5 active in live data: ENTETE, CLIENT, LIGNE, LIGNETAT, CODEABARRE) + `LIVEDATAREP_` (all point to `C:\ProgramData\FIRSTMAG`) + `LIVEDATATYPEREP_` (type 4 = HFSQL Classic) |
| `uninst.inf` | Uninstaller configuration |
| `SIM.FIC` / `Declaration.SIM` | State and customs declaration |

---

## 15. Multilingual Support

- French (default)
- English (`ENGLISH.WQP`)
- German (`GERMAN.WQP`)
- Dutch (`DUTCH.WQP`)
- Portuguese (`PORTUGESE.WQP` — original typo preserved)

The Tunisian client likely uses French + Arabic. The rebuild should support at least French and Arabic (RTL).

---

## 16. Rebuild Scope Recommendation (Rust)

### 16.1 Target stack

- **Language**: Rust
- **UI**: Iced / egui / Slint (desktop native) or Tauri (webview hybrid)
- **DB**: SQLite (single-file) or PostgreSQL (multi-store)
- **Reporting**: `printpdf` / `genpdf` (PDF), `csv` for exports
- **Hardware**: `serialport-rs` (COM ports), `usb-enumerate` (USB)
- **Fiscal protocol**: Implement the CASIO QDRIVER protocol (CPX/CPM/CPB/RSZ/RSX/RUz) or a modern fiscal printer API

### 16.2 Core V1

- Article master (multi-tax, multi-unit, family/sub-family/gamme, image, barcode)
- Customer master (full CRM, loyalty barcode)
- Supplier master
- Reference tables (taxes, units, currencies, countries, depots)
- Sales documents (quote → order → delivery → invoice → credit note, with transformation)
- Purchase documents (order → delivery → invoice → credit note)
- Stock movements (entry, exit, transfer) with multi-depot
- POS: opening, sales, payments, ticket print, X/Z reports
- Payment modes
- Basic reporting (invoice, credit note, stock movement, customer/supplier list)

### 16.3 V2 / optional

- Loyalty / deferred discount
- Site-to-site sync
- Advanced dashboards (turnover, top clients)
- Kitchen printer
- Scale / balance integration
- Fuel station module
- Restaurant / salon de thé mode
- SMS notifications
- CNAM document variant
- Customs declaration
- Fiscal certification
- Article label printing (INTART protocol)
- Multilingual (FR, EN, DE, NL, PT, AR)

### 16.4 Must-implement protocols

- **QDRIVER PLU push**: Export catalogue as CSV, upload to register via serial, send CPM/CPB
- **QDRIVER X/Z reporting**: Pull 6 department reports via RSX/RSZ commands, parse output
- **QDRIVER journal read**: Pull journal via RUz + TSYSTEM
- **INTART label print**: Send D10000 command for article shelf labels
- **Backup**: Line-based `.FIC` file archival (WDJournal-compatible)

### 16.5 Legacy / do not rebuild

- `Mouchf`/`Mouchsup` (French tax mouchard — may not apply in target jurisdiction)
- `CIRC3.VBX` (1990s VB control — replaced by native serial)
- Old WinDev 5.5 compatibility shims
- Specific CASIO register commands if hardware has been replaced
- `SIM.FIC` format (state snapshots — replace with structured audit log)

---

## 17. Open Questions for the Client

1. Which of the 9 modules (fuel, restaurant, medical, customs, SMS, CNAM, kitchen printer, budget, barcode labels) are actively used?
2. Is the CASIO fiscal register still in use, or has hardware changed?
3. Is Arabic language support required?
4. What is the multi-store topology (single store / multi-cash / chain + HQ)?
5. What permission granularity is needed?
6. Are periodic invoices / subscriptions used?
7. Is the CNAM module required (Tunisian health insurance)?
8. Is the Declaration.SIM (customs) module required?
9. Is the `CERTIFY.BVD` fiscal certificate still relevant?
10. Is the article label printer (INTART D10000) still in use?

---

## 18. Bottom Line

FIRST MAG is a **full multi-store, multi-cashier retail management suite** built on PC Soft WinDev 23 with HFSQL Classic. The on-disk artefacts confirm:

- **Core**: master data, sales, purchasing, stock, CRM, POS, reporting
- **Protocols**: CASIO fiscal register (PLU push, X/Z reports, journal read, label printing)
- **Industry extensions**: fuel station, restaurant/salon de thé, kitchen printer, medical, customs, SMS, CNAM
- **Audit**: full `h*` history tables + mouchard tamper-proof log
- **Scope split**: Core V1 (essentials) vs V2 (optional modules) vs legacy (do not rebuild)

The next step is to pick the V1 scope with the client and start with the **document lifecycle engine** (sales + purchase + stock) because everything else depends on it.
