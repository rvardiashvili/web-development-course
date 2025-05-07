USE kai;~

CREATE TABLE `Users` (
  `user_id` INT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `user_type` ENUM ('employee', 'employer', 'admin') NOT NULL,
  `created_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `Employees` (
  `user_id` INT PRIMARY KEY,
  `date_of_birth` DATE
);

CREATE TABLE `JobPreferences` (
  `preference_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `location` VARCHAR(255),
  `job_level` VARCHAR(100),
  `position` VARCHAR(255),
  `job_type` ENUM ('full-time', 'part-time', 'contract', 'internship'),
  `work_type` ENUM ('hybrid', 'remote', 'on-site')
);

CREATE TABLE `Employers` (
  `user_id` INT PRIMARY KEY,
  `business_name` VARCHAR(255) NOT NULL,
  `business_type` VARCHAR(255)
);

CREATE TABLE `EmployerLocations` (
  `city_id` INT AUTO_INCREMENT,
  `employer_id` INT AUTO_INCREMENT,
  `address` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`city_id`, `employer_id`)
);

CREATE TABLE `Cities` (
  `city_id` INT PRIMARY KEY AUTO_INCREMENT,
  `city` VARCHAR(100),
  `state` VARCHAR(100),
  `country` VARCHAR(100)
);

CREATE TABLE `EmployerAccounts` (
  `employer_id` INT,
  `user_id` INT,
  `role` ENUM ('admin', 'editor', 'viewer'),
  PRIMARY KEY (`employer_id`, `user_id`)
);

CREATE TABLE `JobPostings` (
  `job_id` INT PRIMARY KEY AUTO_INCREMENT,
  `employer_id` INT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `location` VARCHAR(255),
  `job_level` VARCHAR(100),
  `position` VARCHAR(255),
  `job_type` ENUM ('full-time', 'part-time', 'contract', 'internship') NOT NULL,
  `work_type` ENUM ('hybrid', 'remote', 'on-site'),
  `posted_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `Posts` (
  `post_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `group_id` INT,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `Messages` (
  `message_id` INT PRIMARY KEY AUTO_INCREMENT,
  `sender_id` INT,
  `receiver_id` INT,
  `content` TEXT NOT NULL,
  `sent_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `Groups` (
  `group_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `GroupMemberships` (
  `group_id` INT,
  `user_id` INT,
  `role` ENUM ('member', 'moderator', 'admin') DEFAULT 'member',
  PRIMARY KEY (`group_id`, `user_id`)
);

CREATE TABLE `Followers` (
  `follower_id` INT,
  `followed_id` INT,
  PRIMARY KEY (`follower_id`, `followed_id`)
);

ALTER TABLE `Employees` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `JobPreferences` ADD FOREIGN KEY (`user_id`) REFERENCES `Employees` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Employers` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `EmployerLocations` ADD FOREIGN KEY (`employer_id`) REFERENCES `Employers` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `EmployerAccounts` ADD FOREIGN KEY (`employer_id`) REFERENCES `Employers` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `EmployerAccounts` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `JobPostings` ADD FOREIGN KEY (`employer_id`) REFERENCES `Employers` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Posts` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Messages` ADD FOREIGN KEY (`sender_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Messages` ADD FOREIGN KEY (`receiver_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `GroupMemberships` ADD FOREIGN KEY (`group_id`) REFERENCES `Groups` (`group_id`) ON DELETE CASCADE;

ALTER TABLE `GroupMemberships` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Followers` ADD FOREIGN KEY (`follower_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Followers` ADD FOREIGN KEY (`followed_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `EmployerLocations` ADD FOREIGN KEY (`city_id`) REFERENCES `Cities` (`city_id`);