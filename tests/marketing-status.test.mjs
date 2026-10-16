import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../utils/marketing-status.js', import.meta.url), 'utf8');
const { formatEnrollmentStatus, normalizeEnrollmentStatus, canCancelEnrollment } = await import(`data:text/javascript,${encodeURIComponent(source)}`);

test('报名和通过正确映射，历史处理状态归为已通过且已作废不允许取消', () => {
  assert.equal(formatEnrollmentStatus('submitted'), '已报名');
  assert.equal(formatEnrollmentStatus('approved'), '已通过');
  assert.equal(canCancelEnrollment('submitted'), true);
  assert.equal(canCancelEnrollment('approved'), true);
  for (const status of ['followed', 'quoted']) {
    assert.equal(normalizeEnrollmentStatus(status), 'approved');
    assert.equal(formatEnrollmentStatus(status), '已通过');
  }
  assert.equal(formatEnrollmentStatus('cancelled'), '已作废');
  assert.equal(canCancelEnrollment('cancelled'), false);
  assert.equal(canCancelEnrollment('unknown'), false);
  assert.equal(formatEnrollmentStatus('unknown'), '状态未知');
});
