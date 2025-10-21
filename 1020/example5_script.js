// example5_script.js
// 以巢狀 for 產生 1~9 的乘法表

var output = '';
for (var i = 1; i <= 9; i++) {
  for (var j = 1; j <= 9; j++) {
    output += i + 'x' + j + '=' + (i * j) + '\t';
  }
  output += '\n';
}
document.getElementById('result').textContent = output;


// existing code
var start = parseInt(prompt('起始乘數（1-9，預設 1）', '1'), 10);
var end   = parseInt(prompt('結束乘數（1-9，預設 9）', '9'), 10);

if (isNaN(start)) start = 1;
if (isNaN(end)) end = 9;
if (start > end) {
  var t = start; start = end; end = t;
}
if (start < 1) start = 1;
if (end > 9) end = 9;

var output = '';
for (var i = start; i <= end; i++) {
  for (var j = 1; j <= 9; j++) {
    output += i + 'x' + j + '=' + (i * j) + '\t';
  }
  output += '\n';
}
document.getElementById('result').textContent = output;
