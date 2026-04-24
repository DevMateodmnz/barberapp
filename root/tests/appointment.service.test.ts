import assert from 'node:assert/strict';
import { parseDateOrThrow } from '../src/services/supabase/service.helpers';

export const run = (): void => {
  const date = parseDateOrThrow('2026-04-24T10:00:00.000Z', 'invalid');
  assert.equal(date.toISOString(), '2026-04-24T10:00:00.000Z');

  assert.throws(
    () => parseDateOrThrow('not-a-date', 'Invalid appointment start time'),
    /Invalid appointment start time/
  );
};
