// example2_script.js
// 變數宣告與基本型態操作

var text = '123';              // 字串
var num = 45;                  // 數字
var isPass = true;             // 布林
var emptyValue = null;         // 空值
var notAssigned;               // undefined（尚未指定）

// 型態檢查
var lines = '';
lines += 'text = ' + text + '，typeof: ' + (typeof text) + '\n';
lines += 'num = ' + num + '，typeof: ' + (typeof num) + '\n';
lines += 'isPass = ' + isPass + '，typeof: ' + (typeof isPass) + '\n';
lines += 'emptyValue = ' + emptyValue + '，typeof: ' + (typeof emptyValue) + '\n';
lines += 'notAssigned = ' + notAssigned + '，typeof: ' + (typeof notAssigned) + '\n\n';

// 轉型
var textToNumber = parseInt(text, 10); // 將 '123' → 123
lines += 'parseInt(\'123\') = ' + textToNumber + '\n';
lines += 'String(45) = ' + String(num) + '\n';

document.getElementById('result').textContent = lines;


var aStr = prompt('請輸入第一個數字', '0');
var bStr = prompt('請輸入第二個數字', '0');
var a = parseFloat(aStr);
var b = parseFloat(bStr);

if (isNaN(a) || isNaN(b)) {
  document.getElementById('result').textContent += '\n延伸練習：輸入有誤，請輸入有效數字';
} else {
  var sum = a + b;
  document.getElementById('result').textContent += '\n延伸練習：' +
    '\n輸入：' + aStr + '、' + bStr +
    '\n相加結果：' + sum;
}