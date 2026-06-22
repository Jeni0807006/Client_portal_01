-- database/schema.sql

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,        
    email VARCHAR(100) NOT NULL UNIQUE,          
    password_hash VARCHAR(255) NOT NULL,         
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP [cite: 197]
);

-- 2. Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,          
    title VARCHAR(100) NOT NULL,                
    category VARCHAR(50) NOT NULL,              
    description TEXT NOT NULL,                  
    metric VARCHAR(20) NOT NULL                 
);

-- 3. Create Saved Reports Table (Junction Table)
CREATE TABLE IF NOT EXISTS saved_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,          
    user_id INT NOT NULL,                       
    report_id INT NOT NULL,                     
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- [cite: 212]

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);