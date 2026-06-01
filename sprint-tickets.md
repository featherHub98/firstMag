# FIRST MAG — Sprint Tickets

## Sprint 0: Project Foundation ✅
| # | Ticket | Status |
|---|--------|--------|
| 0.0 | Scaffold Tauri 2 + React + Vite project | ✅ |
| 0.1 | Rust domain types (article, document, partner, pos, user, tax, stock, error) | ✅ |
| 0.2 | SQLite schema (migrations 001+002, 20 tables + indexes) | ✅ |
| 0.3 | Persistence layer (article_repo, document_repo, partner_repo, pos_repo, db init) | ✅ |
| 0.4 | Services (DocumentService — create + transform lifecycle) | ✅ |
| 0.5 | Tauri commands (article_cmds, sale_cmds, pos_cmds, partner_cmds, stock_cmds) | ✅ |
| 0.6 | Frontend scaffold (Vite, Tailwind v4, React Router, Zustand stores, 7 pages, Layout) | ✅ |
| 0.7 | Verify `cargo check` + `npm run build` both pass | ✅ |

## Sprint 1: Wire Frontend to Backend ✅
| # | Ticket | Status |
|---|--------|--------|
| 1.1 | Install tauri-cli & verify `cargo tauri dev` | ✅ (npm `@tauri-apps/cli` v2.11.2) |
| 1.2 | Wire POS page — real `searchArticles()`, add-to-cart, payment dialog with `createDocument()` | ✅ |
| 1.3 | Wire Articles page — `listArticles`, `createArticle`, `updateArticle`, `deleteArticle` | ✅ |
| 1.4 | Wire Partners page — `listPartners`, `createPartner`, `searchPartners` | ✅ |
| 1.5 | Wire Sales page — `listDocuments`, `transformDocument`, `confirmDocument`, detail panel | ✅ |
| 1.6 | Wire Stock page — `getStockLevel`, `listStockMovements` + stock_repo + stock_cmds | ✅ |
| 1.7 | Wire Sessions — open/close register in Settings via `openSession`/`closeSession` | ✅ |
| 1.8 | Global error handling — Toast notification store + component in App.tsx | ✅ |

## Sprint 2: POS UX Polish ✅
| # | Ticket | Status |
|---|--------|--------|
| 2.1 | Barcode quick-input — continuous focus, Enter = lookup | ✅ |
| 2.2 | Product grid — category tabs, search-as-you-type | ⏭ (needs backend families) |
| 2.3 | Ticket panel — swipe-to-delete, quantity +/- | ⏭ (needs touch lib) |
| 2.4 | Payment dialog — cash/card/credit, change, confirm | ✅ |
| 2.5 | Receipt preview — minimal on-screen receipt | ✅ |
| 2.6 | Keyboard shortcuts — F1/F2/Escape/Enter | ✅ |

## Sprint 3: Document Engine & Reports ✅
| # | Ticket | Status |
|---|--------|--------|
| 3.1 | PDF Invoice — A4 invoice via `printpdf` | ✅ |
| 3.2 | PDF Ticket — 80mm thermal receipt | ✅ |
| 3.3 | Z-Report — daily close aggregation | ✅ |
| 3.4 | X-Report — intermediate non-resetting | ✅ |
| 3.5 | Report preview & print — frontend viewer | ✅ |

## Sprint 4: Fiscal Module — QDRIVER Protocol ✅
| # | Ticket | Status |
|---|--------|--------|
| 4.1 | Serial I/O layer — COM1 57600 8N1, STX/ETX/BCC framing | ✅ |
| 4.2 | CPX — declaration of operation | ✅ |
| 4.3 | CPM — declaration of payment | ✅ |
| 4.4 | CPB — end of ticket | ✅ |
| 4.5 | RSZ/RSX — Z and X reports | ✅ |
| 4.6 | RUz — daily close | ✅ |
| 4.7 | Error handling & retry — NAK retry, timeouts | ✅ |
| 4.8 | Fiscal state machine — idle → ticket_open → payment → closed | ✅ |

## Sprint 5: Data Migration — HFSQL → SQLite ✅
| # | Ticket | Status |
|---|--------|--------|
| 5.1 | CSV export reader — semicolon, CP1252 | ✅ |
| 5.2 | Articles import — ARTICLE.FIC → articles | ✅ |
| 5.3 | Partners import — CLIENT.FIC → partners | ✅ |
| 5.4 | Documents import — ENTETE.FIC + LIGNE.FIC | ✅ |
| 5.5 | Barcodes import — CODEABARRE.FIC | ✅ |
| 5.6 | `cargo run --bin import-hfsql` — CLI binary | ✅ |

## Sprint 6: Settings, Admin & Remaining UX
| # | Ticket | Status |
|---|--------|--------|
| 6.1 | Settings page — company info, tax rates, doc series, register | ☐ |
| 6.2 | User management — PIN login, role switching | ☐ |
| 6.3 | Dark/light mode toggle — persist to localStorage | ☐ |
| 6.4 | Reports page — X/Z generation and display | ☐ |
| 6.5 | Responsive layout — tablet + desktop, sidebar collapse | ☐ |

## Sprint 7: Testing & Hardening
| # | Ticket | Status |
|---|--------|--------|
| 7.1 | Domain unit tests | ☐ |
| 7.2 | Repository integration tests | ☐ |
| 7.3 | Service tests | ☐ |
| 7.4 | Tauri command tests | ☐ |
| 7.5 | Frontend component tests | ☐ |
| 7.6 | Error edge cases | ☐ |
| 7.7 | Manual E2E — full POS flow | ☐ |
| 7.8 | Windows packaging — `cargo tauri build` | ☐ |

## Sprint 8: Release Preparation
| # | Ticket | Status |
|---|--------|--------|
| 8.1 | App icon & branding | ✅ |
| 8.2 | Windows installer config | ✅ |
| 8.3 | README & quick-start | ✅ |
| 8.4 | Tag v0.1.0 release | ✅ |
