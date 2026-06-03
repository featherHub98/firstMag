#![allow(clippy::needless_borrows_for_generic_args)]

use firstmag_lib::domain::{
    CreateArticle, CreateDocument, CreateDocumentLine, CreatePartner, DocumentType, PartnerType,
    UpdateArticle,
};
use firstmag_lib::persistence::{
    article_repo, document_repo, partner_repo, pos_repo, report_repo, stock_repo,
};
use firstmag_lib::reports::{
    invoice::{generate_invoice, InvoiceData},
    receipt::{generate_receipt, ReceiptData},
    sale_report::generate_sale_report,
};
use firstmag_lib::service::DocumentService;
use sqlx::SqlitePool;
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

struct TestContext {
    pool: SqlitePool,
    output_dir: PathBuf,
    report_lines: Vec<String>,
    passed: u32,
    failed: u32,
}

impl TestContext {
    fn record(&mut self, name: &str, ok: bool, detail: String) {
        let marker = if ok { "PASS" } else { "FAIL" };
        let line = format!("| {} | {} | {} |", marker, name, detail);
        println!("  [{}] {} - {}", marker, name, detail);
        self.report_lines.push(line);
        if ok {
            self.passed += 1;
        } else {
            self.failed += 1;
        }
    }

    fn section(&mut self, title: &str) {
        println!("\n=== {} ===", title);
        self.report_lines.push(format!("\n## {}\n", title));
        self.report_lines
            .push("| Result | Test | Detail |".to_string());
        self.report_lines
            .push("|--------|------|--------|".to_string());
    }
}

#[tokio::main]
async fn main() {
    let args: Vec<String> = std::env::args().collect();
    let db_path = args
        .get(1)
        .cloned()
        .unwrap_or_else(|| "firstmag_e2e.db".to_string());
    let output_dir = PathBuf::from(
        args.get(2)
            .cloned()
            .unwrap_or_else(|| "target/e2e_output".to_string()),
    );

    let _ = fs::remove_file(&db_path);
    let _ = fs::remove_dir_all(&output_dir);
    fs::create_dir_all(&output_dir).expect("create output dir");

    println!("FIRST MAG - E2E Test Suite");
    println!("===========================");
    println!("DB:      {}", db_path);
    println!("Output:  {}", output_dir.display());
    println!();

    let pool = firstmag_lib::persistence::init_db(&db_path)
        .await
        .expect("init db");

    let mut ctx = TestContext {
        pool,
        output_dir,
        report_lines: Vec::new(),
        passed: 0,
        failed: 0,
    };

    ctx.report_lines
        .push("# FIRST MAG — E2E Test Report".to_string());
    ctx.report_lines.push(format!(
        "\nGenerated: {}",
        chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC")
    ));
    ctx.report_lines.push(format!("Database: `{}`", db_path));
    ctx.report_lines
        .push(format!("Output: `{}`", ctx.output_dir.display()));

    let partners = seed_partners(&ctx.pool).await;
    let article_ids = seed_articles(&ctx.pool).await;
    seed_stock(&ctx.pool, &article_ids).await;
    seed_historic_documents(&ctx.pool, &partners, &article_ids).await;

    run_article_tests(&mut ctx, &article_ids).await;
    run_partner_tests(&mut ctx, &partners).await;
    run_stock_tests(&mut ctx, &article_ids).await;
    run_pos_tests(&mut ctx).await;
    run_document_tests(&mut ctx, &partners, &article_ids).await;
    run_report_tests(&mut ctx).await;
    run_pdf_tests(&mut ctx).await;

    let total = ctx.passed + ctx.failed;
    println!("\n===========================");
    println!(
        "Result: {}/{} passed, {} failed",
        ctx.passed, total, ctx.failed
    );

    ctx.report_lines.push("\n## Summary".to_string());
    ctx.report_lines
        .push(format!("- **Total tests:** {}", total));
    ctx.report_lines
        .push(format!("- **Passed:** {}", ctx.passed));
    ctx.report_lines
        .push(format!("- **Failed:** {}", ctx.failed));

    let report_path = ctx.output_dir.join("E2E_REPORT.md");
    fs::write(&report_path, ctx.report_lines.join("\n")).expect("write report");
    println!("Report:  {}", report_path.display());

    if ctx.failed > 0 {
        std::process::exit(1);
    }
}

