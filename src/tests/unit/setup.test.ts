import { describe, expect, it } from 'vitest';
import { APP_NAME, API_BASE_URL } from '@/shared/constants/app.constants';

describe('M-CORE setup', () => {
  it('exposes the expected application identity', () => {
    expect(APP_NAME).toBe('M-CORE');
    expect(API_BASE_URL).toBe('/api/v1');
  });
});
