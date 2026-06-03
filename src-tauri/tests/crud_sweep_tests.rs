use firstmag_lib::domain::{
    CreateAccountingCategory, CreateAdvancedTaxRate, CreateArticle, CreateArticleBomHeader,
    CreateArticleBomLine, CreateArticleCode, CreateArticleFamily, CreateBank,
    CreateCashier, CreateCountry, CreateCurrency, CreateDepot, CreateDocument, CreateDocumentLine,
    CreateGondola, CreatePartner, CreatePartnerFollowUp, CreatePartnerReclamation,
    CreatePaymentMethod, CreateProductRange, CreateRayon, CreateRegister, CreateSalesperson,
    CreateTariffCategory, CreateUnitOfMeasure, DocumentStatus, DocumentType, PartnerType,
    UpdateAccountingCategory, UpdateAdvancedTaxRate, UpdateArticle, UpdateArticleFamily, UpdateBank,
    UpdateCashier, UpdateCountry, UpdateCurrency, UpdateDepot, UpdateGondola,
    UpdatePartnerFollowUpStatus, UpdatePartnerReclamationStatus, UpdatePaymentMethod,
    UpdateProductRange, UpdateRayon, UpdateRegister, UpdateSalesperson,
    UpdateTariffCategory, UpdateUnitOfMeasure, UpsertPartnerProfile,
};
use firstmag_lib::persistence::{
    accounting_category_repo, advanced_tax_rate_repo, article_bom_repo, article_code_repo,
    article_repo, bank_repo, cashier_repo, country_repo, crm_repo, currency_repo, depot_repo,
    document_repo, family_repo, gondola_repo, partner_repo, payment_method_repo, pos_repo,
    product_range_repo, rayon_repo, register_repo, salesperson_repo, stock_repo,
    tariff_category_repo, unit_of_measure_repo, user_repo,
};
use firstmag_lib::service::DocumentService;
use uuid::Uuid;

fn temp_db_path() -> String {
    std::env::temp_dir()
        .join(format!("firstmag_crud_{}.db", Uuid::new_v4()))
        .to_string_lossy()
        .to_string()
}

