use crate::domain::{Document, DocumentLine};
use printpdf::*;

const PAGE_W: f32 = 80.0;
const PAGE_H: f32 = 297.0;
const MARGIN: f32 = 3.0;
const COL_W: f32 = PAGE_W - 2.0 * MARGIN;

pub struct ReceiptData<'a> {
    pub doc: &'a Document,
    pub lines: &'a [DocumentLine],
    pub header: &'a str,
    pub payment_label: &'a str,
}

pub fn generate_receipt(data: &ReceiptData) -> Result<Vec<u8>, String> {
    let (doc, page, layer) = PdfDocument::new("receipt", Mm(PAGE_W), Mm(PAGE_H), "Layer 1");
    let font = doc
        .add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| e.to_string())?;
    let bold = doc
        .add_builtin_font(BuiltinFont::HelveticaBold)
        .map_err(|e| e.to_string())?;
    let page = doc.get_page(page);
    let layer = page.get_layer(layer);

    let mut y: f32 = PAGE_H - 10.0;
    let fs: f32 = 8.0;

    layer.use_text(data.header, 11.0, Mm(MARGIN), Mm(y), &bold);
    y -= 5.0;

    let date_str = data.doc.created_at.format("%d/%m/%Y %H:%M").to_string();
    layer.use_text(&date_str, fs, Mm(MARGIN), Mm(y), &font);
    y -= 3.5;

    let num_str = format!("N°: {}", data.doc.doc_number);
    layer.use_text(&num_str, fs, Mm(MARGIN), Mm(y), &font);
    y -= 3.5;

    let partner = format!("Client: {}", data.doc.partner_name);
    layer.use_text(&partner, fs, Mm(MARGIN), Mm(y), &font);
    y -= 5.0;

    draw_hr(&layer, MARGIN, y, COL_W, 0.5_f32);
    y -= 4.0;

    layer.use_text("Article", fs, Mm(MARGIN), Mm(y), &bold);
    layer.use_text("Qté", fs, Mm(38.0), Mm(y), &bold);
    layer.use_text("PU", fs, Mm(48.0), Mm(y), &bold);
    layer.use_text("Total", fs, Mm(62.0), Mm(y), &bold);
    y -= 3.5;

    draw_hr(&layer, MARGIN, y, COL_W, 0.3_f32);
    y -= 4.0;

    for line in data.lines {
        if y < 15.0 {
            break;
        }
        let name = if line.article_name.len() > 24 {
            format!("{}…", &line.article_name[..23])
        } else {
            line.article_name.clone()
        };
        layer.use_text(&name, fs, Mm(MARGIN), Mm(y), &font);
        y -= 3.0;

        let qty = format!("{}", line.quantity);
        let pu = format!("{:.3}", line.unit_price as f64 / 1000.0);
        let tot = format!("{:.3}", line.total_ttc as f64 / 1000.0);
        layer.use_text(&qty, fs, Mm(38.0), Mm(y), &font);
        layer.use_text(&pu, fs, Mm(48.0), Mm(y), &font);
        layer.use_text(&tot, fs, Mm(62.0), Mm(y), &font);
        y -= 4.5;
    }

    y = y.max(15.0);
    draw_hr(&layer, MARGIN, y, COL_W, 0.5_f32);
    y -= 5.0;

    let ht = format!("Total HT: {:.3} D", data.doc.total_ht as f64 / 1000.0);
    layer.use_text(&ht, fs, Mm(45.0), Mm(y), &font);
    y -= 3.5;

    let tax = format!("TVA: {:.3} D", data.doc.total_tax as f64 / 1000.0);
    layer.use_text(&tax, fs, Mm(45.0), Mm(y), &font);
    y -= 3.5;

    let ttc = format!("Total TTC: {:.3} D", data.doc.total_ttc as f64 / 1000.0);
    layer.use_text(&ttc, 10.0, Mm(45.0), Mm(y), &bold);
    y -= 5.0;

    layer.use_text(data.payment_label, fs, Mm(MARGIN), Mm(y), &font);

    y -= 8.0;
    let thanks = "Merci de votre visite !";
    layer.use_text(thanks, 9.0, Mm(MARGIN), Mm(y), &bold);

    doc.save_to_bytes().map_err(|e| e.to_string())
}

fn draw_hr(layer: &PdfLayerReference, x: f32, y: f32, w: f32, gray: f32) {
    let points = vec![
        (Point::new(Mm(x), Mm(y)), false),
        (Point::new(Mm(x + w), Mm(y)), false),
    ];
    let line = Line {
        points,
        is_closed: false,
    };
    layer.set_outline_color(Color::Rgb(Rgb::new(gray, gray, gray, None)));
    layer.add_line(line);
}
