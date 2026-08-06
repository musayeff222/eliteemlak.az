-- ============================================================
-- ELITE-EMLAK.AZ — MySQL Database Schema
-- Charset: utf8mb4 | Engine: InnoDB
--
-- Hostinger / phpMyAdmin:
--   1) Əvvəl öz bazanızı seçin (məs: u884620139_elite_emlak)
--   2) Bu faylı Import edin
--   CREATE DATABASE / USE sətirləri lazım DEYİL — seçilmiş DB-də işləyir.
-- ============================================================

-- ------------------------------------------------------------
-- 1) admins — admin panel istifadəçiləri
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(50)      NOT NULL,
  `password_hash` VARCHAR(255)     NOT NULL COMMENT 'bcrypt hash',
  `full_name`     VARCHAR(100)     NULL,
  `email`         VARCHAR(150)     NULL,
  `is_active`     TINYINT(1)       NOT NULL DEFAULT 1,
  `last_login_at` DATETIME         NULL,
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admins_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2) listings — satış / kirayə / günlük obyektlər
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `listings` (
  `id`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `title`         VARCHAR(255)     NULL COMMENT 'İxtiyari başlıq',
  `price`         DECIMAL(14,2)    NOT NULL COMMENT 'Qiymət (AZN)',
  `price_period`  ENUM('none','month','day') NOT NULL DEFAULT 'none'
                  COMMENT 'none=satış, month=kirayə/ay, day=günlük',
  `listing_type`  ENUM('sale','rent','daily') NOT NULL DEFAULT 'sale',
  `status`        ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  `is_premium`    TINYINT(1)       NOT NULL DEFAULT 0,
  `category`      ENUM(
                    'apartment','house','office','garage','land','commercial','other'
                  ) NOT NULL DEFAULT 'apartment',
  `location`      VARCHAR(255)     NOT NULL COMMENT 'Rayon / metro / nişangah',
  `city`          VARCHAR(100)     NOT NULL DEFAULT 'Bakı',
  `district`      VARCHAR(100)     NULL,
  `rooms`         TINYINT UNSIGNED NULL COMMENT 'Otaq sayı',
  `area`          DECIMAL(10,2)    NULL COMMENT 'Sahə m² və ya sot',
  `area_unit`     ENUM('m2','sot') NOT NULL DEFAULT 'm2',
  `floor`         VARCHAR(20)      NULL COMMENT 'məs: 5/8',
  `image_url`     VARCHAR(500)     NULL COMMENT 'Əsas şəkil',
  `description`   TEXT             NULL,
  `phone`         VARCHAR(30)      NULL COMMENT 'Əlaqə telefonu',
  `tags`          JSON             NULL COMMENT '["Daxili kredit","Kompleks"]',
  `published_at`  DATETIME         NULL,
  `created_by`    INT UNSIGNED     NULL,
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_listings_status` (`status`),
  KEY `idx_listings_type` (`listing_type`),
  KEY `idx_listings_premium` (`is_premium`),
  KEY `idx_listings_city` (`city`),
  KEY `idx_listings_published` (`published_at`),
  CONSTRAINT `fk_listings_admin`
    FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3) listing_images — obyekt şəkilləri (galereya)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `listing_images` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `listing_id`  INT UNSIGNED     NOT NULL,
  `image_url`   VARCHAR(500)     NOT NULL,
  `sort_order`  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `is_cover`    TINYINT(1)       NOT NULL DEFAULT 0,
  `created_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_listing_images_listing` (`listing_id`),
  CONSTRAINT `fk_listing_images_listing`
    FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4) complexes — yaşayış kompleksləri
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `complexes` (
  `id`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(255)     NOT NULL,
  `price_from`    DECIMAL(14,2)    NULL COMMENT 'Başlanğıc qiymət AZN',
  `location`      VARCHAR(255)     NOT NULL,
  `developer`     VARCHAR(150)     NULL,
  `deadline`      VARCHAR(150)     NULL COMMENT 'Təhvil tarixi / status',
  `image_url`     VARCHAR(500)     NULL,
  `description`   TEXT             NULL,
  `is_active`     TINYINT(1)       NOT NULL DEFAULT 1,
  `sort_order`    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_complexes_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5) settings — sayt tənzimləmələri (key-value)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100)     NOT NULL,
  `setting_value` TEXT           NULL,
  `updated_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6) contacts — müştəri əlaqə / müraciət formaları (ixtiyari)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contacts` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `full_name`   VARCHAR(150)     NULL,
  `phone`       VARCHAR(30)      NOT NULL,
  `email`       VARCHAR(150)     NULL,
  `message`     TEXT             NULL,
  `listing_id`  INT UNSIGNED     NULL COMMENT 'Hansı obyektə görə müraciət',
  `is_read`     TINYINT(1)       NOT NULL DEFAULT 0,
  `created_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contacts_read` (`is_read`),
  CONSTRAINT `fk_contacts_listing`
    FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- İlkin məlumatlar (seed)
-- ============================================================

-- Default admin: username=admin, password=admin123
-- bcryptjs hash of "admin123" (cost 10)
INSERT INTO `admins` (`username`, `password_hash`, `full_name`, `email`)
VALUES (
  'admin',
  '$2b$10$BOcMfqMi7jo5LS0unCdayOdtwoTc90e9RwaBg8OoIVcsfeVhW4SZS',
  'Elite Emlak Admin',
  'info@elite-emlak.az'
)
ON DUPLICATE KEY UPDATE
  `password_hash` = VALUES(`password_hash`),
  `full_name` = VALUES(`full_name`);

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
  ('site_name', 'ELITE-EMLAK.AZ'),
  ('contact_phone', '(012) 526-94-94'),
  ('contact_email', 'info@elite-emlak.az'),
  ('default_city', 'Bakı')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `complexes` (`name`, `price_from`, `location`, `developer`, `deadline`, `image_url`, `sort_order`) VALUES
  ('Sea Breeze Monaco Residence', 239300.00, 'Sabunçu r., Nardaran qəs., Sea Breeze', NULL, '2029 dekabr', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop', 1),
  ('Mayak Residence', 104500.00, 'Suraxanı r.', NULL, '2025-2026', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop', 2),
  ('Sea Breeze Reportage Heights', 161300.00, 'Sabunçu r., Nardaran qəs., Sea Breeze', NULL, 'May 2030', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop', 3),
  ('Central Towers', 314300.00, 'Yasamal r. Nizami', 'SR Development', 'A bloku — təhvil verilib. B və C blokları — 2028-ci il.', 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=400&fit=crop', 4);

INSERT INTO `listings` (
  `price`, `price_period`, `listing_type`, `status`, `is_premium`,
  `category`, `location`, `city`, `rooms`, `area`, `area_unit`, `floor`,
  `image_url`, `tags`, `published_at`, `created_by`
) VALUES
  (153900.00, 'none', 'sale', 'published', 1, 'apartment', 'Azadlıq Prospekti m.', 'Bakı', 2, 50.00, 'm2', '5/5',
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (2200.00, 'month', 'rent', 'published', 1, 'apartment', 'Səbail r.', 'Bakı', 2, 92.00, 'm2', '3/33',
   'https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (669000.00, 'none', 'sale', 'published', 1, 'apartment', 'Ağ şəhər q.', 'Bakı', 4, 166.00, 'm2', '5/8',
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (51000.00, 'none', 'sale', 'published', 1, 'apartment', 'Xətai r.', 'Bakı', 2, 44.00, 'm2', '13/13',
   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (310000.00, 'none', 'sale', 'published', 1, 'apartment', 'Neftçilər m.', 'Bakı', 3, 112.00, 'm2', '2/14',
   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (305000.00, 'none', 'sale', 'published', 1, 'apartment', 'Bakmil m.', 'Bakı', 3, 84.00, 'm2', '6/18',
   'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (1200.00, 'month', 'rent', 'published', 1, 'apartment', 'Nərimanov r.', 'Bakı', 3, 125.00, 'm2', '12/16',
   'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (118000.00, 'none', 'sale', 'published', 1, 'apartment', '8 Noyabr m.', 'Bakı', 2, 35.00, 'm2', '1/5',
   'https://images.unsplash.com/photo-1600047509807-ba8f84d2a705?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (80.00, 'day', 'daily', 'published', 1, 'house', 'Şamaxı', 'Şamaxı', 4, 80.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (258000.00, 'none', 'sale', 'published', 1, 'apartment', 'Badamdar q.', 'Bakı', 3, 102.50, 'm2', '17/18',
   'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (1200000.00, 'none', 'sale', 'published', 1, 'house', 'Nardaran q.', 'Bakı', 5, 230.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (900000.00, 'none', 'sale', 'published', 1, 'house', 'Bilgəh q.', 'Bakı', 6, 320.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1605276374101-de4c0a9a0b99?w=400&h=300&fit=crop', '["Daxili kredit", "Kompleks"]', NOW(), 1),
  (1200000.00, 'none', 'sale', 'published', 1, 'house', 'Bilgəh q.', 'Bakı', 6, 440.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=400&h=300&fit=crop', '["Daxili kredit", "Kompleks"]', NOW(), 1),
  (1400000.00, 'none', 'sale', 'published', 1, 'house', 'Bilgəh q.', 'Bakı', 6, 450.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=300&fit=crop', '["Daxili kredit", "Kompleks"]', NOW(), 1),
  (250000.00, 'none', 'sale', 'published', 1, 'house', 'Zabrat q.', 'Bakı', NULL, 75.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (340000.00, 'none', 'sale', 'published', 1, 'house', 'Mərdəkan q.', 'Bakı', 5, 180.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (225000.00, 'none', 'sale', 'published', 1, 'apartment', 'Əhmədli m.', 'Bakı', 2, 68.00, 'm2', '12/13',
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (96000.00, 'none', 'sale', 'published', 1, 'land', 'Görədil q.', 'Bakı', NULL, 8.00, 'sot', NULL,
   'https://images.unsplash.com/photo-1600047509807-ba8f84d2a705?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (345000.00, 'none', 'sale', 'published', 1, 'house', 'Mərdəkan q.', 'Bakı', 4, 175.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (3900.00, 'month', 'rent', 'published', 1, 'commercial', 'İnşaatçılar m.', 'Bakı', 10, 300.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (1500000.00, 'none', 'sale', 'published', 0, 'apartment', 'Nizami m.', 'Bakı', 5, 280.00, 'm2', '10/12',
   'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (2600.00, 'month', 'rent', 'published', 0, 'apartment', 'Nizami m.', 'Bakı', 3, 150.00, 'm2', '8/16',
   'https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (300.00, 'day', 'daily', 'published', 0, 'house', 'Qəbələ', 'Qəbələ', 7, 220.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (146400.00, 'none', 'sale', 'published', 0, 'apartment', 'Qusar', 'Qusar', 1, 97.60, 'm2', '2/8',
   'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=400&h=300&fit=crop', '["Daxili kredit", "Kompleks"]', NOW(), 1),
  (295000.00, 'none', 'sale', 'published', 0, 'apartment', 'Həzi Aslanov m.', 'Bakı', 3, 125.00, 'm2', '5/17',
   'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (175750.00, 'none', 'sale', 'published', 0, 'apartment', 'Qusar', 'Qusar', 3, 95.00, 'm2', '7/9',
   'https://images.unsplash.com/photo-1605276374101-de4c0a9a0b99?w=400&h=300&fit=crop', '["Daxili kredit", "Kompleks"]', NOW(), 1),
  (13600.00, 'month', 'rent', 'published', 0, 'commercial', 'İnşaatçılar m.', 'Bakı', NULL, 1200.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (7200.00, 'month', 'rent', 'published', 0, 'commercial', 'İnşaatçılar m.', 'Bakı', NULL, 500.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (273350.00, 'none', 'sale', 'published', 0, 'apartment', 'Qusar', 'Qusar', 3, 156.20, 'm2', '2/9',
   'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop', '["Daxili kredit", "Kompleks"]', NOW(), 1),
  (5500.00, 'month', 'rent', 'published', 0, 'commercial', 'Sumqayıt', 'Sumqayıt', NULL, 260.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop', NULL, NOW(), 1),
  (375000.00, 'none', 'sale', 'published', 0, 'house', 'Badamdar q.', 'Bakı', 7, 450.00, 'm2', NULL,
   'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop', NULL, NOW(), 1),
  (670000.00, 'none', 'sale', 'published', 0, 'apartment', 'Şah İsmayıl Xətai m.', 'Bakı', 3, 136.00, 'm2', '3/8',
   'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop', '["Daxili kredit", "Kompleks"]', NOW(), 1);

-- ============================================================
-- Hazır. Import:
--   mysql -u root -p < database/schema.sql
-- və ya phpMyAdmin / MySQL Workbench ilə import edin.
-- ============================================================
