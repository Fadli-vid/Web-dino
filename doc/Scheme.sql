-- TiDB / MySQL Schema for Wikidino

CREATE TABLE IF NOT EXISTS `dinosaurs` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `scientific_name` VARCHAR(255) NOT NULL,
  `period` VARCHAR(100) NOT NULL,
  `length` DOUBLE DEFAULT NULL,
  `weight` DOUBLE DEFAULT NULL,
  `diet` VARCHAR(100) NOT NULL,
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;