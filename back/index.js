import express from 'express';
import serverless from 'serverless-http';
import 'dotenv/config';

const app = express();

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'API working' });
});

// Local dev
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`Server running locally on port ${PORT}`)
  );
}

// ✅ Must be LAST
export default serverless(app);
