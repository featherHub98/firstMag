# FIRST MAG Documentation — Review Addendum

This document lists what the initial `FIRSTMAG_FUNCTIONAL_DOCUMENTATION.md` got **wrong** and what it **missed** from the scan, with instructions for what to correct in the next revision.

---

## 1. WRONG — RAPPORT*.TXT files misinterpreted

**What the doc says** (Section 12, last bullet):
> "Plus the RAPPORT*.TXT files in the app folder: 24+ earlier report definition exports, which describe the same business reports in text form (column lists, sort orders). These are gold for a rebuild — they tell us the column / sort / filter of each report."

**Reality**: These are **CASIO fiscal register output files**, not WinDev report definitions. They are pulled from the register via `QDRIVERR.CMD` / `QDRIVERRX.CMD` using the `RSZ` (Z-report) and `RSX` (X-report) commands, and saved as text. The format is a semicolon-separated fiscal report showing X-counters, Z-counters, department totals, cash totals, per-cashier totals, and register status.

**Decoded format** (12 semicolon-separated fields per line):

| Line type | Example | Fields |
|---|---|---|
| Header | `0;0;0;0;1;"Periode : Standard";"Z";"khalil allah"` | flags; type=1; description; report_type (Z/X); cashier name |
| Sale line | `1;1;1;2;1;"JUST PRIX";1;2;100,000;0;;;;` | dept/cat codes; type=1; label; qty; amount |
| Payment line | `1;1;1;6;1;"ESPECES";12;;49,890;;;;;` | type=6; "ESPECES" (cash); qty; 49,890 |
| X-counter | `0;0;0;0;4;"X-Compteur  :000004";4` | type=4; X-counter = 4 |
| Z-counter | `0;0;0;0;5;"Z-Compteur  :000128";128` | type=5; Z-counter = 128 |
| Date/time | `0;0;0;0;6;"Jeudi 13-10-2005";"12:26:32";7` | type=6; day name + date; time; day-of-week |
| End marker | `0;0;0;0;0;"Terminé!";0` | type=0; end |

RAPPORT files with `X` suffix (e.g. RAPPORT1X.TXT) are **X reports** (empty/zero-length = not used). Those without suffix are **Z reports** (had data). RAPPORT24.TXT (3495 bytes) and RAPPORT4X.TXT (3702 bytes) have substantial transaction-level detail.

**CORRECTION**: Delete that bullet from §12. Replace with: "See §10 (Receipt Printer Protocol) for the QDRIVERR/QDRIVERRX protocol and report format."

---

## 2. MISSING — Full QDRIVER protocol inventory

The doc covers `QDRIVER.CMD` (CPX/CPM/CPB/upload) but misses the other command files. Full protocol table:

| Command file | Commands sent | Purpose |
|---|---|---|
| `QDRIVER.CMD` | CPX, upload plu.csv, CPM, CPB | Push PLU catalogue to register |
| `QDRIVERP.CMD` | D10000 | **Print article labels / shelf tags** (INTART integration) |
| `QDRIVERPLU.CMD` | upload plu.csv, CPM, CPB | Just PLU push (variant) |
| `QDRIVERR.CMD` | RSZ000001 → RSZ000006 | **Read 6 Z-reports** (per department) from register |
| `QDRIVERRX.CMD` | RSX000001 → RSX000006 | **Read 6 X-reports** (per department) from register |
| `JOURNAL.CMD` | RUz1010004, TSYSTEM | **Read fiscal journal** from register |
| `INTART.CMD` | D10000 | Print INTART (article) labels via display command |
| `MAJPLU.CMD` | upload plu.csv, CPM, CPB | PLU update (MAJ = Mise À Jour) |

**Command semantics decoded**:

