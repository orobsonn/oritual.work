import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTargetDays } from '../src/lib/server/target-days.ts';

test('devolve os dias de um JSON válido', () => {
	assert.deepEqual(parseTargetDays('["mon","wed"]'), ['mon', 'wed']);
});

test('JSON malformado vira lista vazia em vez de lançar', () => {
	assert.deepEqual(parseTargetDays('{nao-e-json'), []);
});

test('JSON válido que não é lista de textos vira lista vazia', () => {
	assert.deepEqual(parseTargetDays('{"a":1}'), []);
	assert.deepEqual(parseTargetDays('null'), []);
	assert.deepEqual(parseTargetDays('[1,2]'), []);
});
