use crate::domain::{Document, DocumentLine};
use printpdf::*;

pub struct InvoiceData<'a> {
    pub doc: &'a Document,
    pub lines: &'a [DocumentLine],
    pub company_name: &'a str,
    pub company_address: &'a str,
    pub company_phone: &'a str,
    pub company_tax_id: &'a str,
}

pub fn generate_invoice(data: &InvoiceData) -> Result<Vec<u8>, String> {
    let (doc, page, layer) = PdfDocument::new("invoice", Mm(210.0), Mm(297.0), "Layer 1");

    let font = doc
        .add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| e.to_string())?;
    let bold = doc
        .add_builtin_font(BuiltinFont::HelveticaBold)
        .map_err(|e| e.to_string())?;

    let page = doc.get_page(page);
    let layer = page.get_layer(layer);

    let mut y: f32 = 280.0;

    // Company header
    layer.use_text(data.company_name, 18.0, Mm(20.0), Mm(y), &bold);
    y -= 6.0;
    layer.use_text(data.company_address, 10.0, Mm(20.0), Mm(y), &font);
    y -= 4.5;
    layer.use_text(
        format!("Tél: {}", data.company_phone),
        10.0,
        Mm(20.0),
        Mm(y),
        &font,
    );
    y -= 4.5;
    layer.use_text(
        format!("Mat. fiscale: {}", data.company_tax_id),
        10.0,
        Mm(20.0),
        Mm(y),
        &font,
    );

    // Document info
    y = 260.0;
    layer.use_text(
        format!("Facture N°: {}", data.doc.doc_number),
        12.0,
        Mm(120.0),
        Mm(y),
        &bold,
    );
    y -= 5.0;
    layer.use_text(
        format!("Date: {}", data.doc.created_at.format("%d/%m/%Y")),
        10.0,
        Mm(120.0),
        Mm(y),
        &font,
    );

    // Partner
    y = 240.0;
    layer.use_text("Client:", 10.0, Mm(20.0), Mm(y), &bold);
    y -= 5.0;
    layer.use_text(&data.doc.partner_name, 10.0, Mm(20.0), Mm(y), &font);
    y -= 5.0;

    // Table header
    y -= 5.0;
    draw_line(&layer, 20.0, y, 190.0, y);
    y -= 6.0;

    layer.use_text("Article", 9.0, Mm(22.0), Mm(y), &bold);
    layer.use_text("Qté", 9.0, Mm(100.0), Mm(y), &bold);
    layer.use_text("P.U", 9.0, Mm(120.0), Mm(y), &bold);
    layer.use_text("Total HT", 9.0, Mm(150.0), Mm(y), &bold);
    y -= 4.5;

    draw_line(&layer, 20.0, y, 190.0, y);
    y -= 6.0;

    // Lines
    for line in data.lines {
        if y < 40.0 {
            break;
        }
        layer.use_text(
            &truncate(&line.article_name, 30),
            9.0,
            Mm(22.0),
            Mm(y),
            &font,
        );
        layer.use_text(&line.quantity.to_string(), 9.0, Mm(102.0), Mm(y), &font);
        layer.use_text(
            &format!("{:.3}", line.unit_price as f64 / 1000.0),
            9.0,
            Mm(122.0),
            Mm(y),
            &font,
        );
        layer.use_text(
            &format!("{:.3}", line.total_ht as f64 / 1000.0),
            9.0,
            Mm(152.0),
            Mm(y),
            &font,
        );
        y -= 5.5;
    }

    // Totals
    y = 80.0;
    draw_line(&layer, 20.0, y, 190.0, y);
    y -= 7.0;

    layer.use_text(
        &format!("Total HT: {:.3} D", data.doc.total_ht as f64 / 1000.0),
        11.0,
        Mm(130.0),
        Mm(y),
        &font,
    );
    y -= 6.0;
    layer.use_text(
        &format!("Total TVA: {:.3} D", data.doc.total_tax as f64 / 1000.0),
        11.0,
        Mm(130.0),
        Mm(y),
        &font,
    );
    y -= 6.0;
    layer.use_text(
        &format!("Total TTC: {:.3} D", data.doc.total_ttc as f64 / 1000.0),
        12.0,
        Mm(130.0),
        Mm(y),
        &bold,
    );

    doc.save_to_bytes().map_err(|e| e.to_string())
}

fn truncate(s: &str, max: usize) -> String {
    if s.len() <= max {
        s.to_string()
    } else {
        format!("{}…", &s[..max])
    }
}

fn draw_line(layer: &PdfLayerReference, x1: f32, y1: f32, x2: f32, y2: f32) {
    let points = vec![
        (Point::new(Mm(x1), Mm(y1)), false),
        (Point::new(Mm(x2), Mm(y2)), false),
    ];
    let line = Line {
        points,
        is_closed: false,
    };
    layer.set_outline_color(Color::Rgb(Rgb::new(0.6_f32, 0.6_f32, 0.6_f32, None)));
    layer.add_line(line);
}
