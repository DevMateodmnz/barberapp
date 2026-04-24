import assert from 'node:assert/strict';
import {
  INVITE_GENERIC_ERROR,
  resolveInviteErrorMessage,
} from '../src/services/supabase/service.helpers';

export const run = (): void => {
  assert.equal(resolveInviteErrorMessage(new Error('not found')), INVITE_GENERIC_ERROR);
  assert.equal(resolveInviteErrorMessage('anything'), INVITE_GENERIC_ERROR);

  const duplicate = new Error('This user is already an employee at this barbershop');
  assert.equal(resolveInviteErrorMessage(duplicate), duplicate.message);
};