#[tokio::test]
async fn test_crud_sweep_across_app_repositories() {
    let db_path = temp_db_path();
    let pool = firstmag_lib::persistence::init_db(&db_path)
        .await
        .expect("init db");

    // ---- Unit of measure CRUD
    let unit = unit_of_measure_repo::create(
        &pool,
        CreateUnitOfMeasure {
            name: "Piece Test".into(),
            symbol: "pt".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create unit");
    assert!(unit_of_measure_repo::list(&pool)
        .await
        .expect("list units")
        .iter()
        .any(|x| x.id == unit.id));
    assert_eq!(
        unit_of_measure_repo::get_by_id(&pool, &unit.id)
            .await
            .expect("get unit")
            .name,
        "Piece Test"
    );
    assert!(unit_of_measure_repo::search(&pool, "Piece")
        .await
        .expect("search unit")
        .iter()
        .any(|x| x.id == unit.id));
    assert_eq!(
        unit_of_measure_repo::update(
            &pool,
            UpdateUnitOfMeasure {
                id: unit.id.clone(),
                name: Some("Piece Test MAJ".into()),
                symbol: None,
                active: Some(true),
            },
        )
        .await
        .expect("update unit")
        .name,
        "Piece Test MAJ"
    );
    let unit_delete = unit_of_measure_repo::create(
        &pool,
        CreateUnitOfMeasure {
            name: "Unit Delete".into(),
            symbol: "ud".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create unit delete");
    unit_of_measure_repo::delete(&pool, &unit_delete.id)
        .await
        .expect("delete unit");

    // ---- Salesperson CRUD
    let salesperson = salesperson_repo::create(
        &pool,
        CreateSalesperson {
            code: "SP_T1".into(),
            first_name: "Ali".into(),
            last_name: "Test".into(),
            email: "ali.test@example.com".into(),
            phone: "1111".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create salesperson");
    assert!(salesperson_repo::list(&pool)
        .await
        .expect("list salespersons")
        .iter()
        .any(|x| x.id == salesperson.id));
    assert!(salesperson_repo::search(&pool, "SP_T1")
        .await
        .expect("search salesperson")
        .iter()
        .any(|x| x.id == salesperson.id));
    assert_eq!(
        salesperson_repo::update(
            &pool,
            UpdateSalesperson {
                id: salesperson.id.clone(),
                code: Some("SP_T1U".into()),
                first_name: None,
                last_name: None,
                email: None,
                phone: None,
                active: Some(true),
            },
        )
        .await
        .expect("update salesperson")
        .code,
        "SP_T1U"
    );
    salesperson_repo::delete(&pool, &salesperson.id)
        .await
        .expect("delete salesperson");

    // ---- Depot CRUD (kept for later dependencies too)
    let depot = depot_repo::create(
        &pool,
        CreateDepot {
            code: "DEP_T1".into(),
            name: "Depot Test".into(),
            address: "Tunis".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create depot");
    assert!(depot_repo::search(&pool, "DEP_T1")
        .await
        .expect("search depot")
        .iter()
        .any(|x| x.id == depot.id));
    let depot = depot_repo::update(
        &pool,
        UpdateDepot {
            id: depot.id.clone(),
            code: Some("DEP_T1U".into()),
            name: Some("Depot Test U".into()),
            address: None,
            active: Some(true),
        },
    )
    .await
    .expect("update depot");

    // ---- Bank CRUD
    let bank = bank_repo::create(
        &pool,
        CreateBank {
            code: "BNK_T1".into(),
            name: "Bank Test".into(),
            address: "Addr".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create bank");
    assert_eq!(
        bank_repo::get_by_id(&pool, &bank.id)
            .await
            .expect("get bank")
            .code,
        "BNK_T1"
    );
    let bank = bank_repo::update(
        &pool,
        UpdateBank {
            id: bank.id.clone(),
            code: Some("BNK_T1U".into()),
            name: None,
            address: None,
            active: Some(true),
        },
    )
    .await
    .expect("update bank");
    bank_repo::delete(&pool, &bank.id).await.expect("delete bank");

    // ---- Currency CRUD
    let currency = currency_repo::create(
        &pool,
        CreateCurrency {
            code: "TST".into(),
            name: "Test Currency".into(),
            symbol: "T$".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create currency");
    assert!(currency_repo::search(&pool, "TST")
        .await
        .expect("search currency")
        .iter()
        .any(|x| x.id == currency.id));
    let currency = currency_repo::update(
        &pool,
        UpdateCurrency {
            id: currency.id.clone(),
            code: Some("TSU".into()),
            name: None,
            symbol: None,
            active: Some(true),
        },
    )
    .await
    .expect("update currency");
    currency_repo::delete(&pool, &currency.id)
        .await
        .expect("delete currency");

    // ---- Payment method CRUD
    let payment_method = payment_method_repo::create(
        &pool,
        CreatePaymentMethod {
            code: "PM_T1".into(),
            name: "Payment Test".into(),
            description: "desc".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create payment method");
    assert!(payment_method_repo::search(&pool, "PM_T1")
        .await
        .expect("search payment method")
        .iter()
        .any(|x| x.id == payment_method.id));
    let payment_method = payment_method_repo::update(
        &pool,
        UpdatePaymentMethod {
            id: payment_method.id.clone(),
            code: Some("PM_T1U".into()),
            name: None,
            description: None,
            active: Some(true),
        },
    )
    .await
    .expect("update payment method");
    payment_method_repo::delete(&pool, &payment_method.id)
        .await
        .expect("delete payment method");

    // ---- Cashier CRUD
    let cashier = cashier_repo::create(
        &pool,
        CreateCashier {
            code: "CSH_T1".into(),
            name: "Cashier Test".into(),
            email: "cashier@test.local".into(),
            phone: "2222".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create cashier");
    assert!(cashier_repo::search(&pool, "CSH_T1")
        .await
        .expect("search cashier")
        .iter()
        .any(|x| x.id == cashier.id));
    let cashier = cashier_repo::update(
        &pool,
        UpdateCashier {
            id: cashier.id.clone(),
            code: Some("CSH_T1U".into()),
            name: None,
            email: None,
            phone: None,
            active: Some(true),
        },
    )
    .await
    .expect("update cashier");
    let cashier_delete = cashier_repo::create(
        &pool,
        CreateCashier {
            code: "CSH_DEL".into(),
            name: "Cashier Delete".into(),
            email: "cashier.delete@test.local".into(),
            phone: "2223".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create cashier delete");
    cashier_repo::delete(&pool, &cashier_delete.id)
        .await
        .expect("delete cashier");

    // ---- Register CRUD
    let register = register_repo::create(
        &pool,
        CreateRegister {
            code: "REG_T1".into(),
            name: "Register Test".into(),
            location: "Front".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create register");
    assert!(register_repo::search(&pool, "REG_T1")
        .await
        .expect("search register")
        .iter()
        .any(|x| x.id == register.id));
    let register = register_repo::update(
        &pool,
        UpdateRegister {
            id: register.id.clone(),
            code: Some("REG_T1U".into()),
            name: None,
            location: None,
            active: Some(true),
        },
    )
    .await
    .expect("update register");
    let register_delete = register_repo::create(
        &pool,
        CreateRegister {
            code: "REG_DEL".into(),
            name: "Register Delete".into(),
            location: "Back".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create register delete");
    register_repo::delete(&pool, &register_delete.id)
        .await
        .expect("delete register");

    // ---- Rayon + Gondola CRUD
    let rayon = rayon_repo::create(
        &pool,
        CreateRayon {
            code: "RAY_T1".into(),
            name: "Rayon Test".into(),
            depot_id: depot.id.clone(),
            active: Some(true),
        },
    )
    .await
    .expect("create rayon");
    let rayon = rayon_repo::update(
        &pool,
        UpdateRayon {
            id: rayon.id.clone(),
            code: Some("RAY_T1U".into()),
            name: None,
            depot_id: None,
            active: Some(true),
        },
    )
    .await
    .expect("update rayon");
    let gondola = gondola_repo::create(
        &pool,
        CreateGondola {
            code: "GON_T1".into(),
            name: "Gondola Test".into(),
            depot_id: depot.id.clone(),
            rayon_id: rayon.id.clone(),
            active: Some(true),
        },
    )
    .await
    .expect("create gondola");
    let gondola = gondola_repo::update(
        &pool,
        UpdateGondola {
            id: gondola.id.clone(),
            code: Some("GON_T1U".into()),
            name: None,
            depot_id: None,
            rayon_id: None,
            active: Some(true),
        },
    )
    .await
    .expect("update gondola");

    // ---- Product range CRUD
    let product_range = product_range_repo::create(
        &pool,
        CreateProductRange {
            code: "PR_T1".into(),
            name: "Range Test".into(),
            description: "desc".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create product range");
    let product_range = product_range_repo::update(
        &pool,
        UpdateProductRange {
            id: product_range.id.clone(),
            code: Some("PR_T1U".into()),
            name: None,
            description: None,
            active: Some(true),
        },
    )
    .await
    .expect("update product range");

    // ---- Tariff category CRUD
    let tariff_category = tariff_category_repo::create(
        &pool,
        CreateTariffCategory {
            code: "TC_T1".into(),
            name: "Tariff Test".into(),
            discount_rate: 150,
            active: Some(true),
        },
    )
    .await
    .expect("create tariff category");
    let tariff_category = tariff_category_repo::update(
        &pool,
        UpdateTariffCategory {
            id: tariff_category.id.clone(),
            code: Some("TC_T1U".into()),
            name: None,
            discount_rate: Some(200),
            active: Some(true),
        },
    )
    .await
    .expect("update tariff category");

    // ---- Accounting category CRUD
    let accounting_category = accounting_category_repo::create(
        &pool,
        CreateAccountingCategory {
            code: "AC_T1".into(),
            name: "Accounting Test".into(),
            account_number: "701000".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create accounting category");
    let accounting_category = accounting_category_repo::update(
        &pool,
        UpdateAccountingCategory {
            id: accounting_category.id.clone(),
            code: Some("AC_T1U".into()),
            name: None,
            account_number: None,
            active: Some(true),
        },
    )
    .await
    .expect("update accounting category");

    // ---- Advanced tax rate CRUD
    let advanced_tax_rate = advanced_tax_rate_repo::create(
        &pool,
        CreateAdvancedTaxRate {
            code: "AT_T1".into(),
            name: "Tax Test".into(),
            rate: 1900,
            surcharge_rate: 0,
            withholding_rate: 0,
            active: Some(true),
        },
    )
    .await
    .expect("create advanced tax rate");
    let advanced_tax_rate = advanced_tax_rate_repo::update(
        &pool,
        UpdateAdvancedTaxRate {
            id: advanced_tax_rate.id.clone(),
            code: Some("AT_T1U".into()),
            name: None,
            rate: Some(2000),
            surcharge_rate: None,
            withholding_rate: None,
            active: Some(true),
        },
    )
    .await
    .expect("update advanced tax rate");

    // ---- Country CRUD
    let country = country_repo::create(
        &pool,
        CreateCountry {
            code: "TST".into(),
            name: "Testland".into(),
            iso2: "TS".into(),
            phone_code: "+999".into(),
            active: Some(true),
        },
    )
    .await
    .expect("create country");
    let country = country_repo::update(
        &pool,
        UpdateCountry {
            id: country.id.clone(),
            code: Some("TSU".into()),
            name: Some("Testland U".into()),
            iso2: None,
            phone_code: None,
            active: Some(true),
        },
    )
    .await
    .expect("update country");

    // ---- Family CRUD (parent + child)
    let family_parent = family_repo::create(
        &pool,
        CreateArticleFamily {
            name: "Family Test Parent".into(),
            parent_id: None,
        },
    )
    .await
    .expect("create parent family");
    let family_child = family_repo::create(
        &pool,
        CreateArticleFamily {
            name: "Family Test Child".into(),
            parent_id: Some(family_parent.id.clone()),
        },
    )
    .await
    .expect("create child family");
    assert!(family_repo::search(&pool, "Family Test")
        .await
        .expect("search family")
        .iter()
        .any(|x| x.id == family_child.id));
    let family_child = family_repo::update(
        &pool,
        UpdateArticleFamily {
            id: family_child.id.clone(),
            name: Some("Family Test Child U".into()),
            parent_id: Some(family_parent.id.clone()),
            active: Some(true),
        },
    )
    .await
    .expect("update child family");
    let family_delete = family_repo::create(
        &pool,
        CreateArticleFamily {
            name: "Family Delete".into(),
            parent_id: None,
        },
    )
    .await
    .expect("create family delete");
    family_repo::delete(&pool, &family_delete.id)
        .await
        .expect("delete family");

    // ---- Partner create/read/search
    let partner = partner_repo::create(
        &pool,
        CreatePartner {
            partner_type: PartnerType::Client,
            code: "CL_T1".into(),
            name: "Client Test".into(),
            address: "Addr".into(),
            phone: "3333".into(),
            email: "client@test.local".into(),
            tax_id: "MF123".into(),
            country_id: None,
            credit_limit: 500_000,
            notes: "notes".into(),
        },
    )
    .await
    .expect("create partner");
    assert!(partner_repo::list(&pool, Some("client"))
        .await
        .expect("list partners")
        .iter()
        .any(|x| x.id == partner.id));
    assert!(partner_repo::search(&pool, "CL_T1")
        .await
        .expect("search partner")
        .iter()
        .any(|x| x.id == partner.id));

    // ---- Article CRUD
    let article = article_repo::create(
        &pool,
        CreateArticle {
            code: "ART_T1".into(),
            barcode: "9991110001111".into(),
            name: "Article Test".into(),
            family_id: Some(family_parent.id.clone()),
            sub_family_id: Some(family_child.id.clone()),
            purchase_price: 1000,
            sale_price: 1500,
            tax_rate_id: None,
            unit: unit.id.clone(),
        },
    )
    .await
    .expect("create article");
    assert!(article_repo::search(&pool, "ART_T1")
        .await
        .expect("search article")
        .iter()
        .any(|x| x.id == article.id));
    let article = article_repo::update(
        &pool,
        UpdateArticle {
            id: article.id.clone(),
            code: Some("ART_T1U".into()),
            barcode: None,
            name: Some("Article Test U".into()),
            family_id: None,
            sub_family_id: None,
            purchase_price: Some(1200),
            sale_price: Some(1700),
            tax_rate_id: None,
            unit: None,
            active: Some(true),
        },
    )
    .await
    .expect("update article");

    let sales_article = article_repo::create(
        &pool,
        CreateArticle {
            code: "ART_S1".into(),
            barcode: "9991110003333".into(),
            name: "Article Sales".into(),
            family_id: Some(family_parent.id.clone()),
            sub_family_id: Some(family_child.id.clone()),
            purchase_price: 1100,
            sale_price: 1800,
            tax_rate_id: None,
            unit: unit.id.clone(),
        },
    )
    .await
    .expect("create sales article");

    // ---- Article code create/list/search/delete
    let article_code = article_code_repo::create(
        &pool,
        CreateArticleCode {
            article_id: article.id.clone(),
            code: "ALT999111".into(),
            code_type: "barcode".into(),
        },
    )
    .await
    .expect("create article code");
    assert!(article_code_repo::list(&pool, Some(&article.id))
        .await
        .expect("list article codes")
        .iter()
        .any(|x| x.id == article_code.id));
    assert!(article_code_repo::search(&pool, "ALT999")
        .await
        .expect("search article code")
        .iter()
        .any(|x| x.id == article_code.id));

    // ---- Article BOM create/list/update(active)/delete-line
    let component = article_repo::create(
        &pool,
        CreateArticle {
            code: "ART_C1".into(),
            barcode: "9991110002222".into(),
            name: "Article Component".into(),
            family_id: Some(family_parent.id.clone()),
            sub_family_id: Some(family_child.id.clone()),
            purchase_price: 700,
            sale_price: 900,
            tax_rate_id: None,
            unit: unit.id.clone(),
        },
    )
    .await
    .expect("create component");
    let bom_header = article_bom_repo::create_header(
        &pool,
        CreateArticleBomHeader {
            parent_article_id: sales_article.id.clone(),
            name: "BOM Test".into(),
            output_quantity: 1,
        },
    )
    .await
    .expect("create bom header");
    assert!(article_bom_repo::list_headers(&pool, Some(&sales_article.id))
        .await
        .expect("list bom headers")
        .iter()
        .any(|x| x.id == bom_header.id));
    let bom_line = article_bom_repo::create_line(
        &pool,
        CreateArticleBomLine {
            bom_id: bom_header.id.clone(),
            component_article_id: component.id.clone(),
            quantity: 2,
        },
    )
    .await
    .expect("create bom line");
    assert!(article_bom_repo::list_lines(&pool, &bom_header.id)
        .await
        .expect("list bom lines")
        .iter()
        .any(|x| x.id == bom_line.id));
    article_bom_repo::set_header_active(&pool, &bom_header.id, false)
        .await
        .expect("set bom header inactive");

    // ---- Stock movement create/list/update/delete
    let stock_mv = stock_repo::create_movement(
        &pool,
        "entry",
        &article.id,
        &depot.id,
        None,
        10,
        "STOCK-T1",
        "entry",
    )
    .await
    .expect("create stock movement");
    assert!(stock_repo::list_movements(&pool, Some(&article.id))
        .await
        .expect("list stock movements")
        .iter()
        .any(|x| x.id == stock_mv.id));
    let stock_mv = stock_repo::update_movement(
        &pool,
        &stock_mv.id,
        "entry",
        &article.id,
        &depot.id,
        None,
        12,
        "STOCK-T1-U",
        "entry-u",
    )
    .await
    .expect("update stock movement");
    stock_repo::delete_movement(&pool, &stock_mv.id)
        .await
        .expect("delete stock movement");

    // ---- POS session + cash movement flow
    let session = pos_repo::open_session(&pool, &register.id, &cashier.id, 50_000)
        .await
        .expect("open session");
    assert!(pos_repo::get_open_session(&pool)
        .await
        .expect("get open session")
        .is_some());
    let cash_mv = pos_repo::add_cash_movement(
        &pool,
        &session.id,
        "in",
        5_000,
        "cash in",
        &cashier.id,
        "Cashier Test",
    )
    .await
    .expect("add cash movement");
    assert!(pos_repo::list_cash_movements(&pool, &session.id)
        .await
        .expect("list cash movements")
        .iter()
        .any(|x| x.id == cash_mv.id));
    pos_repo::close_session(&pool, &session.id, 55_000)
        .await
        .expect("close session");

    // ---- Document create/read/status
    let (doc, doc_lines) = DocumentService::create_document(
        &pool,
        CreateDocument {
            doc_type: DocumentType::Invoice,
            partner_id: partner.id.clone(),
            partner_name: partner.name.clone(),
            notes: "doc".into(),
            lines: vec![CreateDocumentLine {
                article_id: sales_article.id.clone(),
                article_name: sales_article.name.clone(),
                quantity: 2,
                unit_price: sales_article.sale_price,
                tax_rate: 19,
            }],
        },
    )
    .await
    .expect("create document");
    assert!(!doc_lines.is_empty());
    assert!(document_repo::list(&pool, Some("invoice"))
        .await
        .expect("list documents")
        .iter()
        .any(|x| x.id == doc.id));
    document_repo::update_status(&pool, &doc.id, DocumentStatus::Paid.as_str())
        .await
        .expect("set document status");

    // ---- CRM profile/follow-up/reclamation flow
    let profile = crm_repo::upsert_profile(
        &pool,
        UpsertPartnerProfile {
            partner_id: partner.id.clone(),
            fiscal_address: "Fiscal".into(),
            commercial_contact: "Contact".into(),
            payment_model: "cash".into(),
            shipping_address: "Ship".into(),
            currency_code: "TND".into(),
            credit_control_enabled: true,
            loyalty_barcode: "LOYAL123".into(),
            family_segment: "A".into(),
            milestone_tier: "gold".into(),
            deferred_discount_rate: 100,
            global_discount_millimes: 500,
            allow_deferred_payment: true,
            deposit_balance: 0,
            last_visit_at: None,
            notes_ext: "notes".into(),
        },
    )
    .await
    .expect("upsert partner profile");
    assert_eq!(profile.partner_id, partner.id);
    assert!(crm_repo::get_partner_kpis(&pool, &partner.id).await.is_ok());

    let followup = crm_repo::create_followup(
        &pool,
        CreatePartnerFollowUp {
            partner_id: partner.id.clone(),
            subject: "Call".into(),
            due_date: Some(chrono::Utc::now()),
            priority: 3,
            notes: "followup".into(),
        },
    )
    .await
    .expect("create followup");
    let followup = crm_repo::update_followup_status(
        &pool,
        UpdatePartnerFollowUpStatus {
            id: followup.id.clone(),
            status: "done".into(),
        },
    )
    .await
    .expect("update followup status");
    assert_eq!(followup.status, "done");

    let reclamation = crm_repo::create_reclamation(
        &pool,
        CreatePartnerReclamation {
            partner_id: Some(partner.id.clone()),
            title: "Issue".into(),
            description: "Desc".into(),
            severity: "medium".into(),
            source: "internal".into(),
        },
    )
    .await
    .expect("create reclamation");
    let reclamation = crm_repo::update_reclamation_status(
        &pool,
        UpdatePartnerReclamationStatus {
            id: reclamation.id.clone(),
            status: "resolved".into(),
        },
    )
    .await
    .expect("update reclamation status");
    assert_eq!(reclamation.status, "resolved");

    // ---- User/role operations
    assert!(!user_repo::list_users(&pool)
        .await
        .expect("list users")
        .is_empty());
    assert!(!user_repo::list_roles(&pool)
        .await
        .expect("list roles")
        .is_empty());
    assert_eq!(
        user_repo::authenticate_pin(&pool, "1234")
            .await
            .expect("authenticate admin")
            .role,
        "admin"
    );
    user_repo::update_role_permissions(&pool, "manager", &["dashboard".into(), "pos".into()])
    .await
    .expect("update role permissions");

    // ---- Delete order for dependent entities
    article_code_repo::delete(&pool, &article_code.id)
        .await
        .expect("delete article code");
    article_bom_repo::delete_line(&pool, &bom_line.id)
        .await
        .expect("delete bom line");
    article_repo::delete(&pool, &component.id)
        .await
        .expect("delete component article");
    article_repo::delete(&pool, &article.id)
        .await
        .expect("delete article");
    advanced_tax_rate_repo::delete(&pool, &advanced_tax_rate.id)
        .await
        .expect("delete advanced tax rate");
    accounting_category_repo::delete(&pool, &accounting_category.id)
        .await
        .expect("delete accounting category");
    tariff_category_repo::delete(&pool, &tariff_category.id)
        .await
        .expect("delete tariff category");
    product_range_repo::delete(&pool, &product_range.id)
        .await
        .expect("delete product range");
    gondola_repo::delete(&pool, &gondola.id)
        .await
        .expect("delete gondola");
    rayon_repo::delete(&pool, &rayon.id)
        .await
        .expect("delete rayon");
    country_repo::delete(&pool, &country.id)
        .await
        .expect("delete country");
    depot_repo::delete(&pool, &depot.id)
        .await
        .expect("delete depot");
    unit_of_measure_repo::delete(&pool, &unit.id)
        .await
        .expect("delete base unit");

    let _ = std::fs::remove_file(&db_path);
}
