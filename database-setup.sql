-- Create Database
CREATE DATABASE IF NOT EXISTS medicine_dispenser;
USE medicine_dispenser;

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    note VARCHAR(255),
    status ENUM('pending', 'taken', 'missed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date_time (date, time),
    INDEX idx_status (status)
);

-- Sensor Logs Table
CREATE TABLE IF NOT EXISTS sensor_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperature DECIMAL(5, 2),
    stock_level ENUM('high', 'medium', 'low'),
    slots_detected INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp)
);

-- Medicine Inventory Table
CREATE TABLE IF NOT EXISTS medicine_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(100) NOT NULL UNIQUE,
    total_slots INT DEFAULT 10,
    current_slots INT DEFAULT 0,
    last_refilled TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dispenser Events Table
CREATE TABLE IF NOT EXISTS dispenser_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reminder_id INT,
    event_type ENUM('triggered', 'detected', 'missed') NOT NULL,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSON,
    FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE CASCADE,
    INDEX idx_event_time (event_time)
);
