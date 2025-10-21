// example8_script.js
// 宣告一個學生物件，包含屬性與方法

var student = {
  name: '小明',
  id: 'A123456789',
  scores: [85, 90, 78],
  getAverage: function() {
    var sum = 0;
    for (var i = 0; i < this.scores.length; i++) {
      sum += this.scores[i];
    }
    return sum / this.scores.length;
  },
  info: function() {
    return '姓名：' + this.name + '\n學號：' + this.id;
  },
  
  // 新增：根據平均回傳等第 A/B/C/D/F
  getGrade: function() {
    var avg = this.getAverage();
    if (isNaN(avg)) return 'N/A';
    if (avg >= 90) return 'A';
    if (avg >= 80) return 'B';
    if (avg >= 70) return 'C';
    if (avg >= 60) return 'D';
    return 'F';
  }
};


var text = student.info() + '\n平均：' + student.getAverage().toFixed(2);
document.getElementById('result').textContent = text;
