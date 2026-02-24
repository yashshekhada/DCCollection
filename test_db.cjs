const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/shoap.db');

db.serialize(() => {
    db.all("SELECT * FROM product_variants ORDER BY id DESC LIMIT 1", (err, row) => {
        console.log("Latest Variant:", row);
        if (row && row.length > 0) {
            db.all("SELECT * FROM product_variant_media WHERE variant_id = ?", [row[0].id], (err, media) => {
                console.log("Media for latest variant:", media);
            });
        }
    });
});
