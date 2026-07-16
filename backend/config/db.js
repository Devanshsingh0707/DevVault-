const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    try {
      const db = mongoose.connection.db;
      
      // Check cards collection
      const cardsCol = await db.listCollections({ name: 'cards' }).toArray();
      if (cardsCol.length > 0) {
        try {
          await db.collection('cards').dropIndex('title_text_description_text_category_text_tags_text');
          console.log('Successfully dropped old text index. Rebuilding text index with language override fix...');
        } catch (e) {
          // Ignore if index doesn't exist
        }
      }

      // Check users collection and drop duplicate index if exists
      const usersCol = await db.listCollections({ name: 'users' }).toArray();
      if (usersCol.length > 0) {
        try {
          await db.collection('users').dropIndex('username_1');
          console.log('Successfully dropped legacy unique username_1 index.');
        } catch (e) {
          // Ignore if index doesn't exist
        }
      }
    } catch (indexErr) {
      console.log('Note: Index drop checked.');
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
