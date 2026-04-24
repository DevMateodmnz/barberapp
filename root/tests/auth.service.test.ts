import assert from 'node:assert/strict';
import { buildSignUpInput } from '../src/services/supabase/service.helpers';

export const run = (): void => {
  const payload = buildSignUpInput('  USER@Example.COM ', 'secret', 'owner', '  John Doe  ');

  assert.deepEqual(payload, {
    email: 'user@example.com',
    password: 'secret',
    options: {
      data: {
        role: 'owner',
        display_name: 'John Doe',
      },
    },
  });
};
