use sqlx::SqlitePool;
use sqlx::Row;
use std::env;

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: db_inspect <db_path> [limit]");
        std::process::exit(1);
    }
    let db = &args[1];
    let limit: i64 = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(5);

    let pool = SqlitePool::connect(db).await.expect("connect");

    let total: i64 = sqlx::query("SELECT COUNT(*) AS c FROM articles")
        .fetch_one(&pool).await.unwrap().get("c");
    println!("Total articles: {total}");

    let rows = sqlx::query(
        "SELECT code, name, purchase_price, sale_price, unit
         FROM articles
         WHERE purchase_price > 0
         ORDER BY code
         LIMIT ?1"
    )
    .bind(limit)
    .fetch_all(&pool).await.unwrap();

    println!("\nFirst {limit} articles with PA > 0:");
    for r in rows {
        let code: String = r.get("code");
        let name: String = r.get("name");
        let pa: i64 = r.get("purchase_price");
        let pv: i64 = r.get("sale_price");
        let unit: String = r.get("unit");
        println!("  {code:12} PA={pa:>7} millimes ({pa_f:7.3} DT)  PV={pv:>7} millimes ({pv_f:7.3} DT)  {unit:3}  {name}",
            pa_f = pa as f64 / 1000.0, pv_f = pv as f64 / 1000.0);
    }

    let zeros: i64 = sqlx::query("SELECT COUNT(*) AS c FROM articles WHERE purchase_price = 0")
        .fetch_one(&pool).await.unwrap().get("c");
    let high: i64 = sqlx::query("SELECT COUNT(*) AS c FROM articles WHERE purchase_price > 100000")
        .fetch_one(&pool).await.unwrap().get("c");
    let total_pa: i64 = sqlx::query("SELECT COALESCE(SUM(purchase_price), 0) AS s FROM articles")
        .fetch_one(&pool).await.unwrap().get("s");
    let total_pv: i64 = sqlx::query("SELECT COALESCE(SUM(sale_price), 0) AS s FROM articles")
        .fetch_one(&pool).await.unwrap().get("s");
    println!("\nPA=0: {zeros}, PA>100DT: {high}");
    println!("Total stock value PA: {} DT ({} millimes)", total_pa as f64 / 1000.0, total_pa);
    println!("Total stock value PV: {} DT ({} millimes)", total_pv as f64 / 1000.0, total_pv);
}
