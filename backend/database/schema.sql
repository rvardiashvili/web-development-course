  USE kai;

  -- Base Users Table
  CREATE TABLE `Users` (
    `user_id` INT PRIMARY KEY AUTO_INCREMENT,
    `profile_picture` VARCHAR(225),           
    `username` VARCHAR(255) UNIQUE NOT NULL,    
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `bio` TEXT,             
    `user_type` ENUM ('employee', 'employer', 'admin') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `user_flags` JSON DEFAULT '{}',             
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
    `skills` TEXT,                
    `interests` TEXT,             
    `languages` TEXT,             
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

CREATE TABLE `liked_by` (
  `post_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `liked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `emote_type` ENUM('heart', 'thumbs up', 'fire', 'laugh') DEFAULT 'heart',
  PRIMARY KEY (`post_id`, `user_id`), -- Correct way to define a composite primary key
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `Posts` (`post_id`) ON DELETE CASCADE
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

-- 2. Create a table for Work Experiences
CREATE TABLE `WorkExperiences` (
  `experience_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `job_title` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255), -- Assuming location per job is relevant
  `start_date` DATE NOT NULL,
  `end_date` DATE, -- NULL if current job
  `description` TEXT,
  FOREIGN KEY (`user_id`) REFERENCES `Employees` (`user_id`) ON DELETE CASCADE
);

-- 3. Create a table for Projects
CREATE TABLE `Projects` (
  `project_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `technologies` TEXT, -- Comma-separated or JSON, depending on expected complexity
  `link` VARCHAR(255), -- URL to the project
  FOREIGN KEY (`user_id`) REFERENCES `Employees` (`user_id`) ON DELETE CASCADE
);

-- 4. Create a table for Education
CREATE TABLE `Education` (
  `education_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `degree` VARCHAR(255) NOT NULL,
  `institution` VARCHAR(255) NOT NULL,
  `field_of_study` VARCHAR(255), -- Optional field
  `year_of_completion` VARCHAR(20), -- Using VARCHAR to allow for 'Expected 2025' or ranges
  `notes` TEXT,
  FOREIGN KEY (`user_id`) REFERENCES `Employees` (`user_id`) ON DELETE CASCADE
);

CREATE TABLE `Resume` (
  `resume_id` INT PRIMARY KEY AUTO_INCREMENT, -- Use AUTO_INCREMENT for easy ID generation
  `user_id` INT,
  `resume_path` VARCHAR(255) NOT NULL,
  `title` VARCHAR(100), -- Add a title for the resume
  `is_main` BOOLEAN DEFAULT FALSE, -- Flag for the main resume (Req 1)
  `is_public` BOOLEAN DEFAULT FALSE, -- Optional: Flag if a resume is publicly visible
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
);

-- Table for Sharing Resumes (Req 4)
CREATE TABLE `SharedResumes` (
  `shared_with_user_id` INT,
  `resume_id` INT,
  `shared_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`shared_with_user_id`, `resume_id`), -- A user can only be shared a specific resume once
  FOREIGN KEY (`shared_with_user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`resume_id`) REFERENCES `RESUME` (`resume_id`) ON DELETE CASCADE
);