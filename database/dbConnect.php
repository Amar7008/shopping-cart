<?php


$servername = "localhost";
$username = "root";
$password = "";
$database = "shopingcart";


$conn = mysqli_connect($servername, $username, $password, $database);


if (!$conn) {
    die("Sorry we failed to connect: " . mysqli_connect_error());
} else {
    
}