async fn seed_partners(pool: &SqlitePool) -> Vec<(String, String)> {
    let clients = vec![
        (
            "CL0001",
            "Sté Magasin Général SA",
            "12 Avenue de la République, Tunis",
            "+216 71 000 111",
            "contact@mg.com.tn",
            "1234567/A/M/000",
            5_000_000,
        ),
        (
            "CL0002",
            "Carrefour Market La Marsa",
            "Rue de la Plage, La Marsa",
            "+216 71 222 333",
            "mars@carrefour.tn",
            "2345678/B/M/000",
            3_000_000,
        ),
        (
            "CL0003",
            "Monoprix Menzah",
            "Avenue Mohamed V, Menzah 6",
            "+216 71 444 555",
            "menzah@monoprix.tn",
            "3456789/C/M/000",
            4_000_000,
        ),
        (
            "CL0004",
            "Restaurant Dar El Jeddi",
            "15 Rue des Épices, Médina, Tunis",
            "+216 71 666 777",
            "jeddi@dar.tn",
            "4567890/A/M/000",
            1_500_000,
        ),
        (
            "CL0005",
            "Café Maure Sidi Bou Saïd",
            "Place du 7 Novembre, Sidi Bou Saïd",
            "+216 71 888 999",
            "cafe@sbs.tn",
            "",
            800_000,
        ),
        (
            "CL0006",
            "Hôtel Laico Tunis",
            "Avenue Mohamed V, Tunis",
            "+216 71 100 200",
            "reservation@laico.tn",
            "5678901/B/M/000",
            10_000_000,
        ),
        (
            "CL0007",
            "Librairie El Kitab",
            "42 Avenue de France, Tunis",
            "+216 71 300 400",
            "info@elkitab.tn",
            "",
            1_000_000,
        ),
        (
            "CL0008",
            "Pharmacie Centrale",
            "7 Avenue Bourguiba, Tunis",
            "+216 71 500 600",
            "contact@pharma-centrale.tn",
            "6789012/A/M/000",
            2_500_000,
        ),
    ];

    let mut ids = Vec::new();
    for (code, name, addr, phone, email, tax_id, credit) in &clients {
        let p = partner_repo::create(
            pool,
            CreatePartner {
                partner_type: PartnerType::Client,
                code: code.to_string(),
                name: name.to_string(),
                address: addr.to_string(),
                phone: phone.to_string(),
                email: email.to_string(),
                tax_id: tax_id.to_string(),
                country_id: None,
                credit_limit: *credit,
                notes: String::new(),
            },
        )
        .await
        .expect("create partner");
        ids.push((p.id, p.name));
    }
    println!("Seeded {} clients", ids.len());
    ids
}

