// 简化的 Node.js 实现，保留原 COBOL 应用的业务逻辑、数据流和菜单选项
// 注释使用中文，函数与模块职责对应 DataProgram / Operations / MainProgram

const readlineSync = require('readline-sync');

// DataProgram: 管理内存中的余额（相当于 COBOL 的 STORAGE-BALANCE）
class DataProgram {
  constructor() {
    // 初始余额，保持与 COBOL 初始值一致
    this.storageBalance = 1000.00;
  }

  // READ: 将内部余额返回给调用方
  read() {
    return Number(this.storageBalance.toFixed(2));
  }

  // WRITE: 接收新的余额并更新内部存储
  write(newBalance) {
    this.storageBalance = Number(Number(newBalance).toFixed(2));
  }
}

// Operations: 执行查看/入账/扣款逻辑（对应 COBOL 的 Operations 程序）
class Operations {
  constructor(dataProgram) {
    this.dataProgram = dataProgram;
  }

  // 查看余额
  total() {
    const balance = this.dataProgram.read();
    console.log('Current balance: ' + balance.toFixed(2));
    return balance;
  }

  // 入账：读取当前余额、相加、写回
  credit(amount) {
    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      console.log('输入金额无效（必须为非负数字）。');
      return null;
    }
    let balance = this.dataProgram.read();
    const newBalance = balance + parsed;
    // 检查字段上限（PIC 9(6)V99 -> 最大 999999.99）
    if (newBalance > 999999.99) {
      console.log('入账会导致余额超出允许的最大值，操作被拒绝。');
      return null;
    }
    this.dataProgram.write(newBalance);
    console.log('Amount credited. New balance: ' + newBalance.toFixed(2));
    return newBalance;
  }

  // 扣款：读取当前余额、判断后扣减并写回
  debit(amount) {
    const parsed = parseFloat(amount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      console.log('输入金额无效（必须为非负数字）。');
      return null;
    }
    let balance = this.dataProgram.read();
    if (balance >= parsed) {
      const newBalance = balance - parsed;
      this.dataProgram.write(newBalance);
      console.log('Amount debited. New balance: ' + newBalance.toFixed(2));
      return newBalance;
    } else {
      console.log('Insufficient funds for this debit.');
      return null;
    }
  }
}

// MainProgram: 命令行菜单循环（对应 COBOL 的主程序）
function main() {
  const data = new DataProgram();
  const ops = new Operations(data);

  let continueFlag = true;
  while (continueFlag) {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');
    const choice = readlineSync.question('Enter your choice (1-4): ');

    switch (choice.trim()) {
      case '1':
        ops.total();
        break;
      case '2': {
        const amt = readlineSync.question('Enter credit amount: ');
        ops.credit(amt);
        break;
      }
      case '3': {
        const amt = readlineSync.question('Enter debit amount: ');
        ops.debit(amt);
        break;
      }
      case '4':
        continueFlag = false;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }
  console.log('Exiting the program. Goodbye!');
}

// 仅在直接运行时执行 main
if (require.main === module) {
  main();
}

// 导出以便未来在 Node.js 测试中复用（便于单元测试）
module.exports = { DataProgram, Operations };
