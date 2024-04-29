//PLANILHA: https://docs.google.com/spreadsheets/d/1_qzai3ygFhlON_PeIyljvUfo5tFiTgeeuJQbxxOSnvQ/edit?usp=sharing

class Data {
  constructor() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet();
    this.page = this.sheet.getSheetByName('Grupos');
    this.turma = this.page.getRange('A4').getValue();
    this.week = [];
    this.students = [];
  }

  transformToList(str) {
    var list = str.split('\n');
    return list;
  }

  limparMatriz(matriz) {
    var matrizSeparada = matriz.map(function(lista) {
      return lista[0].split("\n").filter(function(nome) {
        return nome.trim() !== ""; // Remove nomes vazios resultantes da quebra de linha extra
      });
    });
    return matrizSeparada;
  }

  getRangeStudentsList() {
    switch (this.turma) {
      case 'Turma 1': return 'A7:A25';
      case 'Turma 2': return 'A27:A44';
      default: return null;
    }
  }

  createWeek() {
    var rangeList = ['B6:B16', 'D6:D16', 'F6:F16', 'H6:H16', 'J6:J16'];
    
    switch (this.turma) {
      case 'Turma 1':
        rangeList.forEach((range) => {
          var rangeData = this.sheet.getSheetByName('Resultado T1').getRange(range).getValues();
          var cleanedData = this.limparMatriz(rangeData);
          this.week.push(cleanedData);
        });
        this.students = this.sheet.getSheetByName('Segunda').getRange(this.getRangeStudentsList()).getValues();
        break;

      case 'Turma 2':
        rangeList.forEach((range) => {
          var rangeData = this.sheet.getSheetByName('Resultado T2').getRange(range).getValues();
          var cleanedData = this.limparMatriz(rangeData);
          this.week.push(cleanedData);
        });
        this.students = this.sheet.getSheetByName('Segunda').getRange(this.getRangeStudentsList()).getValues();
        break;

      default:
        return null;
    }
  }

  getDados() {
    this.createWeek();
    return [this.week, this.students];
  }

  getPage() {
    return this.page;
  }
}

function numberToDay(num) {
  switch (num) {
    case 2: return "Segunda";
    case 3: return "Terça";
    case 4: return "Quarta";
    case 5: return "Quinta";
    case 6: return "Sexta";
    default: return "error 404!";
  }
}

function process() {
  var data = new Data();
  var [weeks, students] = data.getDados();

  if (weeks === null) {
    data.getPage().getRange("A6:L").clearContent();
    data.getPage().getRange("A6").setValue('Turma não encontrada');
    return;
  }

  var grupos = {};
  var currentDay = 2;

  weeks.forEach(function(day) {
    for (var x = 0; x < day.length - 2; x++) {
      var studentsGroup = day[x].filter(function(student) {
        return (day[x].indexOf(student) !== -1 && day[x+1].indexOf(student) !== -1 && day[x+2].indexOf(student) !== -1);
      });

      var groupKey = numberToDay(currentDay) + " : " + (7 + x) + 'h to ' + (7 + x + 3) + 'h';
      if (!grupos[groupKey]) {
        grupos[groupKey] = [];
      }
      grupos[groupKey].push(...studentsGroup);
    }
    currentDay++;
  });

  return grupos;
}

function combinationWithMaxUniqueElements(groups, maxSize) {
  let maxUniqueCount = 0;
  let bestCombination = null;

  const keys = Object.keys(groups);

  // Função para gerar combinações de chaves
  function generateCombinations(arr, r) {
    const combinations = [];
    const indices = new Array(r).fill().map((_, i) => i);

    while (indices[0] <= arr.length - r) {
      const combination = indices.map(i => arr[i]);
      combinations.push(combination);

      let i = r - 1;
      while (i >= 0 && indices[i] === arr.length - r + i) {
        i--;
      }
      if (i < 0) break;

      indices[i]++;
      for (let j = i + 1; j < r; j++) {
        indices[j] = indices[j - 1] + 1;
      }
    }

    return combinations;
  }

  // Encontrar a combinação com o maior número de elementos únicos
  for (let r = 1; r <= maxSize; r++) {
    const combinations = generateCombinations(keys, r);

    for (let combination of combinations) {
      const uniqueElements = new Set();
      const combinationResult = {};

      for (let i = 0; i < combination.length; i++) {
        const key = combination[i];
        const students = groups[key];

        // Adicionar os alunos da chave ao conjunto de elementos únicos
        students.forEach(student => {
          uniqueElements.add(student);
        });

        // Adicionar a chave e a lista de alunos ao resultado da combinação
        combinationResult[key] = students;
      }

      if (uniqueElements.size > maxUniqueCount) {
        maxUniqueCount = uniqueElements.size;
        bestCombination = combinationResult;
      }
    }
  }

  return bestCombination;
}


function main() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var page = sheet.getSheetByName('Grupos');
  page.getRange('A6:D').clearContent;

  var dados = process();
  var maxGroup = 3;

  var collumIndex = 1;

  var chooseOne = combinationWithMaxUniqueElements(dados, maxGroup);

  Logger.log(chooseOne);

  for (var horario in chooseOne) {
        page.getRange(6, collumIndex).setValue(horario);
        page.getRange(7, collumIndex).setValue(chooseOne[horario].join('\n'));
        collumIndex++;
  }

}
