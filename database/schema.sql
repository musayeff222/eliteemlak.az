-- ============================================================
-- ELITE-EMLAK.AZ — MySQL Database Schema
-- Charset: utf8mb4 | Engine: InnoDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS `elite_emlak`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `elite_emlak`;

-- ------------------------------------------------------------
-- 1) admins — admin panel istifadəçiləri
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id`            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(50)      NOT NULL,
  `password_hash` VARCHAR(255)     NOT NULL COMMENT 'bcrypt/argon2 hash',
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
  `area`          DECIMAL(10,2)    NULL COMMENT 'Sahə m²',
  `area_unit`     ENUM('m2','sot') NOT NULL DEFAULT 'm2',
  `floor`         VARCHAR(20)      NULL COMMENT 'məs: 5/8',
  `image_url`     VARCHAR(500)     NULL COMMENT 'Əsas şəkil',
  `description`   TEXT             NULL,
  `phone`         VARCHAR(30)      NULL COMMENT 'Əlaqə telefonu',
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
-- Hash: bcrypt of "admin123" (cost 10)
INSERT INTO `admins` (`username`, `password_hash`, `full_name`, `email`)
VALUES (
  'admin',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Elite Emlak Admin',
  'info@elite-emlak.az'
)
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
  ('site_name', 'ELITE-EMLAK.AZ'),
  ('contact_phone', '(012) 526-94-94'),
  ('contact_email', 'info@elite-emlak.az'),
  ('default_city', 'Bakı')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- Nümunə komplekslər
INSERT INTO `complexes` (`name`, `price_from`, `location`, `developer`, `deadline`, `image_url`, `sort_order`) VALUES
  ('Sea Breeze Monaco Residence', 239300.00, 'Sabunçu r., Nardaran qəs., Sea Breeze', NULL, '2029 dekabr', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop', 1),
  ('Mayak Residence', 104500.00, 'Suraxanı r.', NULL, '2025-2026', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop', 2),
  ('Sea Breeze Reportage Heights', 161300.00, 'Sabunçu r., Nardaran qəs., Sea Breeze', NULL, 'May 2030', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop', 3),
  ('Central Towers', 314300.00, 'Yasamal r. Nizami', 'SR Development', 'A bloku — təhvil verilib. B və C blokları — 2028-ci il.', 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=400&fit=crop', 4);

-- Nümunə obyektlər (published)
INSERT INTO `listings` (
  `price`, `price_period`, `listing_type`, `status`, `is_premium`,
  `category`, `location`, `city`, `rooms`, `area`, `floor`,
  `image_url`, `published_at`, `created_by`
) VALUES
  (153900.00, 'none', 'sale', 'published', 0, 'apartment', 'Azadlıq Prospekti m.', 'Bakı', 2, 50.00, '5/5',
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', NOW(), 1),
  (2200.00, 'month', 'rent', 'published', 0, 'apartment', 'Səbail r.', 'Bakı', 2, 92.00, '3/33',
   'https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=400&h=300&fit=crop', NOW(), 1),
  (669000.00, 'none', 'sale', 'published', 1, 'apartment', 'Ağ şəhər q.', 'Bakı', 4, 166.00, '5/8',
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop', NOW(), 1),
  (80.00, 'day', 'daily', 'published', 1, 'house', 'Şamaxı', 'Şamaxı', 4, 80.00, NULL,
   'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop', NOW(), 1),
  (258000.00, 'none', 'sale', 'published', 1, 'apartment', 'Badamdar q.', 'Bakı', 3, 102.50, '17/18',
   'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop', NOW(), 1);

-- ============================================================
-- Hazır. Import:
--   mysql -u root -p < database/schema.sql
-- və ya phpMyAdmin / MySQL Workbench ilə import edin.
-- ============================================================
