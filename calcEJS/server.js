// load the things we need
var express = require('express');
const bodyParser = require('body-parser')

var app = express();
app.use(express.static(__dirname));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// index page
app.get('/', function(req, res) {
  res.render('pages/index', {
    id: req.query.id
  });
});

let operaciones = new Map();

let comprobarOperaciones = new Map(operaciones);

// Receives the data from the index page
app.post('/', (req, res) => {
  let id = req.body.id;
  let accion = req.body.accion;
  let numero = req.body.numero;

  // Borra el id del map
  if(accion == "R"){
    operaciones.delete(id);
    res.render('pages/index', {
      id: ""
    });
  }
  // Actualiza o crea las operaciones
  else{
    if(operaciones.has(id)){
      var operacionActualizada = operaciones.get(id) + " " + accion + " " + numero;
      operaciones.set(id,operacionActualizada);
    }
    else{
      operaciones.set(id,0 + " " + accion + " " + numero);
    }

    // Ejecución de la operación

    str = operaciones.get(id).replace(/ +/g, "");           // Remove all spaces!

    // Get operands and operators as array.
    // Remove full matches and undefined values.
    const m = [...str.matchAll(/(-?[\d.]+)([*\/+-])?/g)].flat().filter((x, i) => x && i % 3);

    const calc = {
      "*": (a, b) => a * b,
      "/": (a, b) => a / b,
      "+": (a, b) => a + b,
      "-": (a, b) => a - b,
    };

    // Iterate by MDAS groups order (first */ and than +-)
    [/[*\/]/, /[+-]/].forEach(expr => {
      for (let i = 0; i < m.length; i += 2) {
        let [a, x, b] = [m[i], m[i + 1], m[i + 2]];
        x = expr.exec(x);
        if (!x) continue;
        m[i] = calc[x.input](parseFloat(a), parseFloat(b)); // calculate and insert
        m.splice(i + 1, 2);                                 // remove operator and operand
        i -= 2;                                             // rewind loop
      }
    });

    res.render('pages/result', {
      id: id,
      accion: accion,
      numero: numero,
      operacion: operaciones.get(id),
      resultado: m[0]
    });
  }
})

// Función que comprueba cada minuto si no se utilizó un id y lo borra de ser el caso
setInterval(function() {
  for (let [key, value] of operaciones) {
    if(value == comprobarOperaciones.get(key)){
      operaciones.delete(key);
      console.log("borrado");
    }
    comprobarOperaciones = new Map(operaciones);
  }
}, 60 * 1000);


// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.listen(8080);
console.log('8080 is the magic port');