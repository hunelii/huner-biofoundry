import test from 'node:test';
import assert from 'node:assert/strict';
import { cellRenderSize } from '../living-foundry/cell-quality.ts';

test('cell resolution uses high-density screens without exceeding texture or pixel budgets', () => {
  for (const [width, height, dpr, coarse] of [[1920,1080,2,false],[390,844,3,true],[3840,2160,2,false],[1024,1366,2,true]]) {
    const result = cellRenderSize(width,height,dpr,coarse);
    assert.ok(result.width * result.height <= (coarse || width <= 600 ? 1800000 : 4200000));
    assert.ok(Math.max(result.width,result.height) <= 3840);
    assert.ok(Math.abs(result.width/result.height - width/height) < .003);
  }
  assert.equal(cellRenderSize(390,844,3,true).width,780);
});
test('degraded cell rendering lowers pixel cost while preserving composition', () => {
  const full = cellRenderSize(1920,1080,2,false);
  const reduced = cellRenderSize(1920,1080,2,false,true);
  assert.ok(reduced.width * reduced.height < full.width * full.height * .51);
  assert.ok(Math.abs(reduced.width/reduced.height - 1920/1080) < .003);
});
