import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateDate,
  validateFutureDate,
  validateTime,
  createValidator,
} from '../src/utils/validators';

async function run() {
  console.log('Running validators tests...');
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

  console.log('\nvalidateEmail:');
  test('valid email passes', () => assert(validateEmail('test@example.com'), 'Should be true'));
  test('valid email with subdomain passes', () => assert(validateEmail('user@mail.example.com'), 'Should be true'));
  test('invalid email fails', () => assert(!validateEmail('invalid'), 'Should be false'));
  test('invalid email without @ fails', () => assert(!validateEmail('testexample.com'), 'Should be false'));
  test('empty string fails', () => assert(!validateEmail(''), 'Should be false'));

  console.log('\nvalidatePhone:');
  test('valid phone passes', () => assert(validatePhone('1234567890'), 'Should be true'));
  test('valid phone with country code passes', () => assert(validatePhone('+54 11 1234 5678'), 'Should be true'));
  test('invalid short phone fails', () => assert(!validatePhone('123'), 'Should be false'));
  test('empty string fails', () => assert(!validatePhone(''), 'Should be false'));

  console.log('\nvalidateRequired:');
  test('non-empty string passes', () => assert(validateRequired('hello'), 'Should be true'));
  test('whitespace only fails', () => assert(!validateRequired('   '), 'Should be false'));
  test('empty string fails', () => assert(!validateRequired(''), 'Should be false'));

  console.log('\nvalidateMinLength:');
  test('string of exact length passes', () => assert(validateMinLength('hello', 5), 'Should be true'));
  test('string longer than min passes', () => assert(validateMinLength('hello world', 5), 'Should be true'));
  test('string shorter fails', () => assert(!validateMinLength('hi', 5), 'Should be false'));

  console.log('\nvalidateMaxLength:');
  test('string of exact length passes', () => assert(validateMaxLength('hello', 5), 'Should be true'));
  test('string shorter passes', () => assert(validateMaxLength('hi', 5), 'Should be true'));
  test('string longer fails', () => assert(!validateMaxLength('hello world', 5), 'Should be false'));

  console.log('\nvalidatePositiveNumber:');
  test('positive number passes', () => assert(validatePositiveNumber('10'), 'Should be true'));
  test('zero fails', () => assert(!validatePositiveNumber('0'), 'Should be false'));
  test('negative fails', () => assert(!validatePositiveNumber('-5'), 'Should be false'));
  test('non-numeric fails', () => assert(!validatePositiveNumber('abc'), 'Should be false'));

  console.log('\nvalidateNonNegativeNumber:');
  test('positive number passes', () => assert(validateNonNegativeNumber('10'), 'Should be true'));
  test('zero passes', () => assert(validateNonNegativeNumber('0'), 'Should be true'));
  test('negative fails', () => assert(!validateNonNegativeNumber('-5'), 'Should be false'));

  console.log('\nvalidateDate:');
  test('valid date passes', () => assert(validateDate('2024-01-15'), 'Should be true'));
  test('invalid date fails', () => assert(!validateDate('not-a-date'), 'Should be false'));

  console.log('\nvalidateFutureDate:');
  test('future date passes', () => assert(validateFutureDate('2030-01-01'), 'Should be true'));
  test('past date fails', () => assert(!validateFutureDate('2020-01-01'), 'Should be false'));

  console.log('\nvalidateTime:');
  test('valid time passes', () => assert(validateTime('14:30'), 'Should be true'));
  test('valid time with leading zero passes', () => assert(validateTime('09:00'), 'Should be true'));
  test('invalid time fails', () => assert(!validateTime('25:00'), 'Should be false'));
  test('invalid format fails', () => assert(!validateTime('2:30pm'), 'Should be false'));

  console.log('\ncreateValidator:');
  const data = { email: 'test@example.com', name: 'John' };
  const rules = {
    email: (v: string) => validateEmail(v) || 'Invalid email',
    name: (v: string) => validateRequired(v) || 'Name is required',
  };
  const result = createValidator(data, rules);
  test('valid data passes validation', () => assert(result.isValid, 'Should be valid'));
  test('no errors for valid data', () => assert(Object.keys(result.errors).length === 0, 'Should have no errors'));

  const invalidData = { email: 'invalid', name: '' };
  const invalidResult = createValidator(invalidData, rules);
  test('invalid data fails validation', () => assert(!invalidResult.isValid, 'Should be invalid'));
  test('errors are captured', () => assert(Object.keys(invalidResult.errors).length === 2, 'Should have 2 errors'));

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) throw new Error(`${failed} tests failed`);
}

export { run };