async fn seed_articles(pool: &SqlitePool) -> Vec<(String, String, i64, String)> {
    sqlx::query("INSERT INTO article_families (id, name) VALUES ('f_alim', 'Alimentation'), ('f_hyg', 'Hygiene'), ('f_bur', 'Bureau'), ('f_mais', 'Articles de maison')")
        .execute(pool).await.ok();
    sqlx::query(
        "INSERT INTO article_sub_families (id, name, family_id) VALUES
        ('sf_boiss', 'Boissons', 'f_alim'),
        ('sf_patiss', 'Patisserie', 'f_alim'),
        ('sf_corps', 'Soins du corps', 'f_hyg'),
        ('sf_ent', 'Entretien', 'f_hyg'),
        ('sf_pap', 'Papeterie', 'f_bur'),
        ('sf_cuis', 'Cuisine', 'f_mais')",
    )
    .execute(pool)
    .await
    .ok();
    sqlx::query(
        "INSERT INTO depots (id, code, name, address) VALUES
        ('d_main', 'DEP01', 'Depot Principal', 'Zone industrielle, Tunis'),
        ('d_sous', 'DEP02', 'Depot Sousse', 'Route de Sousse km 5')",
    )
    .execute(pool)
    .await
    .ok();

    let articles = vec![
        (
            "ART001",
            "6191234500011",
            "Eau Sidi Bou 1.5L",
            "f_alim",
            "sf_boiss",
            "pcs",
            700,
            1000,
        ),
        (
            "ART002",
            "5449000000996",
            "Coca-Cola 1.5L",
            "f_alim",
            "sf_boiss",
            "pcs",
            1800,
            2500,
        ),
        (
            "ART003",
            "2000000000017",
            "Baguette tradition",
            "f_alim",
            "sf_patiss",
            "pcs",
            250,
            400,
        ),
        (
            "ART004",
            "2000000000024",
            "Croissant au beurre",
            "f_alim",
            "sf_patiss",
            "pcs",
            600,
            900,
        ),
        (
            "ART005",
            "6191234500028",
            "Yaourt Delice vanille",
            "f_alim",
            "sf_boiss",
            "pcs",
            850,
            1200,
        ),
        (
            "ART006",
            "6191234500035",
            "Lait Centrale 1L",
            "f_alim",
            "sf_boiss",
            "pcs",
            1500,
            1900,
        ),
        (
            "ART007",
            "3014260100001",
            "Savon de Marseille 300g",
            "f_hyg",
            "sf_corps",
            "pcs",
            1200,
            1800,
        ),
        (
            "ART008",
            "8000700000017",
            "Shampooing Dove 400ml",
            "f_hyg",
            "sf_corps",
            "pcs",
            4500,
            6500,
        ),
        (
            "ART009",
            "3014260100018",
            "Dentifrice Colgate 100ml",
            "f_hyg",
            "sf_corps",
            "pcs",
            2800,
            3900,
        ),
        (
            "ART010",
            "3059940000011",
            "Liquide vaisselle Paic 1L",
            "f_hyg",
            "sf_ent",
            "pcs",
            3200,
            4500,
        ),
        (
            "ART011",
            "3014260100025",
            "Cahier 96 pages",
            "f_bur",
            "sf_pap",
            "pcs",
            1500,
            2200,
        ),
        (
            "ART012",
            "3014260100032",
            "Stylo BIC bleu",
            "f_bur",
            "sf_pap",
            "pcs",
            250,
            500,
        ),
        (
            "ART013",
            "3014260100049",
            "Ramette papier A4 80g",
            "f_bur",
            "sf_pap",
            "pcs",
            12000,
            16000,
        ),
        (
            "ART014",
            "2000000000031",
            "Verre a the",
            "f_mais",
            "sf_cuis",
            "pcs",
            800,
            1500,
        ),
        (
            "ART015",
            "2000000000048",
            "Assiette plate 26cm",
            "f_mais",
            "sf_cuis",
            "pcs",
            2500,
            4000,
        ),
        (
            "ART016",
            "2000000000055",
            "Casserole inox 24cm",
            "f_mais",
            "sf_cuis",
            "pcs",
            8500,
            13000,
        ),
        (
            "ART017",
            "6191234500042",
            "Couscous fin 1kg",
            "f_alim",
            "sf_boiss",
            "kg",
            2200,
            3000,
        ),
        (
            "ART018",
            "6191234500059",
            "Huile d olive extra 1L",
            "f_alim",
            "sf_boiss",
            "pcs",
            4500,
            6500,
        ),
        (
            "ART019",
            "6191234500066",
            "Sucre en poudre 1kg",
            "f_alim",
            "sf_boiss",
            "kg",
            1300,
            1900,
        ),
        (
            "ART020",
            "8004690021011",
            "Cafe Lavazza 250g",
            "f_alim",
            "sf_boiss",
            "pcs",
            6500,
            9500,
        ),
    ];

    let mut ids = Vec::new();
    for (code, barcode, name, fam, sub, unit, pp, sp) in &articles {
        let a = article_repo::create(
            pool,
            CreateArticle {
                code: code.to_string(),
                barcode: barcode.to_string(),
                name: name.to_string(),
                family_id: Some(fam.to_string()),
                sub_family_id: Some(sub.to_string()),
                purchase_price: *pp,
                sale_price: *sp,
                tax_rate_id: Some("tva_19".to_string()),
                unit: unit.to_string(),
            },
        )
        .await
        .expect("create article");
        ids.push((a.id, a.name, a.sale_price, a.code));
    }
    println!("Seeded {} articles", ids.len());
    ids
}

