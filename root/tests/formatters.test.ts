import {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatPrice,
  formatDuration,
  formatPhone,
  formatInitials,
} from '../src/utils/formatters';

async function run() {
  console.log('Running formatters tests...');
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

  function assertEqual(actual: string, expected: string, message: string) {
    if (actual !== expected) throw new Error(`${message}: expected "${expected}", got "${actual}"`);
  }

  function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(message);
  }

  console.log('\nformatDate:');
  test('formats date correctly', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    assertEqual(result, 'Jan 15, 2024', 'Basic formatting');
  });
  test('formats with custom format', () => {
    const result = formatDate('2024-01-15', 'yyyy-MM-dd');
    assertEqual(result, '2024-01-15', 'Custom format');
  });
  test('handles invalid date', () => {
    const result = formatDate('invalid-date');
    assertEqual(result, 'Invalid date', 'Invalid date returns error message');
  });

  console.log('\nformatDateTime:');
  test('formats datetime with date part', () => {
    const result = formatDateTime('2024-01-15T14:30:00Z');
    assert(result.includes('Jan 15, 2024'), 'Should contain date');
  });

  console.log('\nformatTime:');
  test('formats time with AM/PM pattern', () => {
    const result = formatTime('2024-01-15T14:30:00Z');
    assert(result.includes('AM') || result.includes('PM'), 'Should contain AM or PM');
  });

  console.log('\nformatPrice:');
  test('formats cents to price', () => {
    const result = formatPrice(2500);
    assertEqual(result, '$25.00', 'Price formatting');
  });
  test('formats zero', () => {
    const result = formatPrice(0);
    assertEqual(result, '$0.00', 'Zero price');
  });
  test('formats with decimals', () => {
    const result = formatPrice(1234);
    assertEqual(result, '$12.34', 'Price with decimals');
  });

  console.log('\nformatDuration:');
  test('formats minutes only', () => {
    const result = formatDuration(30);
    assertEqual(result, '30 min', 'Minutes only');
  });
  test('formats hours and minutes', () => {
    const result = formatDuration(90);
    assertEqual(result, '1h 30min', 'Hours and minutes');
  });
  test('formats hours only', () => {
    const result = formatDuration(60);
    assertEqual(result, '1h', 'Hours only');
  });

  console.log('\nformatPhone:');
  test('formats 10-digit US number', () => {
    const result = formatPhone('1234567890');
    assertEqual(result, '(123) 456-7890', 'US format');
  });
  test('returns original for non-10-digit', () => {
    const result = formatPhone('12345');
    assertEqual(result, '12345', 'Non-standard format');
  });

  console.log('\nformatInitials:');
  test('extracts initials from two words', () => {
    const result = formatInitials('John Doe');
    assertEqual(result, 'JD', 'Two words');
  });
  test('extracts first two initials', () => {
    const result = formatInitials('John Michael Doe');
    assertEqual(result, 'JM', 'Three words');
  });
  test('handles single name', () => {
    const result = formatInitials('John');
    assertEqual(result, 'J', 'Single name');
  });
  test('handles lowercase', () => {
    const result = formatInitials('john doe');
    assertEqual(result, 'JD', 'Lowercase');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) throw new Error(`${failed} tests failed`);
}

export { run };