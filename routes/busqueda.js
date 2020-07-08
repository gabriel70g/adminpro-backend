var express = require("express");
var app = express();

// importaciones
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");

app.get("/todo/:busqueda", (req, res, next) => {
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, "i");

  buscarHospitales(busqueda, regex).then((hospitales) => {
    res.status(200).json({
      ok: true,
      hospitales: hospitales,
    });
  });
});

function buscarHospitales(busqueda, regx) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regx }, (err, hospitales) => {
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
    Medico.find({ nombre: regx }, (err, medicos) => {
      if (err) {
        reject("Error al cargar medicos ", err);
      } else {
        resolve(medicos);
      }
    });
  });
}

module.exports = app;
