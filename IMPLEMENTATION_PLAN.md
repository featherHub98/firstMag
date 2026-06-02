# FIRST MAG Application - Implementation Plan

Based on the functionality analysis, here is the detailed implementation plan to add all missing functionalities from the original FIRST MAG application.

## Phase 1: Core Master Data (Weeks 1-2)
**Goal:** Establish complete master data foundation

### Tasks:
1. Create family/sub-family management (components, API, types)
2. Implement unit of measure management
3. Add currency and country management
4. Create salesperson/vendor management
5. Implement bank and payment method management
6. Add store/depot management for multi-depot support

### Files to create/modify:
- `src/components/common/FamilyManagement.tsx`
- `src/components/common/UnitOfMeasureManagement.tsx`
- `src/components/common/CurrencyManagement.tsx`
- `src/components/common/CountryManagement.tsx`
- `src/components/common/SalespersonManagement.tsx`
- `src/components/common/BankManagement.tsx`
- `src/components/common/PaymentMethodManagement.tsx`
- `src/components/common/DepotManagement.tsx`
- `src/api/familyApi.ts`, `unitOfMeasureApi.ts`, `currencyApi.ts`, `countryApi.ts`, `salespersonApi.ts`, `bankApi.ts`, `paymentMethodApi.ts`, `depotApi.ts`
- `src/types/family.ts`, `unitOfMeasure.ts`, `currency.ts`, `country.ts`, `salesperson.ts`, `bank.ts`, `paymentMethod.ts`, `depot.ts`
- Update `articleApi.ts` and `article.ts` to reference families and units
- Update `partnersApi.ts` and `partner.ts` to include salesperson fields
- Update `stockApi.ts` and `stock.ts` to support multi-depot

## Phase 2: Document Lifecycle (Weeks 3-4)
**Goal:** Complete document processing capabilities

### Tasks:
1. Enhance documentApi to support full lifecycle with transformations
2. Implement periodic invoicing functionality
3. Add purchase document processing (separate from sales documents)
4. Implement CNAM document variant for Tunisian health insurance
5. Add document transformation capabilities (quote→order, etc.)

### Files to create/modify:
- Enhance `src/api/documentApi.ts` with lifecycle methods
- Create `src/api/purchaseDocumentApi.ts`
- Update `src/types/document.ts` with document status flows
- Create transformation components in `src/components/common/`
- Add periodic invoice handling in `src/pages/SalesPage.tsx`
- Create `src/pages/PurchasePage.tsx`
- Create `src/components/common/DocumentTransformer.tsx`

## Phase 3: Stock Management (Weeks 5-6)
**Goal:** Complete inventory and stock control

### Tasks:
1. Implement physical stock verification/inventory module
2. Add barcode-driven stock import functionality
3. Implement multi-depot stock tracking and transfers
4. Add stock reports functionality

### Files to create/modify:
- Create `src/pages/StockVerification.tsx`
- Enhance `src/api/stockApi.ts` with verification and import methods
- Create `src/components/common/StockTransfer.tsx`
- Create `src/components/common/BarcodeStockImport.tsx`
- Update `StockPage.tsx` to include new stock functionality
- Create `src/pages/StockReports.tsx`

## Phase 4: POS Enhancements (Weeks 7-8)
**Goal:** Complete point-of-sale functionality

### Tasks:
1. Implement register opening with cashier auth and opening fund
2. Add held/suspended ticket functionality
3. Implement deferred discount/loyalty program
4. Add cheque printing capabilities
5. Implement customer balance display
6. Add cash movement journal
7. Implement X/Z reports for fiscal printer
8. Optimize for touch screen mode
9. Add restaurant/table mode
10. Add salon de thé mode

### Files to create/modify:
- Enhance `src/pages/PosPage.tsx` with new POS features
- Create `src/components/pos/RegisterOpening.tsx`
- Create `src/components/pos/HeldTickets.tsx`
- Create `src/components/pos/CustomerBalance.tsx`
- Create `src/components/pos/LoyaltyProgram.tsx`
- Create `src/components/pos/ChequePrinting.tsx`
- Enhance `src/api/posApi.ts` with new POS methods
- Create `src/api/fiscalApi.ts` enhancements for X/Z reports
- Create touch-optimized components
- Create `src/pages/RestaurantMode.tsx` and `SalonDeTheMode.tsx`
- Create `src/pages/CashMovementJournal.tsx`

## Phase 5: CRM & Loyalty (Weeks 9-10)
**Goal:** Complete customer relationship management