async fn seed_stock(pool: &SqlitePool, articles: &[(String, String, i64, String)]) {
    let now = chrono::Utc::now();
    for (i, (id, _, _, _)) in articles.iter().enumerate() {
        let qty = 50 + (i as i64 * 5) % 200;
        sqlx::query("INSERT INTO stock_movements (id, movement_type, article_id, depot_id, quantity, reference, notes, created_at) VALUES (?, 'entry', ?, 'd_main', ?, 'SEED-001', 'Stock initial', ?)")
            .bind(&Uuid::new_v4().to_string())
            .bind(&id)
            .bind(&qty)
            .bind(&now)
            .execute(pool).await.expect("seed stock");
    }
    println!("Seeded stock movements for {} articles", articles.len());
}

async fn seed_historic_documents(
    pool: &SqlitePool,
    partners: &[(String, String)],
    articles: &[(String, String, i64, String)],
) {
    let historic = vec![
        (DocumentType::Quote, "DEV000001", 0usize, 5),
        (DocumentType::Invoice, "FAC000001", 1, 12),
        (DocumentType::Invoice, "FAC000002", 5, 4),
    ];
    for (doc_type, number, partner_idx, qty) in &historic {
        let (pid, pname) = &partners[*partner_idx];
        let lines: Vec<CreateDocumentLine> = (0..*qty)
            .map(|i| {
                let (aid, aname, price, _) = &articles[i % articles.len()];
                CreateDocumentLine {
                    article_id: aid.clone(),
                    article_name: aname.clone(),
                    quantity: ((i as i64) % 3) + 1,
                    unit_price: *price,
                    tax_rate: 19,
                }
            })
            .collect();
        let cmd = CreateDocument {
            doc_type: doc_type.clone(),
            partner_id: pid.clone(),
            partner_name: pname.clone(),
            notes: format!("Document historique: {number}"),
            lines,
        };
        let (doc, _) = DocumentService::create_document(pool, cmd)
            .await
            .expect("seed doc");
        document_repo::update_status(pool, &doc.id, "confirmed")
            .await
            .ok();
        sqlx::query("UPDATE document_series SET next_number = next_number + 1 WHERE doc_type = ?")
            .bind(&doc_type.as_str())
            .execute(pool)
            .await
            .ok();
    }
    println!("Seeded {} historic documents", historic.len());
}

