const mongoose = require('mongoose');
require('dotenv').config({ path: 'BE/.env' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const counts = await db.collection('products').aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]).toArray();
  console.log("Category counts:", counts);
  process.exit(0);
});
