module.exports = {
  async up(db, client) {
    try {
      console.log('Starting organizations collection migration...');
      const organizationCollections = await db.listCollections({ name: 'organizations' }).toArray();
      if (organizationCollections.length === 0) {
        await db.createCollection('organizations');
        console.log('Organizations collection created');
      } else {
        console.log('Organizations collection already exists');
      }
    } catch (error) {
      console.error('Organizations migration error:', error);
      throw error;
    }
  },

  async down(db, client) {
    // No down script required
  }
};
