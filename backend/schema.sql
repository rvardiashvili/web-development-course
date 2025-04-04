
-- Users Table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type ENUM('employee', 'employer', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Users Table
CREATE TABLE Employees (
    user_id INT PRIMARY KEY,
    date_of_birth DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Employee Job Preferences Table
CREATE TABLE JobPreferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    location VARCHAR(255),
    job_level VARCHAR(100),
    position VARCHAR(255),
    job_type ENUM('full-time', 'part-time', 'contract', 'internship'),
    work_type ENUM('hybrid', 'remote', 'on-site'),
    FOREIGN KEY (user_id) REFERENCES Employees(user_id) ON DELETE CASCADE
);

-- Employer Users Table
CREATE TABLE Employers (
    user_id INT PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Employer Locations Table
CREATE TABLE EmployerLocations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    FOREIGN KEY (employer_id) REFERENCES Employers(user_id) ON DELETE CASCADE
);

-- Employer Accounts (Multiple Users Managing an Employer)
CREATE TABLE EmployerAccounts (
    employer_id INT,
    user_id INT,
    role ENUM('admin', 'editor', 'viewer'),
    PRIMARY KEY (employer_id, user_id),
    FOREIGN KEY (employer_id) REFERENCES Employers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Job Postings Table
CREATE TABLE JobPostings (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    job_level VARCHAR(100),
    position VARCHAR(255),
    job_type ENUM('full-time', 'part-time', 'contract', 'internship') NOT NULL,
    work_type ENUM('hybrid', 'remote', 'on-site'),
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES Employers(user_id) ON DELETE CASCADE
);

-- Posts Table
CREATE TABLE Posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    group_id INT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE Messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Groups Table
CREATE TABLE Groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Memberships Table
CREATE TABLE GroupMemberships (
    group_id INT,
    user_id INT,
    role ENUM('member', 'moderator', 'admin') DEFAULT 'member',
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES Groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Followers Table
CREATE TABLE Followers (
    follower_id INT,
    followed_id INT,
    PRIMARY KEY (follower_id, followed_id),
    FOREIGN KEY (follower_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
