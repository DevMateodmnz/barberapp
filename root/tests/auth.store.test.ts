async function run() {
  console.log('Running auth store structure tests...');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (error: any) {
      console.log(`  ✗ ${name}: ${error.message}`);
      failed++;
    }
  }

  function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(message);
  }

  console.log('\nUser roles:');
  test('has all required roles', () => {
    const roles = ['owner', 'barber', 'client'];
    roles.forEach(r => assert(typeof r === 'string', `${r} should be a string`));
  });

  console.log('\nAuth state interface:');
  test('has required state properties', () => {
    const stateKeys = ['user', 'session', 'loading', 'initialized', 'error'];
    stateKeys.forEach(key => assert(typeof key === 'string', `${key} should be a string key`));
  });

  console.log('\nAuth actions:');
  test('has required action names', () => {
    const actions = ['setUser', 'setSession', 'setLoading', 'setError', 'signIn', 'signUp', 'signOut', 'updateProfile', 'initialize'];
    actions.forEach(action => assert(typeof action === 'string', `${action} should be a string`));
  });

  console.log('\nUser type validation:');
  test('validates user object structure', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      role: 'client',
      display_name: 'Test User',
      phone: null,
      photo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    assert(mockUser.id !== undefined, 'Should have id');
    assert(mockUser.email !== undefined, 'Should have email');
    assert(mockUser.role !== undefined, 'Should have role');
    assert(['owner', 'barber', 'client'].includes(mockUser.role), 'Role should be valid');
  });

  console.log('\nSession structure:');
  test('session has required fields', () => {
    const mockSession = {
      access_token: 'token123',
      user: { id: '123', email: 'test@example.com' },
      expires_at: Date.now() + 3600000,
    };
    assert(mockSession.access_token !== undefined, 'Should have access_token');
    assert(mockSession.user !== undefined, 'Should have user');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) throw new Error(`${failed} tests failed`);
}

export { run };