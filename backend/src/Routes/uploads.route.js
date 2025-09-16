const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../uploads'); 

app.get('/api/uploads', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read uploads folder' });
    }
    res.json({ files });
  });
});


