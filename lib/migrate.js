const { query } = require("./db");

const CREATE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS \`admins\` (
    \`id\`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    \`username\`      VARCHAR(50)      NOT NULL,
    \`password_hash\` VARCHAR(255)     NOT NULL,
    \`full_name\`     VARCHAR(100)     NULL,
    \`email\`         VARCHAR(150)     NULL,
    \`is_active\`     TINYINT(1)       NOT NULL DEFAULT 1,
    \`last_login_at\` DATETIME         NULL,
    \`created_at\`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_admins_username\` (\`username\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`listings\` (
    \`id\`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    \`title\`         VARCHAR(255)     NULL,
    \`price\`         DECIMAL(14,2)    NOT NULL,
    \`price_period\`  ENUM('none','month','day') NOT NULL DEFAULT 'none',
    \`listing_type\`  ENUM('sale','rent','daily') NOT NULL DEFAULT 'sale',
    \`status\`        ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
    \`is_premium\`    TINYINT(1)       NOT NULL DEFAULT 0,
    \`category\`      ENUM('apartment','house','office','garage','land','commercial','other') NOT NULL DEFAULT 'apartment',
    \`location\`      VARCHAR(255)     NOT NULL,
    \`city\`          VARCHAR(100)     NOT NULL DEFAULT 'Bakı',
    \`district\`      VARCHAR(100)     NULL,
    \`rooms\`         TINYINT UNSIGNED NULL,
    \`area\`          DECIMAL(10,2)    NULL,
    \`area_unit\`     ENUM('m2','sot') NOT NULL DEFAULT 'm2',
    \`floor\`         VARCHAR(20)      NULL,
    \`image_url\`     VARCHAR(500)     NULL,
    \`description\`   TEXT             NULL,
    \`phone\`         VARCHAR(30)      NULL,
    \`tags\`          JSON             NULL,
    \`published_at\`  DATETIME         NULL,
    \`created_by\`    INT UNSIGNED     NULL,
    \`created_at\`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_listings_status\` (\`status\`),
    KEY \`idx_listings_type\` (\`listing_type\`),
    KEY \`idx_listings_premium\` (\`is_premium\`),
    KEY \`idx_listings_city\` (\`city\`),
    KEY \`idx_listings_published\` (\`published_at\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`listing_images\` (
    \`id\`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    \`listing_id\`  INT UNSIGNED     NOT NULL,
    \`image_url\`   VARCHAR(500)     NOT NULL,
    \`sort_order\`  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    \`is_cover\`    TINYINT(1)       NOT NULL DEFAULT 0,
    \`created_at\`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_listing_images_listing\` (\`listing_id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`complexes\` (
    \`id\`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    \`name\`          VARCHAR(255)     NOT NULL,
    \`price_from\`    DECIMAL(14,2)    NULL,
    \`location\`      VARCHAR(255)     NOT NULL,
    \`developer\`     VARCHAR(150)     NULL,
    \`deadline\`      VARCHAR(150)     NULL,
    \`image_url\`     VARCHAR(500)     NULL,
    \`description\`   TEXT             NULL,
    \`is_active\`     TINYINT(1)       NOT NULL DEFAULT 1,
    \`sort_order\`    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    \`created_at\`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_complexes_active\` (\`is_active\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`settings\` (
    \`id\`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    \`setting_key\` VARCHAR(100)     NOT NULL,
    \`setting_value\` TEXT           NULL,
    \`updated_at\`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_settings_key\` (\`setting_key\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`contacts\` (
    \`id\`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    \`full_name\`   VARCHAR(150)     NULL,
    \`phone\`       VARCHAR(30)      NOT NULL,
    \`email\`       VARCHAR(150)     NULL,
    \`message\`     TEXT             NULL,
    \`listing_id\`  INT UNSIGNED     NULL,
    \`is_read\`     TINYINT(1)       NOT NULL DEFAULT 0,
    \`created_at\`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_contacts_read\` (\`is_read\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

async function ensureAdmin() {
  const rows = await query("SELECT COUNT(*) AS c FROM \`admins\`");
  if (Number(rows[0].c) > 0) return;
  // Default: admin / admin123 — yalnız ilk quraşdırmada
  await query(
    `INSERT INTO \`admins\` (\`username\`, \`password_hash\`, \`full_name\`, \`email\`)
     VALUES ('admin', '$2b$10$BOcMfqMi7jo5LS0unCdayOdtwoTc90e9RwaBg8OoIVcsfeVhW4SZS', 'Elite Emlak Admin', 'info@elite-emlak.az')`
  );
}

async function ensureDefaultSettings() {
  // Mövcud ayarları heç vaxt overwrite etmə
  await query(
    `INSERT IGNORE INTO \`settings\` (\`setting_key\`, \`setting_value\`) VALUES
      ('site_name', 'ELITE-EMLAK.AZ'),
      ('contact_phone', '(012) 526-94-94'),
      ('contact_email', 'info@elite-emlak.az'),
      ('default_city', 'Bakı')`
  );
}

