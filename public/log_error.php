<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
file_put_contents(__DIR__ . '/frontend_errors.log', file_get_contents('php://input') . PHP_EOL, FILE_APPEND);
