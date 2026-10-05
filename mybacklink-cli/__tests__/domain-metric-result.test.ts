import assert from 'node:assert/strict';
import test from 'node:test';
import { transformDomainMetricResult } from '../src/domain-metric-result.ts';
import { getCommandDefinition } from '../src/command-registry.ts';

test('traffic rejects unavailable, missing and unverified legacy zero values', () => {
	for (const result of [{}, null, { metrics: { traffic: null } }, { metrics: { traffic: 0 } }, { metrics: { traffic: 42 }, availability: { traffic: false } }]) {
		assert.throws(() => transformDomainMetricResult('fetch-traffic-by-domain', result), /data_quality_error/);
	}
});

test('traffic preserves real estimates and explicitly available zero; DR zero stays valid', () => {
	for (const traffic of [0, 45000]) {
		assert.equal(transformDomainMetricResult('fetch-traffic-by-domain', { domain: 'example.com', metrics: { traffic }, availability: { traffic: true } }).traffic, traffic);
	}
	assert.equal(transformDomainMetricResult('fetch-dr-by-domain', { metrics: { dr: 0 } }).dr, 0);
});

test('CLI advertises icon updates and both explicit backlink identifiers', () => {
	assert.ok(getCommandDefinition('update-project-info')?.params.some(param => param.name === 'icon'));
	const params = getCommandDefinition('update-project-backlinks')?.params ?? [];
	assert.ok(params.some(param => param.name === 'backlink-id'));
	assert.ok(params.some(param => param.name === 'resource-id'));
});
