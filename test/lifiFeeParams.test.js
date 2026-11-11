import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LIFI_INTEGRATOR,
  LIFI_FEE_PERCENT,
  buildLifiQuoteQueryParams,
  buildLifiRouteOptions,
  hasFeeReferrer,
} from '../src/lib/lifiFeeParams.js';

test('quote params use integrator + fee, never referrer as a fee sink', () => {
  const params = buildLifiQuoteQueryParams();
  assert.equal(params.integrator, LIFI_INTEGRATOR);
  assert.equal(params.integrator, 'kumadex');
  assert.equal(params.fee, String(LIFI_FEE_PERCENT));
  assert.equal(params.fee, '0.003');
  assert.equal('referrer' in params, false);
  assert.equal(hasFeeReferrer(params), false);
});

test('route options match quote: integrator + numeric fee, no referrer', () => {
  const options = buildLifiRouteOptions();
  assert.equal(options.integrator, 'kumadex');
  assert.equal(options.fee, 0.003);
  assert.equal('referrer' in options, false);
  assert.equal(hasFeeReferrer(options), false);
});

test('skipFee omits fee but still identifies the integrator', () => {
  const params = buildLifiQuoteQueryParams({ skipFee: true });
  assert.equal(params.integrator, 'kumadex');
  assert.equal('fee' in params, false);
  assert.equal(hasFeeReferrer(params), false);
});
