<?php
header('Content-Type: application/json');
require_once 'config.php';

$id = $_GET['id'] ?? 0;

if (empty($id)) {
    echo json_encode(['success' => false, 'message' => 'Invalid reminder ID']);
    exit;
}

$query = "DELETE FROM reminders WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param('i', $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Reminder deleted']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete reminder']);
}

$stmt->close();
?>
