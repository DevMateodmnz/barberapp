import assert from 'node:assert/strict';
import {
  buildClientSearchPattern,
  mergeUniqueById,
} from '../src/services/supabase/service.helpers';

export const run = (): void => {
  assert.equal(buildClientSearchPattern('a_%b'), '%ab%');
  assert.equal(buildClientSearchPattern('   '), null);

  const merged = mergeUniqueById([
    { id: 'c1', name: 'Ana' },
    { id: 'c2', name: 'Bruno' },
    { id: 'c2', name: 'Bruno Updated' },
  ]);

  assert.deepEqual(merged, [
    { id: 'c1', name: 'Ana' },
    { id: 'c2', name: 'Bruno Updated' },
  ]);
};