async function seedDemoData() {
  const complexes = await query("SELECT COUNT(*) AS c FROM \`complexes\`");
  if (Number(complexes[0].c) === 0) {
    await query(
      `INSERT INTO \`complexes\` (\`name\`, \`price_from\`, \`location\`, \`developer\`, \`deadline\`, \`image_url\`, \`sort_order\`) VALUES
        ('Sea Breeze Monaco Residence', 239300.00, 'Sabunçu r., Nardaran qəs., Sea Breeze', NULL, '2029 dekabr', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop', 1),
        ('Mayak Residence', 104500.00, 'Suraxanı r.', NULL, '2025-2026', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop', 2),
        ('Sea Breeze Reportage Heights', 161300.00, 'Sabunçu r., Nardaran qəs., Sea Breeze', NULL, 'May 2030', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop', 3),
        ('Central Towers', 314300.00, 'Yasamal r. Nizami', 'SR Development', 'A bloku — təhvil verilib. B və C blokları — 2028-ci il.', 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=400&fit=crop', 4)`
    );
  }

  const listings = await query("SELECT COUNT(*) AS c FROM \`listings\`");
  if (Number(listings[0].c) === 0) {
    await query(
      `INSERT INTO \`listings\` (
        \`price\`, \`price_period\`, \`listing_type\`, \`status\`, \`is_premium\`,
        \`category\`, \`location\`, \`city\`, \`rooms\`, \`area\`, \`area_unit\`, \`floor\`,
        \`image_url\`, \`tags\`, \`published_at\`, \`created_by\`
      ) VALUES
        (153900.00, 'none', 'sale', 'published', 1, 'apartment', 'Azadlıq Prospekti m.', 'Bakı', 2, 50.00, 'm2', '5/5',
         'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (2200.00, 'month', 'rent', 'published', 1, 'apartment', 'Səbail r.', 'Bakı', 2, 92.00, 'm2', '3/33',
         'https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (669000.00, 'none', 'sale', 'published', 1, 'apartment', 'Ağ şəhər q.', 'Bakı', 4, 166.00, 'm2', '5/8',
         'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (80.00, 'day', 'daily', 'published', 1, 'house', 'Şamaxı', 'Şamaxı', 4, 80.00, 'm2', NULL,
         'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (258000.00, 'none', 'sale', 'published', 1, 'apartment', 'Badamdar q.', 'Bakı', 3, 102.50, 'm2', '17/18',
         'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (310000.00, 'none', 'sale', 'published', 1, 'apartment', 'Neftçilər m.', 'Bakı', 3, 112.00, 'm2', '2/14',
         'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (1200.00, 'month', 'rent', 'published', 1, 'apartment', 'Nərimanov r.', 'Bakı', 3, 125.00, 'm2', '12/16',
         'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (1500000.00, 'none', 'sale', 'published', 0, 'apartment', 'Nizami m.', 'Bakı', 5, 280.00, 'm2', '10/12',
         'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (2600.00, 'month', 'rent', 'published', 0, 'apartment', 'Nizami m.', 'Bakı', 3, 150.00, 'm2', '8/16',
         'https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (300.00, 'day', 'daily', 'published', 0, 'house', 'Qəbələ', 'Qəbələ', 7, 220.00, 'm2', NULL,
         'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (295000.00, 'none', 'sale', 'published', 0, 'apartment', 'Həzi Aslanov m.', 'Bakı', 3, 125.00, 'm2', '5/17',
         'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=300&fit=crop', NULL, NOW(), 1),
        (375000.00, 'none', 'sale', 'published', 0, 'house', 'Badamdar q.', 'Bakı', 7, 450.00, 'm2', NULL,
         'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop', NULL, NOW(), 1)`
    );
  }
}

async function seedIfEmpty() {
  await ensureAdmin();
  await ensureDefaultSettings();

  // Nümunə elan/kompleks yalnız SEED_DEMO=1 olanda — deploy boş cədvəli yenidən doldurmasın
  const wantDemo = String(process.env.SEED_DEMO || "").trim() === "1";
  if (wantDemo) {
    await seedDemoData();
  }
}

async function migrate() {
  for (const sql of CREATE_STATEMENTS) {
    try {
      await query(sql);
    } catch (err) {
      // Bəzi Hostinger MySQL-lərdə JSON tipi olmaya bilər
      if (sql.includes("`tags`") && /JSON/i.test(err.message)) {
        const fallback = sql.replace("`tags`          JSON             NULL", "`tags`          TEXT             NULL");
        await query(fallback);
        continue;
      }
      throw err;
    }
  }
  await seedIfEmpty();
  return { ok: true };
}

module.exports = { migrate };
