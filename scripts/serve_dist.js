const express = require('express');
const path = require('path');
const app = express();

const distPath = path.resolve(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serving frontend/dist at http://localhost:${port}`));
