import test from 'ava';
import EasyAes from '../easyaes';

test('復号(Blowfish)', t => {
  const cipher = new EasyAes('bfoo');
  t.is(cipher.decrypt('eHOxmiUiyV5ZzJwsWU/dOg=='), 'abc');
  t.is(cipher.decrypt('oIIbPyQtcnbc4delfaqMRQ=='), 'ほげ');
  t.is(cipher.decrypt('W0m/cMXRuAtOn3F52thHxCtQ616dAa0NChzayJ7noMff1w=='),
       '1234567890abcdef');
  t.is(cipher.decrypt(
    'VNG6DcvRz7nBSK2sWxDeWMpDWmgV3nqyziK3pGD+kX4n6xjXS4klvw==',
  ), 'abcdefghijklmnopqrstuvwxyz');
  t.is((new EasyAes('bfoobarbaz')).decrypt('//+JJMw0ZUQdkJkwrJpI2A=='),
       'abcd');
});

test('復号(AES)', t => {
  const cipher = new EasyAes('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  t.is(cipher.decrypt('qV3VoJRYlvX8CZGAx6zUXmZFtCwuzbClTcUXCzKpGS1XDg=='),
       'abc');
  t.is(cipher.decrypt('4xmHW9ok0RBUL37TbBn07a9/5FbpxC/1Fz9HAvhPdx3Wdw=='),
       'ほげ');
  t.is(cipher.decrypt(
    'CUaX4uVWa0xViwVqLj2WpqbNF5KWrn3Ia74CBzl4ugBEZAoLsapO4WYizmayJ4p27g=='
  ), '1234567890abcdef');
  t.is(cipher.decrypt(
    'D21Upeafz0SaTYHjS2+aU5PA4vWG0EfOmKxgJXHQ3fHL3rZ0aKbg11qAfvf65GVlPg==',
  ), 'abcdefghijklmnopqrstuvwxyz');
});

test('復号(3DES)', t => {
  const cipher = new EasyAes('ddddddddddddddddddddddddd');
  t.is(cipher.decrypt('h2WGwgKX0LQ9WfiLe2aALg=='), 'abc');
  t.is(cipher.decrypt('YGBhM/CvP8w6Vex9wHRKsA=='), 'ほげ');
  t.is(cipher.decrypt(
    '066XlaG0v8sl3NcjlZG3aDx1bFKfIillR+7mdO3zdHvBZg=='
  ), '1234567890abcdef');
  t.is(cipher.decrypt(
    'pL8NaKv6TN27Ky4/PDI7bHj9BFLnLnYGMH5GCXhD6rGPqGZyBhu9mA==',
  ), 'abcdefghijklmnopqrstuvwxyz');
});

test('復号(array)', t => {
  const cipher = new EasyAes('bfoobarbaz');
  t.deepEqual(cipher.decrypt([
    'ae+vjmOwtAsh5EPUY6Spuw==',
    [ 'cUiVkJR5U1cq2WPICzis9w==' ],
    { baz: 'Ao54RI5DDZvAJzNQIPhm6Q==' },
  ]), ['foo', [ 'bar' ], { baz: 'baz' }]);
});

test('復号(object)', t => {
  const cipher = new EasyAes('bfoobarbaz');
  t.deepEqual(cipher.decrypt({
    foo: 'eFaNA7Miqj0fpydR/BO6gw==',
    bar: 'dr5LFIY0HH9OmHV/fpBzow==',
    baz: 'UGHbl3uqoMQqArVPO5AJkg==',
  }), {
    foo: 'foo',
    bar: 'bar',
    baz: 'baz'
  });
  t.deepEqual(cipher.decrypt({
    foo: ['eFaNA7Miqj0fpydR/BO6gw=='],
    bar: {baz: 'dr5LFIY0HH9OmHV/fpBzow=='},
  }), {
    foo: ['foo'],
    bar: {baz: 'bar'},
  });
});

test('復号できなかったら同じ値を返す', t => {
  const cipher = new EasyAes('bbar');
  t.is(cipher.decrypt(null), null);
  t.is(cipher.decrypt(true), true);
  t.is(cipher.decrypt(false), false);
  t.is(cipher.decrypt(123), 123);
  t.is(cipher.decrypt(Date), Date);
  t.is(cipher.decrypt('foobar'), 'foobar');
  t.is(cipher.decrypt('Zm9vYmFyCg=='), 'Zm9vYmFyCg==');
  t.is(cipher.decrypt('MTIzNDU2Nzg5MGFiY2RlZgo='), 'MTIzNDU2Nzg5MGFiY2RlZgo=');
  const v = [ {foo: 'bar', baz: 123} ];
  t.is(cipher.decrypt(v), v);
});

test('OpenSSLエラーで死なない', t => {
  const cipher = new EasyAes('bbaz');
  t.is(cipher.decrypt('MTIzNDU2Nzg5MGFiY2RlCg=='), 'MTIzNDU2Nzg5MGFiY2RlCg==');
  t.is(cipher.decrypt('eHOxmiUiyV5ZzJwsWU/dOg=='), 'eHOxmiUiyV5ZzJwsWU/dOg==');
});

test('暗号化(AES)', t => {
  const cipher = new EasyAes('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  const encrypted = cipher.encrypt('abc');
  t.regex(encrypted, /^[a-z0-9/+]{46}==$/i);
  t.is(cipher.decrypt(encrypted), 'abc');
});

test('暗号化(Blowfish)', t => {
  const cipher = new EasyAes('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
  const encrypted = cipher.encrypt('abc');
  t.regex(encrypted, /^[a-z0-9/+]{22}==$/i);
  t.is(cipher.decrypt(encrypted), 'abc');
});

test('暗号化(3DES)', t => {
  const cipher = new EasyAes('ddddddddddddddddddddddddd');
  const encrypted = cipher.encrypt('abc');
  t.regex(encrypted, /^[a-z0-9/+]{22}==$/i);
  t.is(cipher.decrypt(encrypted), 'abc');
});

test('キー長が長いもしくは短い', t => {
  t.throws(() => new EasyAes('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), /key length/);
  t.throws(() => new EasyAes('dddddddddddddddddddddddd'), /key length/);
  t.throws(() => new EasyAes('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), /key length/);
  t.throws(() => new EasyAes('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'), /key length/);
  t.throws(() => new EasyAes('dddddddddddddddddddddddddd'), /key length/);
});
