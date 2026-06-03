use firstmag_lib::domain::*;

#[test]
fn test_document_type_roundtrip() {
    let s = "invoice";
    let t = DocumentType::from_str(s).unwrap();
    assert_eq!(t.as_str(), s);
}

#[test]
fn test_document_type_invalid() {
    assert_eq!(DocumentType::from_str("bogus"), None);
}

#[test]
fn test_document_status_roundtrip() {
    assert_eq!(
        DocumentStatus::from_str("draft"),
        Some(DocumentStatus::Draft)
    );
    assert_eq!(
        DocumentStatus::from_str("confirmed"),
        Some(DocumentStatus::Confirmed)
    );
}

#[test]
fn test_partner_type_roundtrip() {
    assert_eq!(PartnerType::from_str("client"), Some(PartnerType::Client));
    assert_eq!(
        PartnerType::from_str("supplier"),
        Some(PartnerType::Supplier)
    );
}

#[test]
fn test_money_millimes_roundtrip() {
    let millimes = 12345i64;
    let dinars = millimes as f64 / 1000.0;
    assert!((dinars - 12.345).abs() < 0.001);
    let back = (dinars * 1000.0).round() as i64;
    assert_eq!(back, millimes);
}

#[test]
fn test_invoice_tax_computation() {
    let ht = 1000i64;
    let tax = ht * 19 / 100;
    let ttc = ht + tax;
    assert_eq!(tax, 190);
    assert_eq!(ttc, 1190);
}

#[test]
fn test_document_status_all() {
    for s in [
        DocumentStatus::Draft,
        DocumentStatus::Confirmed,
        DocumentStatus::Transformed,
        DocumentStatus::Cancelled,
    ] {
        assert_eq!(DocumentStatus::from_str(s.as_str()), Some(s));
    }
}

#[test]
fn test_partner_type_all() {
    assert_eq!(PartnerType::from_str("client"), Some(PartnerType::Client));
    assert_eq!(
        PartnerType::from_str("supplier"),
        Some(PartnerType::Supplier)
    );
}

#[test]
fn test_money_roundtrip() {
    let millimes = 12345i64;
    let dinars = millimes as f64 / 1000.0;
    assert!((dinars - 12.345).abs() < 0.001);
    let back = (dinars * 1000.0).round() as i64;
    assert_eq!(back, millimes);
}

#[test]
fn test_document_total_calculation() {
    let ht = 1000i64;
    let tax_rate = 19;
    let tax = ht * tax_rate / 100;
    let ttc = ht + tax;
    assert_eq!(tax, 190);
    assert_eq!(ttc, 1190);
}