| Command | Meaning |
|---|---|
| `CPX` | Clear / Cancel transaction |
| `CPM` | Cash Program Memory (flush programming) |
| `CPB` | PLU Buffer flush |
| `D10000` | Display/Print command for article labels (10000 = format/article range) |
| `RSZ000001` | Read Z-report for department 1 (RS=Read Report, Z=Z type, 000001=dept code) |
| `RSX000001` | Read X-report for department 1 |
| `RUz1010004` | Read Unit(ary) Journal, format z, parameters 1010004 |
| `TSYSTEM` | Test System (register status check) |
| `UPLOAD=plu.csv` | Upload CSV file to register |
| `NEWFILE=<name>` | Local file to write register response into |
| `CLEARLOG=1` | Clear the local QDRIVER log before session |
| `ABORT=1` | Abort on error |
| `RESULT=1` | Display result |
| `BAUDRATE=57600` | RS-232 baud rate |
| `PORT=1` | COM port 1 |
| `REGISTER=1` | Register number 1 |

**Correct the §10 section header**: Rename "Receipt Printer Protocol" to "Fiscal Register Protocol (QDRIVER CASIO/Epson Class)" and add the full command table.

---

## 3. MISSING — FIRSTMAG.exe sizes and implications

The doc doesn't mention the very different executable sizes:

| Location | Size | Implication |
|---|---|---|
| `D:\hamma\FIRSTMAG\FIRSTMAG.exe` | **104,272,384** (104 MB) | Debug build with full debug symbols |
| `D:\hamma\FIRSTMAG\FIRSTMAG\FIRSTMAG.exe` | **46,260,224** (46 MB) | Smaller — likely release build without debug info |
| `D:\hamma\FIRSTMAG\Sauvegarde\FIRSTMAG.exe` | **104,272,384** (104 MB) | Same as main — backup of debug build |

The 104 MB build likely contains WinDev debug information (PDB-equivalent). This could potentially be decompiled using WinDev decompile tools to recover source code structure (window names, field names, procedure names, etc.).

---

## 4. MISSING — Application distribution / installer artefacts

The `INSTALL` folder and `INSTALL.ZIP` contain the original deployment packages:

| ZIP package | Size | Contents (implied) |
|---|---|---|
| `__WDINST.ZIP` | 185 MB | WinDev 23 runtime installer (the .NET/WDVM runtime) |
| `_ODBC.ZIP` | 64 MB | HFSQL ODBC driver (client connectivity) |
| `_FRAMEWORK.ZIP` | 23 MB | .NET Framework (possibly required by WD) |
| `_MODAUTO.ZIP` | 4.8 MB | Module auto-install — additional optional modules |
| `_OLEDBHF.ZIP` | (smaller) | OLE DB provider for HFSQL |
| `_ER.ZIP` | (smaller) | **Etats et Requêtes** — the report/query package |

The `MODAUTO` (Module Auto) package is especially interesting — it may contain optional modules that were installed separately.

---

## 5. MISSING — Nested deployment structure

