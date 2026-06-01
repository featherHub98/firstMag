use sqlx::SqlitePool;
use crate::domain::{
    CreateDocument, CreateDocumentLine, Document, DocumentLine, DocumentType, DocumentStatus,
    DomainResult, DomainError,
};
use crate::persistence::document_repo;
use uuid::Uuid;

pub struct DocumentService;

impl DocumentService {
    pub async fn create_document(
        pool: &SqlitePool,
        cmd: CreateDocument,
    ) -> DomainResult<(Document, Vec<DocumentLine>)> {
        if cmd.lines.is_empty() {
            return Err(DomainError::Validation("Le document doit avoir au moins une ligne".into()));
        }
        if cmd.partner_id.is_empty() {
            return Err(DomainError::Validation("Le document doit avoir un tiers".into()));
        }

        let doc_number = document_repo::get_next_doc_number(pool, cmd.doc_type.as_str()).await?;
        let doc_id = Uuid::new_v4().to_string();

        let total_ht: i64 = cmd.lines.iter().map(|l| l.unit_price * l.quantity).sum();
        let total_tax: i64 = cmd.lines.iter().map(|l| l.unit_price * l.quantity * l.tax_rate / 100).sum();
        let total_ttc = total_ht + total_tax;

        let doc = Document::new(
            doc_id.clone(),
            cmd.doc_type.as_str(),
            &doc_number,
            &cmd.partner_id,
            &cmd.partner_name,
            &cmd.notes,
            total_ht,
            total_tax,
            total_ttc,
        );

        let lines: Vec<DocumentLine> = cmd.lines.iter().map(|l| {
            DocumentLine {
                id: Uuid::new_v4().to_string(),
                document_id: doc_id.clone(),
                article_id: l.article_id.clone(),
                article_name: l.article_name.clone(),
                quantity: l.quantity,
                unit_price: l.unit_price,
                tax_rate: l.tax_rate,
                total_ht: l.unit_price * l.quantity,
                total_ttc: l.unit_price * l.quantity * (100 + l.tax_rate) / 100,
            }
        }).collect();

        document_repo::create_with_lines(pool, &doc, &lines).await?;
        Ok((doc, lines))
    }

    pub async fn transform_document(pool: &SqlitePool, doc_id: &str) -> DomainResult<Document> {
        let doc = document_repo::get_by_id(pool, doc_id).await?;

        if doc.status != DocumentStatus::Confirmed.as_str() && doc.status != DocumentStatus::Draft.as_str() {
            return Err(DomainError::InvalidOperation(
                "Seuls les documents en brouillon ou confirmés peuvent être transformés".into()
            ));
        }

        let doc_type = DocumentType::from_str(&doc.doc_type)
            .ok_or_else(|| DomainError::InvalidOperation("Type de document inconnu".into()))?;

        let target_type = doc_type.transform_to()
            .ok_or_else(|| DomainError::InvalidOperation("Ce type de document ne peut pas être transformé".into()))?;

        let lines = document_repo::get_lines(pool, doc_id).await?;

        let create_lines: Vec<CreateDocumentLine> = lines.iter().map(|l| CreateDocumentLine {
            article_id: l.article_id.clone(),
            article_name: l.article_name.clone(),
            quantity: l.quantity,
            unit_price: l.unit_price,
            tax_rate: l.tax_rate,
        }).collect();

        let cmd = CreateDocument {
            doc_type: target_type,
            partner_id: doc.partner_id.clone(),
            partner_name: doc.partner_name.clone(),
            notes: doc.notes.clone(),
            lines: create_lines,
        };

        let (new_doc, _) = Self::create_document(pool, cmd).await?;

        document_repo::update_status(pool, doc_id, DocumentStatus::Transformed.as_str()).await?;

        Ok(new_doc)
    }
}
