import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ExpenseFlow server running on port ${PORT}`);
});

export default app;