The `FIRSTMAG\FIRSTMAG\` subfolder is a compact deployment containing:
- `FIRSTMAG.exe` (46 MB — release build)
- `FIRSTMAG.wx` (WinDev manifest)
- `FIRSTMAG.lnk` (shortcut)
- `Declaration.SIM` (separate customs declaration)
- `Microsoft.SqlServer.Compact.400.64.bc` (SQL CE — same BC file exists in root)

This suggests there may have been both a **development deployment** (104 MB, in the root) and a **client deployment** (46 MB, nested). Or the nested folder was a deployment to an external drive.

---

## 6. MISSING — Sauvegarde folder as full app backup

The `Sauvegarde/` folder is a **complete application backup** including:
- `FIRSTMAG.exe` (104 MB debug build)
- `FIRSTMAG.wx`, `First mag.wx`, `Ajout d'un document stock.wx` (all 3 WX files)
- `FIRSTMAG.REP` (analysis metadata — dated 2026-05-25, same as current live data)
- `SIM.FIC` (old SIM snapshot — dated 2023-02-14)
- `DECLARATION.SIM` (separate from the one in data folder)
- `WDJournal.exe`, `WDOptimiseur.exe`, `WDSQL.exe`, `WDTrans.exe` (older timestamps)
- `uninst.inf` (uninstaller config)
- `INSTALL.ZIP` / `Sauvegarde\INSTALL\` subfolder with full installer packages
- `STATARTICLEPARRAYON.HTM` — article-by-aisle statistical report (HTML export)
- `tableau.HTM` — dashboard (HTML export)
- Legacy files: `CERTIFY.BVD`, `CADRAN.BAK`, `CHOIXDAT.BAK`, `CIRC3.VBX`, `FAX.ICO`, `DECORCAM.PCX`, `CCMenu.WDK`

This is a usable restore point and should be noted.

---

## 7. MISSING — Additional subfolders not explored

The doc mentions these but doesn't describe their contents:

| Folder | What it contains |
|---|---|
| `_chm_WDJournal/` | Extracted WDJournal.chm help: `WDJournal/`, `Images/`, `404/`, `.hhc`/`.hhk` |
| `_chm_WDSQL/` | Extracted WDSQL.chm help |
| `_chm_WDTrans/` | Extracted WDTrans.chm help |
| `_odbc_pkg/` | Staged ODBC driver installation (HFSQL connectivity) |
| `_odbc_unpack/` | Extracted ODBC driver files |
| `_odbc_extracted/` | **(empty)** — cleaned after extraction |
| `_odbc_extracted2/` | **(empty)** — cleaned after extraction |
| `_oledb_pkg/` | Staged OLE DB provider for HFSQL |
| `_odbc32_payload/` | 32-bit ODBC driver payload |
| `_odbc64_payload/` | 64-bit ODBC driver payload |

The help files (`.chm`) are standard WinDev documentation for the bundled tools (WDJournal backup, WDSQL query, WDTrans transfer). They don't describe the FIRSTMAG application itself.

---

## 8. MISSING — CERTIFY.BVD and fiscal certification

`CERTIFY.BVD` (701 bytes) in the backup is a **fiscal certification/tax validation file**. "BVD" likely stands for "Bureau de Vérification et de Déclaration" or similar (Tunisian fiscal administration). This is the application's **fiscal approval certificate** recognized by the Tunisian tax authorities. The rebuild must respect the fiscal requirements of the target jurisdiction.

---

## 9. MISSING — CIR3.VBX legacy control

`CIRC3.VBX` (16,832 bytes, dated 1998/2018) in the backup is a **Visual Basic 3/4 custom control**. This is an anomaly — the app is built in WinDev, not VB. It may be an old component used by the QDRIVER for serial port communication, or it's simply a leftover from an older version.

---

## 10. MISSING — FIRSTMAG.env has more useful info

The doc only quotes the format line. The file (13,928 bytes) likely contains **environment variables** for the reports module: default paths, printer settings, company logo paths, etc. This should be extracted and decoded for the rebuild.

---

## 11. MISSING — Detailed RAPPORT*.TXT size analysis

| File | Size | Content |
|---|---|---|
| RAPPORT1.TXT | 238 | Z-report: "Total Ventes" 100,000; Z-counter 127 |
| RAPPORT2.TXT | 235 | Z-report: "JUST PRIX" amount; Z-counter 128 |
| RAPPORT3.TXT | 240 | Z-report |
| RAPPORT4.TXT | 314 | Z-report |
| RAPPORT5.TXT | 194 | Z-report |
| RAPPORT6.TXT | 249 | Z-report |
| RAPPORT10.TXT | 194 | Shorter Z-report: "Caissier" filter |
| RAPPORT24.TXT | **3495** | Detailed report — likely has all department breakdown |
| RAPPORT1X.TXT | 0 | Empty (X-report not pulled) |
| RAPPORT4X.TXT | **3702** | X-report: "ESPECES" 49,890; per-payment mode detail |
| RAPPORT61.TXT | 236 | Z-report |
| RAPPORT81.TXT | 296 | Z-report |
| RAPPORT92.TXT | 225 | Smaller Z-report |
| RAPPORT32.TXT | 225 | Z-report |
| RAPPORT52.TXT | 225 | Sequential Z-report |
| RAPPORT62.TXT | 225 | Sequential |
| RAPPORT72.TXT | 225 | Sequential |
| RAPPORT82.TXT | 225 | Sequential |
| RAPPORT42.TXT | 449 | Larger Z-report |
| RAPPORT3X.TXT | 221 | X-report with some data |
| RAPPORT6X.TXT | 197 | X-report |
| RAPPORT4X.TXT | 3702 | Most detailed X-report |
| Remaining 2X-5X | 0 | Empty |

The "X" variants are X-reports (mid-day), the non-suffix are Z-reports (end-of-day). The RAPPORT24 (3495 bytes) and RAPPORT4X (3702 bytes) contain **expanded detail** and should be parsed for a more complete picture of register output.

---

## 12. MISSING — MODAUTO (module auto-install)

The `_MODAUTO.ZIP` (4.8 MB) in `INSTALL` suggests the app has a **module auto-install feature**: additional business modules that could be deployed to client machines without reinstalling the full app. This may also be the mechanism by which optional modules (fuel station, restaurant, etc.) were added. The contents of this ZIP should be examined.

---

## 13. MISSING — Schedule / site-to-site communication

The doc mentions site-to-site sync but doesn't mention the relevant CMD files:

- `QDRIVER.CMD` is the main schedule script (upload PLU, pull reports)
- The `Mouchf`/`Mouchsup` + `Serveur` tables suggest a **polling-based sync**: each site pushes its "mouchard" (tamper-proof log) and pulls updates from the server
- The WDTrans.exe tool is specifically for **transfer**: moving data between sites
- The app has multiple `SIM` snapshots (SIM1-SIM143) — these are likely **inter-site transfer snapshots**

---

## 14. Summary of what to fix in the next revision

| Section | Issue | Fix |
|---|---|---|
| §10 | Misses full QDRIVER protocol | Add RSZ/RSX/D/RUz/TSYSTEM commands + INTART + JOURNAL |
| §12 last bullet | WRONG: calls RAPPORT*.TXT "report definitions" | Replace with correct description as fiscal register output |
| §11 | Misses Sauvegarde as full backup | Add comparison of executable sizes and content |
| §3 | Misses nested FIRSTMAG\FIRSTMAG\ folder | Add as "Compact deployment bundle" |
| §9 | Hardware list incomplete | Add INTART (label printing), RSZ/RSX register reporting |
| §14 | Misses CERTIFY.BVD | Add fiscal certification note |
| §16 | Rebuild recommendation | Add RAPPORT format parser + QDRIVER protocol reimplementation to scope |
| — | Missing subfolder details | Add § for INSTALL, _chm, _odbc, _oledb |
| — | Missing CMD scripts analysis | Add as §10 sub-section with full protocol table |
| — | Missing _MODAUTO.ZIP | Note as potential installable module package |
| — | FIRSTMAG.env not decoded | File should be hex-dumped and analyzed for report paths/settings |

---

## 15. Items worth examining further

- **MODAUTO.ZIP** contents (4.8 MB) — likely contains optional module installers
- **FIRSTMAG.env** (13,928 bytes) — decode the full environment structure
- **RAPPORT4X.TXT** and **RAPPORT24.TXT** — parse fully for transaction-level register data format
- The 3 `Declaration.SIM` files should be compared for differences (one in `C:\ProgramData\FIRSTMAG`, one in `D:\hamma\FIRSTMAG`, one in `D:\hamma\FIRSTMAG\FIRSTMAG\`)
- Check whether the 46MB release exe can be run in a sandbox to observe the UI
