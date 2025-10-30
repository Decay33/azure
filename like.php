<?php
// like.php

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

// Process like request if game_id is provided
if (isset($_POST['game_id'])) {
    // Use the provided game_id (e.g., "buildaship")
    $game_id = $conn->real_escape_string($_POST['game_id']);
    
    // Insert a new like or update the existing like count using an UPSERT technique.
    $sql = "INSERT INTO game_likes (game_id, like_count)
            VALUES ('$game_id', 1)
            ON DUPLICATE KEY UPDATE like_count = like_count + 1";
    
    if ($conn->query($sql) === TRUE) {
        // Retrieve updated count
        $result = $conn->query("SELECT like_count FROM game_likes WHERE game_id = '$game_id'");
        if ($result) {
            $row = $result->fetch_assoc();
            echo json_encode(['success' => true, 'like_count' => $row['like_count']]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Database error']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Database error']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No game_id provided']);
}

$conn->close();
?>
