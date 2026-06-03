use crate::domain::SaleReport;
use printpdf::*;

pub fn generate_sale_report(report: &SaleReport, title: &str) -> Result<Vec<u8>, String> {
    let (doc, page, layer) = PdfDocument::new("report", Mm(210.0), Mm(297.0), "Layer 1");
    let font = doc
        .add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| e.to_string())?;
    let bold = doc
        .add_builtin_font(BuiltinFont::HelveticaBold)
        .map_err(|e| e.to_string())?;
    let page = doc.get_page(page);
    let layer = page.get_layer(layer);

    let mut y: f32 = 280.0;
    let fs: f32 = 10.0;

    layer.use_text("FIRST MAG", 16.0, Mm(20.0), Mm(y), &bold);
    y -= 7.0;
    layer.use_text(title, 14.0, Mm(20.0), Mm(y), &bold);
    y -= 6.0;
    layer.use_text(
        &format!("Du: {}  Au: {}", &report.period_start, &report.period_end),
        fs,
        Mm(20.0),
        Mm(y),
        &font,
    );
    y -= 10.0;

    hr(&layer, 20.0, y, 170.0);
    y -= 7.0;

    let label_w = 50.0_f32;
    let val_w = 160.0_f32;

    lbl(&layer, "Transactions:", fs, label_w, y, &font);
    val(
        &layer,
        &report.total_transactions.to_string(),
        fs,
        val_w,
        y,
        &bold,
    );
    y -= 5.5;

    lbl(&layer, "Articles vendus:", fs, label_w, y, &font);
    val(
        &layer,
        &report.total_quantity.to_string(),
        fs,
        val_w,
        y,
        &bold,
    );
    y -= 5.5;

    lbl(&layer, "Total HT:", fs, label_w, y, &font);
    val(&layer, &fmt3(report.total_ht), fs, val_w, y, &bold);
    y -= 5.5;

    lbl(&layer, "Total TVA:", fs, label_w, y, &font);
    val(&layer, &fmt3(report.total_tax), fs, val_w, y, &bold);
    y -= 5.5;

    lbl(&layer, "Total TTC:", fs, label_w, y, &font);
    val(&layer, &fmt3(report.total_ttc), fs, val_w, y, &bold);

    doc.save_to_bytes().map_err(|e| e.to_string())
}

fn fmt3(v: i64) -> String {
    format!("{:.3} D", v as f64 / 1000.0)
}

fn lbl(layer: &PdfLayerReference, text: &str, size: f32, x: f32, y: f32, font: &IndirectFontRef) {
    layer.use_text(text, size, Mm(x), Mm(y), font);
}

fn val(layer: &PdfLayerReference, text: &str, size: f32, x: f32, y: f32, font: &IndirectFontRef) {
    layer.use_text(text, size, Mm(x), Mm(y), font);
}

fn hr(layer: &PdfLayerReference, x: f32, y: f32, w: f32) {
    let points = vec![
        (Point::new(Mm(x), Mm(y)), false),
        (Point::new(Mm(x + w), Mm(y)), false),
    ];
    let line = Line {
        points,
        is_closed: false,
    };
    layer.set_outline_color(Color::Rgb(Rgb::new(0.6_f32, 0.6_f32, 0.6_f32, None)));
    layer.add_line(line);
}
