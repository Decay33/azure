<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Sanitize and validate inputs
  $name    = strip_tags(trim($_POST["name"]));
  $email   = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
  $message = trim($_POST["message"]);

  if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Error - The AI Democracy</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <div id="main-container">
        <header>
          <h1>Error</h1>
        </header>
        <div class="contact-container">
          <p>Please complete the form correctly.</p>
          <p><a href="contact.php" class="contact-button">Go back</a></p>
        </div>
      </div>
    </body>
    </html>
    <?php
    exit;
  }

  // Recipient email address and subject
  $recipient = "theaidemocracy@gmail.com";
  $subject = "New Contact Form Submission from $name";

  // Build the email content
  $email_content  = "Name: $name\n";
  $email_content .= "Email: $email\n\n";
  $email_content .= "Message:\n$message\n";

  // Set the "From" header to use your domain email and add a Reply-To header
  $email_headers  = "From: The AI Democracy <no_reply@theaidemocracy.com>\r\n";
  $email_headers .= "Reply-To: $email\r\n";
  $email_headers .= "X-Mailer: PHP/" . phpversion();

  // Attempt to send the email
  if (mail($recipient, $subject, $email_content, $email_headers)) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Thank You - The AI Democracy</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <div id="main-container">
        <header>
          <h1>Thank You!</h1>
        </header>
        <div class="contact-container">
          <p>Your message has been sent successfully.</p>
          <p><a href="index.php" class="contact-button">Return to Main Page</a></p>
        </div>
      </div>
    </body>
    </html>
    <?php
  } else {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Error - The AI Democracy</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <div id="main-container">
        <header>
          <h1>Error</h1>
        </header>
        <div class="contact-container">
          <p>Oops! Something went wrong and we couldn't send your message.</p>
          <p>
            <a href="contact.php" class="contact-button">Try Again</a> or 
            <a href="index.php" class="contact-button">Return to Main Page</a>
          </p>
        </div>
      </div>
    </body>
    </html>
    <?php
  }
}
?>
