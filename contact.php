<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-SN0SSL3XWP"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-SN0SSL3XWP');
  </script>
  <meta charset="UTF-8">
  <title>Contact Us - The AI Democracy</title>
  
  <!-- Meta tags for responsiveness -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO Meta Tags -->
  <meta name="description" content="Contact The AI Democracy team with your questions, feedback, or to submit your AI-generated game for consideration.">
  <meta name="keywords" content="contact, AI games, submit game, feedback, AI Democracy">
  
  <!-- Gaming-inspired Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <!-- Link to your CSS file -->
  <link rel="stylesheet" href="style.css">
  
  <!-- Add Font Awesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <!-- Scanline effect for futuristic UI -->
  <div class="scanline"></div>
  
  <!-- Circuit line animations -->
  <div class="circuit-lines">
    <div class="circuit-line horizontal-line" style="top: 15%; left: 5%; width: 150px;"></div>
    <div class="circuit-line vertical-line" style="top: 30%; left: 10%; height: 120px;"></div>
    <div class="circuit-dot" style="top: 30%; left: 10%;"></div>
    
    <div class="circuit-line horizontal-line" style="top: 75%; right: 5%; width: 200px;"></div>
    <div class="circuit-line vertical-line" style="top: 60%; right: 20%; height: 150px;"></div>
    <div class="circuit-dot" style="top: 60%; right: 20%;"></div>
    
    <div class="circuit-line horizontal-line" style="top: 40%; right: 30%; width: 100px;"></div>
    <div class="circuit-dot" style="top: 40%; right: 30%;"></div>
  </div>
  
  <!-- Navigation Bar -->
  <nav class="nav-bar">
    <a href="index.php" class="nav-logo"><span class="nav-logo-the">THE</span>AI<span>Democracy</span></a>
    <div class="nav-links">
      <a href="index.php" class="nav-link">Games</a>
      <a href="tools.php" class="nav-link">Tools</a>
      <a href="contact.php" class="nav-link">Contact</a>
      <a href="privacy.php" class="nav-link">Privacy</a>
    </div>
  </nav>

  <!-- Main Content -->
  <div id="main-container">
    <div class="contact-container">
      <h2>Connect With Us</h2>
      <p class="ai-statement">
        Have questions, feedback, or want to submit your AI-generated game? We'd love to hear from you.
      </p>
      
      <form action="process_contact.php" method="post">
        <div class="form-group">
          <label for="name">Your Name</label>
          <input type="text" id="name" name="name" required>
        </div>
        
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" required>
        </div>
        
        <div class="form-group">
          <label for="subject">Subject</label>
          <input type="text" id="subject" name="subject" required>
        </div>
        
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" required></textarea>
        </div>
        
        <button type="submit">Send Message</button>
      </form>
      
      <div style="margin-top: 40px; text-align: center;">
        <a href="index.php" class="contact-button">Return to Games</a>
      </div>
    </div>
  </div>

  <!-- Footer Section -->
  <footer>
    <p>
      Powered by Advanced AI Technology - Your game progress and purchase states are securely stored using local browser storage.
    </p>
    <div class="footer-links">
      <a href="privacy.php" class="footer-link">Privacy Policy</a>
      <a href="privacy.html" class="footer-link">Privacy Statement</a>
      <a href="contact.php" class="footer-link">Contact Us</a>
    </div>
  </footer>
</body>
</html>
