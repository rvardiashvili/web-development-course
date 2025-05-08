USE kai;

-- Base Users Table
CREATE TABLE `Users` (
  `user_id` INT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `user_type` ENUM ('employee', 'employer', 'admin') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_authenticated` BOOLEAN DEFAULT TRUE,
  `is_anonymous` BOOLEAN DEFAULT FALSE
);

-- Countries for citizenship
CREATE TABLE `Countries` (
  `country_id` INT PRIMARY KEY AUTO_INCREMENT,
  `country_name` VARCHAR(100) NOT NULL UNIQUE
);

-- Cities for location data
CREATE TABLE `Cities` (
  `city_id` INT PRIMARY KEY AUTO_INCREMENT,
  `city` VARCHAR(100),
  `state` VARCHAR(100),
  `country_id` INT,
  FOREIGN KEY (`country_id`) REFERENCES `Countries` (`country_id`) ON DELETE CASCADE
);


-- Employees Table with extended info
CREATE TABLE `Employees` (
  `user_id` INT PRIMARY KEY,
  `date_of_birth` DATE,
  `mobile_number` VARCHAR(20),
  `profession` VARCHAR(255),
  `citizenship_id` INT,
  `current_location_id` INT,
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`citizenship_id`) REFERENCES `Countries` (`country_id`),
  FOREIGN KEY (`current_location_id`) REFERENCES `Cities` (`city_id`)
);

-- Job Preferences
CREATE TABLE `JobPreferences` (
  `preference_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `location_id` INT,
  `job_level` VARCHAR(100),
  `position` VARCHAR(255),
  `job_type` ENUM ('full-time', 'part-time', 'contract', 'internship'),
  `work_type` ENUM ('hybrid', 'remote', 'on-site'),
  FOREIGN KEY (`user_id`) REFERENCES `Employees` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`location_id`) REFERENCES `Cities` (`city_id`)

);

-- Employers
CREATE TABLE `Employers` (
  `user_id` INT PRIMARY KEY,
  `business_name` VARCHAR(255) NOT NULL,
  `business_type` VARCHAR(255),
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
);

-- Employer Locations
CREATE TABLE `EmployerLocations` (
  `city_id` INT,
  `employer_id` INT,
  `address` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`city_id`, `employer_id`),
  FOREIGN KEY (`city_id`) REFERENCES `Cities` (`city_id`),
  FOREIGN KEY (`employer_id`) REFERENCES `Employers` (`user_id`) ON DELETE CASCADE
);

-- Employer multi-accounts
CREATE TABLE `EmployerAccounts` (
  `employer_id` INT,
  `user_id` INT,
  `role` ENUM ('admin', 'editor', 'viewer'),
  PRIMARY KEY (`employer_id`, `user_id`),
  FOREIGN KEY (`employer_id`) REFERENCES `Employers` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
);

-- Job Postings
CREATE TABLE `JobPostings` (
  `job_id` INT PRIMARY KEY AUTO_INCREMENT,
  `employer_id` INT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `location_id` INT,
  `job_level` VARCHAR(100),
  `position` VARCHAR(255),
  `job_type` ENUM ('full-time', 'part-time', 'contract', 'internship') NOT NULL,
  `work_type` ENUM ('hybrid', 'remote', 'on-site'),
  `posted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employer_id`) REFERENCES `Employers` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`location_id`) REFERENCES `Cities` (`city_id`)
);

-- Posts (in groups)
CREATE TABLE `Posts` (
  `post_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `group_id` INT,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `visibility` ENUM('public', 'followers', 'group') DEFAULT 'public',
  `media_url` VARCHAR(255), 
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
);

-- Messages
CREATE TABLE `Messages` (
  `message_id` INT PRIMARY KEY AUTO_INCREMENT,
  `sender_id` INT,
  `receiver_id` INT,
  `content` TEXT NOT NULL,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('sent', 'delivered', 'seen') DEFAULT 'sent',
  FOREIGN KEY (`sender_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
);

-- Social Groups
CREATE TABLE `Groups` (
  `group_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memberships in groups
CREATE TABLE `GroupMemberships` (
  `group_id` INT,
  `user_id` INT,
  `role` ENUM ('member', 'moderator', 'admin') DEFAULT 'member',
  PRIMARY KEY (`group_id`, `user_id`),
  FOREIGN KEY (`group_id`) REFERENCES `Groups` (`group_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
);

-- Follower-Followed Connections
CREATE TABLE `Followers` (
  `follower_id` INT,
  `followed_id` INT,
  PRIMARY KEY (`follower_id`, `followed_id`),
  FOREIGN KEY (`follower_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`followed_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
);
