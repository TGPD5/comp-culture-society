// Local dev server only — serves static files from the repo root.
// On GitHub Pages this file is ignored; the browser runs everything.
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`wordguessr dev server → http://localhost:${PORT}`));