async fn run_article_tests(ctx: &mut TestContext, article_ids: &[(String, String, i64, String)]) {
    ctx.section("1. Articles");

    let all = article_repo::list(&ctx.pool).await.expect("list");
    ctx.record(
        "list articles",
        all.len() == 20,
        format!("got {} articles", all.len()),
    );

    let found = article_repo::search(&ctx.pool, "Coca")
        .await
        .expect("search");
    ctx.record(
        "search 'Coca' -> Coca-Cola 1.5L",
        found.len() == 1 && found[0].name == "Coca-Cola 1.5L",
        format!("{} match(es)", found.len()),
    );

    let by_barcode = article_repo::search(&ctx.pool, "5449000000996")
        .await
        .expect("search barcode");
    ctx.record(
        "search by barcode EAN-13",
        by_barcode.len() == 1 && by_barcode[0].code == "ART002",
        format!("{} match(es)", by_barcode.len()),
    );

    let no_result = article_repo::search(&ctx.pool, "ZZZ_INEXISTANT")
        .await
        .expect("search miss");
    ctx.record(
        "search miss returns empty",
        no_result.is_empty(),
        format!("{} match(es)", no_result.len()),
    );

    let (first_id, _, _, _) = &article_ids[0];
    let fetched = article_repo::get_by_id(&ctx.pool, first_id)
        .await
        .expect("get");
    ctx.record(
        "get by id",
        fetched.id == *first_id,
        format!("id={}", fetched.id),
    );

    let new = article_repo::create(
        &ctx.pool,
        CreateArticle {
            code: "ART999".to_string(),
            barcode: "9999999999999".to_string(),
            name: "Article de test E2E".to_string(),
            family_id: Some("f_alim".to_string()),
            sub_family_id: Some("sf_boiss".to_string()),
            purchase_price: 500,
            sale_price: 800,
            tax_rate_id: Some("tva_19".to_string()),
            unit: "pcs".to_string(),
        },
    )
    .await
    .expect("create");
    ctx.record(
        "create article",
        new.code == "ART999",
        format!("id={}", new.id),
    );

    let updated = article_repo::update(
        &ctx.pool,
        UpdateArticle {
            id: new.id.clone(),
            code: None,
            barcode: None,
            name: Some("Article E2E renomme".to_string()),
            family_id: None,
            sub_family_id: None,
            purchase_price: None,
            sale_price: Some(900),
            tax_rate_id: None,
            unit: None,
            active: None,
        },
    )
    .await
    .expect("update");
    ctx.record(
        "update article (name + price)",
        updated.name == "Article E2E renomme" && updated.sale_price == 900,
        format!("name={} price={}", updated.name, updated.sale_price),
    );

    article_repo::delete(&ctx.pool, &new.id)
        .await
        .expect("delete");
    let after_delete = article_repo::list(&ctx.pool).await.expect("list");
    ctx.record(
        "delete article",
        after_delete.len() == 20,
        format!("count back to {}", after_delete.len()),
    );
}

async fn run_partner_tests(ctx: &mut TestContext, partners: &[(String, String)]) {
    ctx.section("2. Partners (Tiers)");

    let clients = partner_repo::list(&ctx.pool, Some("client"))
        .await
        .expect("list");
    ctx.record(
        "list clients",
        clients.len() == 8,
        format!("got {} clients", clients.len()),
    );

    let search = partner_repo::search(&ctx.pool, "Magasin")
        .await
        .expect("search");
    ctx.record(
        "search 'Magasin'",
        search.len() == 1 && search[0].name.contains("Magasin"),
        format!("{} match(es)", search.len()),
    );

    let by_phone = partner_repo::search(&ctx.pool, "71 500 600")
        .await
        .expect("phone");
    ctx.record(
        "search by phone",
        by_phone.iter().any(|p| p.code == "CL0008"),
        format!("{} match(es)", by_phone.len()),
    );

    let (pid, pname) = &partners[0];
    let fetched = partner_repo::get_by_id(&ctx.pool, pid).await.expect("get");
    ctx.record(
        "get by id",
        fetched.name == *pname,
        format!("name={}", fetched.name),
    );

    let new = partner_repo::create(
        &ctx.pool,
        CreatePartner {
            partner_type: PartnerType::Client,
            code: "CL9999".to_string(),
            name: "Client de test E2E".to_string(),
            address: "123 Rue de Test, Tunis".to_string(),
            phone: "+216 71 999 999".to_string(),
            email: "test@e2e.tn".to_string(),
            tax_id: "9999999/A/M/000".to_string(),
            country_id: None,
            credit_limit: 500_000,
            notes: "Cree par le runner E2E".to_string(),
        },
    )
    .await
    .expect("create");
    ctx.record(
        "create client",
        new.code == "CL9999",
        format!("id={}", new.id),
    );

    let after = partner_repo::list(&ctx.pool, Some("client"))
        .await
        .expect("list");
    ctx.record(
        "count after insert",
        after.len() == 9,
        format!("got {}", after.len()),
    );
}

