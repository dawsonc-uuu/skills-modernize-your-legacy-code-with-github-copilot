const { DataProgram, Operations } = require('../index');

describe('Accounting business logic (from COBOL test plan)', () => {
  test('TP-01: 初始余额验证 - 初始余额应为 1000.00', () => {
    const data = new DataProgram();
    expect(data.read()).toBeCloseTo(1000.00, 2);
  });

  test('TP-02: 查看余额功能 - total() 返回并显示当前余额', () => {
    const data = new DataProgram();
    const ops = new Operations(data);
    const val = ops.total();
    expect(val).toBeCloseTo(1000.00, 2);
  });

  test('TP-03: 入账（正常金额）- credit 增加余额并写回', () => {
    const data = new DataProgram();
    const ops = new Operations(data);
    const res = ops.credit('100.00');
    expect(res).toBeCloseTo(1100.00, 2);
    expect(data.read()).toBeCloseTo(1100.00, 2);
  });

  test('TP-04: 扣款（余额充足）- debit 扣减余额并写回', () => {
    const data = new DataProgram();
    data.write(1100.00);
    const ops = new Operations(data);
    const res = ops.debit('100.00');
    expect(res).toBeCloseTo(1000.00, 2);
    expect(data.read()).toBeCloseTo(1000.00, 2);
  });

  test('TP-05: 扣款（余额不足）- debit 被拒绝且余额不变', () => {
    const data = new DataProgram();
    data.write(50.00);
    const ops = new Operations(data);
    const res = ops.debit('100.00');
    expect(res).toBeNull();
    expect(data.read()).toBeCloseTo(50.00, 2);
  });

  test('TP-06: 入账导致溢出（边界）- 应拒绝导致溢出的入账', () => {
    const data = new DataProgram();
    data.write(999999.00);
    const ops = new Operations(data);
    const res = ops.credit('100.00');
    expect(res).toBeNull();
    expect(data.read()).toBeCloseTo(999999.00, 2);
  });

  test('TP-07: 非数字金额输入 - credit/debit 应拒绝并不改变余额', () => {
    const data = new DataProgram();
    const ops = new Operations(data);
    expect(ops.credit('abc')).toBeNull();
    expect(ops.debit('xyz')).toBeNull();
    expect(data.read()).toBeCloseTo(1000.00, 2);
  });

  test('TP-08: 负数金额输入 - credit/debit 应拒绝并不改变余额', () => {
    const data = new DataProgram();
    const ops = new Operations(data);
    expect(ops.credit('-100.00')).toBeNull();
    expect(ops.debit('-50.00')).toBeNull();
    expect(data.read()).toBeCloseTo(1000.00, 2);
  });

  test('TP-10: 持久化验证（当前实现不持久化）- 新实例应恢复为初始余额', () => {
    const data = new DataProgram();
    const ops = new Operations(data);
    ops.credit('200.00');
    // 新的 DataProgram 实例应回到默认初始余额（因为当前实现仅在内存）
    const newData = new DataProgram();
    expect(newData.read()).toBeCloseTo(1000.00, 2);
  });
});
