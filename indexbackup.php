<!DOCTYPE html> 
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The AI Democracy</title>
  <!-- Meta tags for responsiveness -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Google Font for a modern look -->
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
  <!-- Link to your CSS file -->
  <link rel="stylesheet" href="style.css">
  <style>
    /* Footer styling for the main page */
    footer {
      background-color: #2b2b2b;
      color: #ccc;
      padding: 20px;
      margin-top: 40px;
      text-align: center;
      font-size: 0.85rem;
    }
    footer a.footer-link {
      color: #ffcc00;
      text-decoration: none;
      margin: 0 10px;
      font-weight: bold;
      transition: color 0.3s ease;
    }
    footer a.footer-link:hover {
      color: #ff4500;
    }
  </style>
</head>
<body>
  <!-- Donation Banner -->
  <div id="donate-banner">
    <p id="donate-message">Enjoy these games? Please support an independent AI developer!</p>
    <div id="donate-button-container">
      <div id="donate-button"></div>
    </div>
  </div>

  <!-- Main Content -->
  <div id="main-container">
    <header>
      <h1>Welcome to <span>The AI Democracy</span></h1>
      <p class="ai-statement">
        All games here are created entirely with AI. Please consider donating by clicking above if you can.
      </p>
      <!-- NEW Contact Call-to-Action -->
      <div class="contact-promo">
        <a href="contact.php" class="contact-button">
          Got Questions or Want to Submit Your Own JavaScript Game? Contact Us!
        </a>
      </div>
    </header>

    <!-- Official Game List Section -->
    <section id="game-list">
      <!-- Game Item: Cave Grok (NEW & HOT) -->
      <div class="game-item new-game hot-game">
        <h2>
          Cave Grok <span class="new-label">NEW</span> <span class="hot-label">HOT</span>
        </h2>
        <p>
          Dive into Cave Grok – a challenging cave exploration game with AI-generated levels and dynamic gameplay.
        </p>
        <a href="cavegrok/index.html" class="play-button">Play Now</a>
      </div>
      
      <!-- Other Official Game Items -->
      <div class="game-item new-game">
        <h2>Celestial Guardian <span class="new-label">NEW</span></h2>
        <p>
          Protect the cosmos in this futuristic, roguelike twist on classic space shooters. Navigate through dynamic asteroid fields and enemy waves as you guard the galaxy.
        </p>
        <a href="celestialguardian/index.html" class="play-button">Play Now</a>
      </div>
      
      <!-- Updated Roguelike Asteroids with New & Hot tags -->
      <div class="game-item new-game hot-game">
        <h2>
          Roguelike Asteroids <span class="new-label">NEW</span> <span class="hot-label">HOT</span>
        </h2>
        <p>
          Experience a modern twist on the classic Asteroids gameplay with roguelike elements! Navigate through ever-changing asteroid fields and overcome new challenges.
        </p>
        <a href="roguelikeasteroids/index.html" class="play-button">Play Now</a>
      </div>
      
      <div class="game-item">
        <h2>Chromatic Runner</h2>
        <p>
          Navigate your ship through space, matching colors with incoming barriers and bullets. Test your reflexes and color-matching skills in this fast-paced game!
        </p>
        <a href="chromaticrunner/index.html" class="play-button">Play Now</a>
      </div>
      
      <div class="game-item">
        <h2>Pixel Panic</h2>
        <p>
          A fast-paced game where you navigate the green pixel through waves of red, yellow, and orange enemies. Survive as long as you can while avoiding collisions and staying within the canvas boundaries.
        </p>
        <a href="pixelpanic/index.html" class="play-button">Play Now</a>
      </div>
      
      <div class="game-item">
        <h2>Jump High</h2>
        <p>
          A challenging platformer where you jump as high as you can while avoiding obstacles and collecting points.
        </p>
        <a href="jumphigh/index.html" class="play-button">Play Now</a>
      </div>
      
      <div class="game-item">
        <h2>Clicker-Clicker</h2>
        <p>
          A fun clicking game where you accumulate clicks and upgrades.
        </p>
        <a href="clickerclicker/index.html" class="play-button">Play Now</a>
      </div>
      
      <div class="game-item">
        <h2>Tower Builder</h2>
        <p>
          Stack blocks as high as you can in this addictive tower-building game.
        </p>
        <a href="towerbuilder/index.html" class="play-button">Play Now</a>
      </div>
    </section>

    <!-- Community Games Section -->
    <section id="community-game-list">
      <h2>Community Games</h2>
      <div class="community-game-item">
        <h2>Cube Dodger</h2>
        <p>
          Dodge cubes and test your reflexes in this exciting community game.
        </p>
        <a href="/communitygames/cubedodger/index.html" class="play-button">Play Now</a>
      </div>
      <!-- Add more community game items here if needed -->
    </section>
  </div>

  <!-- Footer Section -->
  <footer>
    <p>
      This site uses local browser storage (localStorage) to save your game progress and purchase states. No personal data is collected or shared.
    </p>
    <p>
      <a href="privacy.html" class="footer-link">Privacy Policy</a> | 
      <a href="contact.php" class="footer-link">Contact Us</a>
    </p>
  </footer>

  <!-- PayPal Donate Script -->
  <script src="https://www.paypalobjects.com/donate/sdk/donate-sdk.js" charset="UTF-8"></script>
  <script>
    PayPal.Donation.Button({
      env: 'production',
      hosted_button_id: '56TR4RCDXMJJY',
      image: {
        src: 'https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif',
        alt: 'Donate with PayPal button',
        title: 'PayPal - The safer, easier way to pay online!'
      }
    }).render('#donate-button');
  </script>
</body>
</html>
