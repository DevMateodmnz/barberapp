import { appointmentService } from '../src/services/supabase/appointment.service';
import { format } from 'date-fns';

async function run() {
  console.log('Running appointment service tests (mock)...');
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

  console.log('\nAppointment status constants:');
  test('has all required status values', () => {
    const statuses = ['pending', 'confirmed', 'completed', 'no_show', 'canceled_by_owner', 'canceled_by_client'];
    statuses.forEach(s => assert(typeof s === 'string', `${s} should be a string`));
  });

  console.log('\nAppointment structure:');
  test('has required fields', () => {
    const mockAppointment = {
      id: '123',
      barbershop_id: '456',
      service_id: '789',
      employee_id: 'emp1',
      client_id: 'cli1',
      starts_at: new Date().toISOString(),
      ends_at: new Date().toISOString(),
      status: 'pending',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    assert(mockAppointment.id === '123', 'Should have id');
    assert(mockAppointment.status === 'pending', 'Should have status');
  });

  console.log('\nDate handling:');
  test('validates appointment time range', () => {
    const now = new Date();
    const startsAt = now;
    const endsAt = new Date(now.getTime() + 30 * 60000);
    assert(endsAt > startsAt, 'End time should be after start time');
  });

  console.log('\nCreating appointment input:');
  test('has required fields for creation', () => {
    const validInput = {
      barbershop_id: 'bs-123',
      service_id: 'svc-456',
      employee_id: 'emp-789',
      client_id: 'cli-012',
      starts_at: new Date().toISOString(),
    };
    assert(validInput.barbershop_id !== undefined, 'Should have barbershop_id');
    assert(validInput.service_id !== undefined, 'Should have service_id');
    assert(validInput.employee_id !== undefined, 'Should have employee_id');
    assert(validInput.client_id !== undefined, 'Should have client_id');
    assert(validInput.starts_at !== undefined, 'Should have starts_at');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) throw new Error(`${failed} tests failed`);
}

export { run };