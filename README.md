# FIRST MAG

POS and retail management suite. Rust (Tauri 2) + React/TypeScript + SQLite.

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Project Structure

```
src-tauri/src/
  domain/        # Data types (article, document, partner, pos, user, tax, stock)
  persistence/   # SQLite repos
  service/       # Business logic
  commands/      # Tauri IPC endpoints
  reports/       # PDF generation (invoice, receipt, X/Z reports)
  fiscal/        # QDRIVER serial protocol for fiscal printers
  bin/           # Standalone CLI tools (import_hfsql)
src/
  api/           # Frontend Tauri invoke wrappers
  components/    # Reusable UI components
  pages/         # App pages (POS, Articles, Partners, Sales, Stock, Reports, Settings)
  stores/        # Zustand state management
```

## Database

Single-file SQLite at `%APPDATA%/com.firstmag.app/db/firstmag.db`. Migrations run on startup.

## Importing from HFSQL

```bash
cargo run --bin import_hfsql -- <db_path> <csv_dir>
```

## License

Proprietary. All rights reserved.