async fn run_stock_tests(ctx: &mut TestContext, article_ids: &[(String, String, i64, String)]) {
    ctx.section("3. Stock");

    let (first_id, name, _, _) = &article_ids[0];
    let level = stock_repo::get_level(&ctx.pool, first_id)
        .await
        .expect("level");
    ctx.record(
        "get stock level",
        level.quantity > 0,
        format!("{} = {} unites", name, level.quantity),
    );

    let movements = stock_repo::list_movements(&ctx.pool, Some(first_id))
        .await
        .expect("list");
    ctx.record(
        "list movements for article",
        !movements.is_empty() && movements[0].movement_type == "entry",
        format!("{} movements", movements.len()),
    );

    let all_movements = stock_repo::list_movements(&ctx.pool, None)
        .await
        .expect("list all");
    ctx.record(
        "list all movements",
        all_movements.len() >= article_ids.len(),
        format!("{} movements", all_movements.len()),
    );

    let exit_id = Uuid::new_v4().to_string();
    sqlx::query("INSERT INTO stock_movements (id, movement_type, article_id, depot_id, quantity, reference, notes, created_at) VALUES (?, 'exit', ?, 'd_main', 5, 'TEST-001', 'Sortie test', ?)")
        .bind(&exit_id).bind(&first_id).bind(&chrono::Utc::now())
        .execute(&ctx.pool).await.expect("insert exit");
    let level2 = stock_repo::get_level(&ctx.pool, first_id)
        .await
        .expect("level");
    ctx.record(
        "exit movement decreases level",
        level2.quantity == level.quantity - 5,
        format!("{} -> {}", level.quantity, level2.quantity),
    );
}

async fn run_pos_tests(ctx: &mut TestContext) {
    ctx.section("4. POS (Caisse)");

    let opened = pos_repo::get_open_session(&ctx.pool).await.expect("get");
    ctx.record(
        "no open session initially",
        opened.is_none(),
        format!("is_none={}", opened.is_none()),
    );

    let session = pos_repo::open_session(&ctx.pool, "1", "1", 50_000)
        .await
        .expect("open");
    ctx.record(
        "open session",
        session.status == "open" && session.opening_fund == 50_000,
        format!("id={} fund={}", &session.id[..8], session.opening_fund),
    );

    let dup = pos_repo::open_session(&ctx.pool, "1", "1", 0).await;
    ctx.record(
        "double open is rejected",
        dup.is_err(),
        format!("err={:?}", dup.err().map(|e| e.to_string())),
    );

    let ticket1 = pos_repo::create_ticket(&ctx.pool, &session.id)
        .await
        .expect("ticket 1");
    let ticket2 = pos_repo::create_ticket(&ctx.pool, &session.id)
        .await
        .expect("ticket 2");
    ctx.record(
        "create tickets (counter)",
        ticket1.ticket_number == 1 && ticket2.ticket_number == 2,
        format!("#{} #{}", ticket1.ticket_number, ticket2.ticket_number),
    );

    let updated = pos_repo::close_session(&ctx.pool, &session.id, 250_000)
        .await
        .expect("close");
    ctx.record(
        "close session",
        updated.status == "closed" && updated.closing_fund == Some(250_000),
        format!(
            "status={} closing={:?}",
            updated.status, updated.closing_fund
        ),
    );
}

