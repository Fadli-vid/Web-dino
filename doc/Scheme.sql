-- TiDB / MySQL Schema for Wikidino

CREATE TABLE IF NOT EXISTS `dinosaurs` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `scientific_name` VARCHAR(255) NOT NULL,
  `period` VARCHAR(100) NOT NULL,
  `sub_period` VARCHAR(60) DEFAULT NULL,
  `mya_start` DECIMAL(5,1) DEFAULT NULL,
  `mya_end` DECIMAL(5,1) DEFAULT NULL,
  `length` DOUBLE DEFAULT NULL,
  `weight` DOUBLE DEFAULT NULL,
  `diet` VARCHAR(100) NOT NULL,
  `locomotion` VARCHAR(50) DEFAULT NULL,
  `continent` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `image` TEXT DEFAULT NULL,
  `image_alt` TEXT DEFAULT NULL,
  `taxonomy` JSON DEFAULT NULL,
  `characteristics` JSON DEFAULT NULL,
  `fossils` TEXT DEFAULT NULL,
  `discovered` TEXT DEFAULT NULL,
  `location_found` TEXT DEFAULT NULL,
  `size_comparison_url` TEXT DEFAULT NULL,
  `habitat_map_url` TEXT DEFAULT NULL,
  `evolutionary_tree_url` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_dinosaurs_period_diet` (`period`, `diet`),
  INDEX `idx_dinosaurs_mya` (`mya_start` DESC, `mya_end` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_analysis_cache` (
  `cache_key` VARCHAR(128) NOT NULL,
  `feature_type` VARCHAR(50) NOT NULL,
  `species_ids` VARCHAR(255) NOT NULL,
  `prompt_tag` VARCHAR(120) DEFAULT NULL,
  `response_data` JSON NOT NULL,
  `model_used` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cache_key`),
  INDEX `idx_species_feature` (`species_ids`, `feature_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
