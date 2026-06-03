use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::str::FromStr;

pub async fn init_db(db_path: &str) -> Result<SqlitePool, sqlx::Error> {
    let opts = SqliteConnectOptions::from_str(db_path)?
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(opts)
        .await?;

    run_migrations(&pool).await?;
    Ok(pool)
}

async fn run_migrations(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(include_str!("migrations/001_initial.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/002_references.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/003_salespersons.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/004_cash_movements.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/005_reference_parity.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/006_rayon_gondola.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/007_auth_seed.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/008_role_permissions.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/009_commercial_taxonomy.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/010_countries.sql"))
        .execute(pool)
        .await?;
    if let Err(err) = sqlx::query(include_str!("migrations/011_partner_country.sql"))
        .execute(pool)
        .await
    {
        if !err.to_string().contains("duplicate column name: country_id") {
            return Err(err);
        }
    }
    sqlx::query(include_str!("migrations/012_article_codes.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/013_article_bom.sql"))
        .execute(pool)
        .await?;
    sqlx::query(include_str!("migrations/014_wave4_crm.sql"))
        .execute(pool)
        .await?;
    Ok(())
}