async fn run_document_tests(
    ctx: &mut TestContext,
    partners: &[(String, String)],
    articles: &[(String, String, i64, String)],
) {
    ctx.section("5. Documents (Ventes)");

    let all = document_repo::list(&ctx.pool, None).await.expect("list");
    ctx.record(
        "list documents (3 historic seeded)",
        all.len() == 3,
        format!("got {}", all.len()),
    );

    let invoices = document_repo::list(&ctx.pool, Some("invoice"))
        .await
        .expect("invoices");
    ctx.record(
        "list invoices (2 historic seeded)",
        invoices.len() == 2,
        format!("got {}", invoices.len()),
    );

    let (pid, pname) = &partners[0];
    let (a1_id, a1_name, a1_price, _) = &articles[0];
    let (a2_id, a2_name, a2_price, _) = &articles[1];
    let lines = vec![
        CreateDocumentLine {
            article_id: a1_id.clone(),
            article_name: a1_name.clone(),
            quantity: 3,
            unit_price: *a1_price,
            tax_rate: 19,
        },
        CreateDocumentLine {
            article_id: a2_id.clone(),
            article_name: a2_name.clone(),
            quantity: 2,
            unit_price: *a2_price,
            tax_rate: 19,
        },
    ];
    let cmd = CreateDocument {
        doc_type: DocumentType::Quote,
        partner_id: pid.clone(),
        partner_name: pname.clone(),
        notes: "Devis test E2E".to_string(),
        lines,
    };
    let (quote, quote_lines) = DocumentService::create_document(&ctx.pool, cmd)
        .await
        .expect("create quote");
    let expected_ht = 3 * *a1_price + 2 * *a2_price;
    let expected_tax = expected_ht * 19 / 100;
    let _expected_ttc = expected_ht + expected_tax;
    ctx.record(
        "create quote draft",
        quote.status == "draft" && quote.total_ht == expected_ht,
        format!(
            "HT={} Tax={} TTC={}",
            quote.total_ht, quote.total_tax, quote.total_ttc
        ),
    );
    ctx.record(
        "quote has 2 lines",
        quote_lines.len() == 2,
        format!("{} lines", quote_lines.len()),
    );

    let after_create = document_repo::list(&ctx.pool, None).await.expect("list");
    ctx.record(
        "count after quote created",
        after_create.len() == 4,
        format!("got {}", after_create.len()),
    );

    document_repo::update_status(&ctx.pool, &quote.id, "confirmed")
        .await
        .expect("confirm");
    let confirmed = document_repo::get_by_id(&ctx.pool, &quote.id)
        .await
        .expect("get");
    ctx.record(
        "confirm quote",
        confirmed.status == "confirmed",
        format!("status={}", confirmed.status),
    );

    let order = DocumentService::transform_document(&ctx.pool, &quote.id)
        .await
        .expect("transform to order");
    ctx.record(
        "transform quote -> order",
        order.doc_type == "order" && order.doc_number.starts_with("BC"),
        format!("{} {}", order.doc_type, order.doc_number),
    );

    let delivery = DocumentService::transform_document(&ctx.pool, &order.id)
        .await
        .expect("transform to delivery");
    ctx.record(
        "transform order -> delivery",
        delivery.doc_type == "delivery" && delivery.doc_number.starts_with("BL"),
        format!("{} {}", delivery.doc_type, delivery.doc_number),
    );

    let invoice = DocumentService::transform_document(&ctx.pool, &delivery.id)
        .await
        .expect("transform to invoice");
    ctx.record(
        "transform delivery -> invoice",
        invoice.doc_type == "invoice" && invoice.doc_number.starts_with("FAC"),
        format!("{} {}", invoice.doc_type, invoice.doc_number),
    );

    let cannot_transform = DocumentService::transform_document(&ctx.pool, &invoice.id).await;
    ctx.record(
        "invoice cannot be transformed",
        cannot_transform.is_err(),
        format!("err={:?}", cannot_transform.err().map(|e| e.to_string())),
    );

    let inv_lines = document_repo::get_lines(&ctx.pool, &invoice.id)
        .await
        .expect("lines");
    ctx.record(
        "invoice has lines from original",
        inv_lines.len() == 2,
        format!("{} lines", inv_lines.len()),
    );

    let empty = DocumentService::create_document(
        &ctx.pool,
        CreateDocument {
            doc_type: DocumentType::Quote,
            partner_id: pid.clone(),
            partner_name: pname.clone(),
            notes: String::new(),
            lines: vec![],
        },
    )
    .await;
    ctx.record(
        "empty document rejected",
        empty.is_err(),
        format!("err={:?}", empty.err().map(|e| e.to_string())),
    );
}

