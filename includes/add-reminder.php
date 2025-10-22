<?php
header('Content-Type: application/json');
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$medicine_name = $_POST['medicine_name'] ?? '';
$date = $_POST['date'] ?? '';
$time = $_POST['time'] ?? '';
$note = $_POST['note'] ?? '';

if (empty($medicine_name) || empty($date) || empty($time)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$query = "INSERT INTO reminders (medicine_name, date, time, note, status, created_at) 
          VALUES (?, ?, ?, ?, 'pending', NOW())";

$stmt = $conn->prepare($query);
$stmt->bind_param('ssss', $medicine_name, $date, $time, $note);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Reminder added successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to add reminder']);
}

$stmt->close();
?>
