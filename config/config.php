<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'medicine_dispenser');

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

$conn->set_charset("utf8");

// ESP32 Serial Configuration
define('ESP32_PORT', '/dev/ttyUSB0'); // Change based on your system
define('BAUD_RATE', 115200);
?>
