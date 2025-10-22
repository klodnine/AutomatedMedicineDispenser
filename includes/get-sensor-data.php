<?php
header('Content-Type: application/json');
require_once 'config.php';

// Simulated sensor data (replace with actual ESP32 serial communication)
function getSensorDataFromESP32() {
    // In production, use serial communication to read from ESP32
    // For now, returning simulated data
    
    $temperature = 22.5 + (rand(-10, 10) / 10); // Simulated temperature
    $slots_detected = rand(3, 10); // Simulated slot detection
    
    // Determine stock level
    if ($slots_detected >= 8) {
        $stock_level = 'high';
    } elseif ($slots_detected >= 5) {
        $stock_level = 'medium';
    } else {
        $stock_level = 'low';
    }
    
    return [
        'temperature' => $temperature,
        'stock_level' => $stock_level,
        'slots_detected' => $slots_detected
    ];
}

// Get sensor data
$sensorData = getSensorDataFromESP32();

// Log sensor data to database
$query = "INSERT INTO sensor_logs (temperature, stock_level, slots_detected, timestamp) 
          VALUES (?, ?, ?, NOW())";
$stmt = $conn->prepare($query);
$stmt->bind_param('dsi', $sensorData['temperature'], $sensorData['stock_level'], $sensorData['slots_detected']);
$stmt->execute();

echo json_encode([
    'success' => true,
    'temperature' => $sensorData['temperature'],
    'stock_level' => $sensorData['stock_level'],
    'slots_detected' => $sensorData['slots_detected']
]);
?>