### Tasks:
1. Enhance customer profile with comprehensive fields
2. Add purchase history tracking
3. Implement customer visits tracking
4. Add complaint/reclamation management
5. Implement loyalty barcode management
6. Add top-client analytics

### Files to create/modify:
- Enhance `src/components/common/CustomerProfile.tsx`
- Update `src/types/partner.ts` with CRM fields
- Enhance `src/api/partnerApi.ts` with CRM methods
- Create `src/components/common/PurchaseHistory.tsx`
- Create `src/components/common/VisitTracking.tsx`
- Create `src/components/common/ComplaintManagement.tsx`
- Create `src/components/common/LoyaltyProgramManagement.tsx`
- Create `src/pages/TopClientsAnalytics.tsx`

## Phase 6: Reports & Analytics (Weeks 11-12)
**Goal:** Implement comprehensive reporting system

### Tasks:
1. Implement 50+ WinDev-equivalent reports
2. Add specialized dashboard views (FI_EvolutionCA, etc.)
3. Add client/supplier analytics
4. Implement periodic invoicing reports
5. Add cheque/TRAITE reports

### Files to create/modify:
- Enhance `src/pages/ReportsPage.tsx` with report categories
- Create `src/api/reportApi.ts` enhancements
- Create report components in `src/components/common/Reports/`
- Enhance `src/pages/DashboardPage.tsx` with specialized views
- Create `src/components/common/Dashboard/AnalyticsWidgets.tsx`
- Update `src/api/dashboardApi.ts` for analytics data
- Create `src/components/common/Reports/ClientAnalytics.tsx`
- Create `src/components/common/Reports/SupplierAnalytics.tsx`
- Create `src/components/common/Reports/PeriodicInvoicing.tsx`
- Create `src/components/common/Reports/ChequeTreateReports.tsx`

## Phase 7: Configuration & Maintenance (Weeks 13-14)
**Goal:** Complete system configuration and maintenance

### Tasks:
1. Add touch screen configuration
2. Implement barcode/ticket layout/kitchen printer/scanner/cash drawer/cheque print configuration
3. Add database verification tools
4. Implement site-to-site communication functionality
5. Add fiscal printer integration (QDRIVER) for PLU upload and X/Z reporting
6. Implement backup/restore functionality

### Files to create/modify:
- Enhance `src/pages/SettingsPage.tsx` with configuration sections
- Create `src/components/common/Configuration/`
- Create `src/components/common/Configuration/HardwareSettings.tsx`
- Create `src/components/common/Configuration/PrinterSettings.tsx`
- Create `src/components/common/Configuration/TouchScreenSettings.tsx`
- Create `src/components/common/Configuration/ScannerSettings.tsx`
- Create `src/components/common/Configuration/CashDrawerSettings.tsx`
- Create `src/components/common/Configuration/KitchenPrinterSettings.tsx`
- Create `src/components/common/Configuration/TicketLayoutSettings.tsx`
- Create `src/api/configurationApi.ts`
- Create `src/api/maintenanceApi.ts` for verification and backup
- Implement QDRIVER protocol in `src/api/fiscalApi.ts`
- Create backup/restore components in `src/components/common/Configuration/BackupRestore.tsx`
- Create `src/components/common/Configuration/DatabaseVerification.tsx`
- Create `src/components/common/Configuration/SiteToSiteCommunication.tsx`

## Phase 8: Industry-Specific Modules (Weeks 15-16)
**Goal:** Add specialized industry functionality

### Tasks:
1. Implement restaurant/salon de thé module
2. Add kitchen printer integration
3. Implement fuel station module
4. Add customs declaration functionality
5. Add medical/occupational health module
6. Implement SMS notification system
7. Add barcode label printing (INTART protocol)
8. Add budget module

### Files to create/modify:
- Create `src/pages/Industry/Restaurant.tsx`
- Create `src/pages/Industry/SalonDeThe.tsx`
- Create `src/pages/Industry/FuelStation.tsx`
- Create `src/pages/Industry/CustomsDeclaration.tsx`
- Create `src/pages/Industry/MedicalHealth.tsx`
- Create `src/pages/Industry/SmsNotification.tsx`
- Create `src/pages/Industry/BarcodeLabelPrinting.tsx`
- Create `src/pages/Industry/Budget.tsx`
- Create `src/api/industryApi.ts` with industry-specific endpoints
- Create industry-specific components in `src/components/industry/`
- Update `src/pages/SettingsPage.tsx` for industry-specific configuration