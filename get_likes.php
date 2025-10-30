<?php
// get_likes.php

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
require_once 'db_config.php';

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Connection failed']));
}

if (isset($_GET['game_id'])) {
    // Use the game_id provided from the front end (e.g., "buildaship")
    $game_id = $conn->real_escape_string($_GET['game_id']);
    $result = $conn->query("SELECT like_count FROM game_likes WHERE game_id = '$game_id'");
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(['success' => true, 'like_count' => $row['like_count']]);
    } else {
        // If not found, return a like count of 0
        echo json_encode(['success' => true, 'like_count' => 0]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No game_id provided']);
}

$conn->close();
?>