async fn run_report_tests(ctx: &mut TestContext) {
    ctx.section("6. Reports (X/Z)");

    let (since, until) = report_repo::today_range();
    let x = report_repo::sales_summary(&ctx.pool, &since, &until)
        .await
        .expect("x");
    ctx.record(
        "X report loads",
        x.total_transactions >= 2,
        format!("txns={} TTC={}", x.total_transactions, x.total_ttc),
    );

    let z = report_repo::sales_summary(&ctx.pool, &since, &until)
        .await
        .expect("z");
    ctx.record(
        "Z report loads",
        z.total_ttc == x.total_ttc,
        format!("TTC={} == X", z.total_ttc),
    );

    ctx.record(
        "X has qty sum",
        z.total_quantity > 0,
        format!("qty={}", z.total_quantity),
    );
}

async fn run_pdf_tests(ctx: &mut TestContext) {
    ctx.section("7. PDF Generation");

    let invoices = document_repo::list(&ctx.pool, Some("invoice"))
        .await
        .expect("list");
    let inv = invoices.first().expect("at least one invoice");
    let lines = document_repo::get_lines(&ctx.pool, &inv.id)
        .await
        .expect("lines");

    let invoice_pdf = generate_invoice(&InvoiceData {
        doc: inv,
        lines: &lines,
        company_name: "FIRST MAG",
        company_address: "12 Avenue de la Republique, Tunis",
        company_phone: "+216 71 000 000",
        company_tax_id: "1234567/A/M/000",
    });
    let inv_path = match invoice_pdf {
        Ok(bytes) => {
            let p = ctx.output_dir.join("sample_invoice_A4.pdf");
            fs::write(&p, &bytes).expect("write pdf");
            ctx.record(
                "generate A4 invoice PDF",
                bytes.starts_with(b"%PDF-"),
                format!("{} bytes -> {}", bytes.len(), p.display()),
            );
            Some(p)
        }
        Err(e) => {
            ctx.record("generate A4 invoice PDF", false, format!("err: {e}"));
            None
        }
    };

    let receipt_pdf = generate_receipt(&ReceiptData {
        doc: inv,
        lines: &lines,
        header: "FIRST MAG",
        payment_label: "Paiement: Especes",
    });
    match receipt_pdf {
        Ok(bytes) => {
            let p = ctx.output_dir.join("sample_receipt_80mm.pdf");
            fs::write(&p, &bytes).expect("write pdf");
            ctx.record(
                "generate 80mm receipt PDF",
                bytes.starts_with(b"%PDF-"),
                format!("{} bytes -> {}", bytes.len(), p.display()),
            );
        }
        Err(e) => ctx.record("generate 80mm receipt PDF", false, format!("err: {e}")),
    };

    let (since, until) = report_repo::today_range();
    if let Ok(report) = report_repo::sales_summary(&ctx.pool, &since, &until).await {
        let x_pdf = generate_sale_report(&report, "Rapport X - Test E2E");
        match x_pdf {
            Ok(bytes) => {
                let p = ctx.output_dir.join("sample_report_X.pdf");
                fs::write(&p, &bytes).expect("write pdf");
                ctx.record(
                    "generate X report PDF",
                    bytes.starts_with(b"%PDF-"),
                    format!("{} bytes -> {}", bytes.len(), p.display()),
                );
            }
            Err(e) => ctx.record("generate X report PDF", false, format!("err: {e}")),
        }
        let z_pdf = generate_sale_report(&report, "Rapport Z - Test E2E");
        match z_pdf {
            Ok(bytes) => {
                let p = ctx.output_dir.join("sample_report_Z.pdf");
                fs::write(&p, &bytes).expect("write pdf");
                ctx.record(
                    "generate Z report PDF",
                    bytes.starts_with(b"%PDF-"),
                    format!("{} bytes -> {}", bytes.len(), p.display()),
                );
            }
            Err(e) => ctx.record("generate Z report PDF", false, format!("err: {e}")),
        }
    }

    if let Some(p) = inv_path {
        ctx.record(
            "PDF file is non-empty",
            fs::metadata(&p).map(|m| m.len() > 100).unwrap_or(false),
            format!("{}", p.display()),
        );
    }
}


