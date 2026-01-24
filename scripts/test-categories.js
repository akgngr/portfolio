/**
 * Simple test script for Category CRUD API
 * Run with: node scripts/test-categories.js
 * Make sure the dev server is running!
 */

const BASE_URL = 'http://localhost:4321/api/content-categories';

async function runTests() {
  console.log('🚀 Starting Category API Tests...');

  try {
    // 1. Create a category
    console.log('1. Creating category...');
    const createRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Category',
        slug: 'test-category',
        type: 'project',
        description: 'Test description'
      })
    });
    
    if (!createRes.ok) throw new Error('Create failed');
    console.log('✅ Create successful');

    // 2. List categories
    console.log('2. Listing categories...');
    const listRes = await fetch(BASE_URL);
    const categories = await listRes.json();
    const testCat = categories.find(c => c.slug === 'test-category');
    
    if (!testCat) throw new Error('Category not found in list');
    console.log('✅ List successful, found category ID:', testCat.id);

    // 3. Update category
    console.log('3. Updating category...');
    const updateRes = await fetch(`${BASE_URL}/${testCat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...testCat,
        name: 'Updated Test Category'
      })
    });
    
    if (!updateRes.ok) throw new Error('Update failed');
    console.log('✅ Update successful');

    // 4. Delete category
    console.log('4. Deleting category...');
    const deleteRes = await fetch(`${BASE_URL}/${testCat.id}`, {
      method: 'DELETE'
    });
    
    if (!deleteRes.ok) throw new Error('Delete failed');
    console.log('✅ Delete successful');

    console.log('\n✨ All tests passed!');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
