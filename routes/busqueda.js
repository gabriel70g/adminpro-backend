var express = require("express");
var app = express();

// importaciones
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// =============================================
// busqueda por colección
// =============================================
app.get("/coleccion/:tabla/:busqueda", (req, res) => {
  var tabla = req.params.tabla;
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, "i");
  var promesa;

  switch (tabla) {
    case "usuarios":
      promesa = buscarMUsuarios(busqueda, regex);
      break;
    case "medicos":
      promesa = buscarMedicos(busqueda, regex);
      break;
    case "hospitales":
      promesa = buscarHospitales(busqueda, regex);
      break;
    default:
      return res.status(400).json({
        ok: false,
        message:
          "Los tipos de busqueda solo son 'usuarios', 'medicos' y 'hospitales'",
        error: { message: "Tipo de tabla o collección no valido" },
      });
  }

  promesa.then((data) => {
    res.status(200).json({
      ok: false,
      [tabla]: data,
    });
  });
});

// =============================================
// busqueda por todo
// =============================================
app.get("/todo/:busqueda", (req, res, next) => {
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, "i");

  Promise.all([
    buscarHospitales(busqueda, regex),
    buscarMedicos(busqueda, regex),
    buscarMUsuarios(busqueda, regex),
  ]).then((respuesta) => {
    res.status(200).json({
      ok: true,
      hospitales: respuesta[0],
      medicos: respuesta[1],
      usuarios: respuesta[2],
    });
  });
});

function buscarHospitales(busqueda, regx) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regx })
      .populate("usuario", "nombre apellido email")
      .exec((err, hospitales) => {
        if (err) {
          reject("Error al cargar hospitales ", err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(busqueda, regx) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regx })
      .populate("usuario", "nombre apellido mail")
      .populate("hospital")
      .exec((err, medicos) => {
        if (err) {
          reject("Error al cargar medicos ", err);
        } else {
          resolve(medicos);
        }
      });
  });
}

function buscarMUsuarios(busqueda, regx) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, "nombre apellido email")
      .or({ nombre: regx }, { apellido: regx }, { email: regx })
      .exec((err, usuarios) => {
        if (err) {
          reject("Error al cargar el usuario ", err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;
