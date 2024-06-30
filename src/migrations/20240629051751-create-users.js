module.exports = {
  async up(db, client) {
    try {
      console.log('Starting users collection migration...');
      const userCollections = await db.listCollections({ name: 'users' }).toArray();
      if (userCollections.length === 0) {
        await db.createCollection('users');
        console.log('Users collection created');
      } else {
        console.log('Users collection already exists');
      }
    } catch (error) {
      console.error('Users migration error:', error);
      throw error;
    }
  },

  async down(db, client) {
    // No down script required
  }
};
