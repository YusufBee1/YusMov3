`javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;
app.use(bodyParser.json());
app.get('/', (req, res) => {
res.send('Your movie API is live. Add /movies to the URL to start playing.');
});
app.listen(port, () => {
console.log(`Server running on port ${8080}`);
});
```