const express = require('express');
const path = require('path');

const app = express();
const port = 8000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Render the index.html file when the user visits the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cartes_de_visite.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
