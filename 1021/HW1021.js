(function () {
  var output = '';

  function showOutput() {
    document.getElementById('result').textContent = output;
  }

  function tempConverter() {
    var vStr = prompt('請輸入溫度數值（例如 36）：');
    if (vStr === null) { output += '溫度轉換已取消。\n'; return; }
    var v = parseFloat(vStr);
    if (isNaN(v)) { alert('數值格式錯誤'); output += '溫度轉換：數值格式錯誤\n'; return; }

    var unit = prompt('請輸入單位 C 或 F（不分大小寫）：', 'C');
    if (unit === null) { output += '溫度轉換已取消。\n'; return; }
    unit = unit.trim().toUpperCase();

    var resultText = '';
    if (unit === 'C') {
      var f = v * 9 / 5 + 32;
      resultText = v.toFixed(2) + ' °C = ' + f.toFixed(2) + ' °F';
    } else if (unit === 'F') {
      var c = (v - 32) * 5 / 9;
      resultText = v.toFixed(2) + ' °F = ' + c.toFixed(2) + ' °C';
    } else {
      alert('單位請輸入 C 或 F');
      output += '溫度轉換：單位錯誤\n';
      return;
    }

    alert('轉換結果：\n' + resultText);
    output += '溫度轉換：' + resultText + '\n';
  }

  function guessNumberGame() {
    var target = Math.floor(Math.random() * 100) + 1;
    var attempts = 0;
    while (true) {
      var gStr = prompt('猜一個 1–100 的數字（按取消結束）');
      if (gStr === null) {
        output += '猜數字遊戲已取消。\n';
        return;
      }
      var g = parseInt(gStr, 10);
      if (isNaN(g)) { alert('請輸入有效整數'); continue; }
      attempts++;
      if (g < target) {
        alert('再大一點');
      } else if (g > target) {
        alert('再小一點');
      } else {
        alert('恭喜你猜中了！次數：' + attempts);
        output += '猜數字遊戲：答案 ' + target + '，共猜 ' + attempts + ' 次\n';
        return;
      }
    }
  }

  
  tempConverter();
  guessNumberGame();

  showOutput();
})();
