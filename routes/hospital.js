// declaracion de requires
var express = require("express");

var mAutorization = require("../middlewares/autenticacion");

var app = express();
var Hospital = require("../models/hospital");

// constantes
const { request } = require("./app");

// ==========================
// Obtener todos los Hospitals
//===========================
app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "apellido nombre email")
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mesanje: "Error cargando Hospitales!",
          errors: err,
        });
      }

      Hospital.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          hospitales,
          total: conteo,
        });
      });
    });
});

// ==========================
// actualizar hospital
//===========================
app.put("/:id", mAutorization.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mesanje: "Error al buscar Hospital",
        errors: err,
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mesanje: "El Hospital con el id " + id + " no existe",
        errors: { message: "No existe un Hospital con ese ID" },
      });
    }
    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalActualizado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mesanje: "Error al actualizar Hospital",
          errors: err,
        });
      }
      res.status(200).json({
        ok: true,
        hospital: hospitalActualizado,
      });
    });
  });
});

// ==========================
// crear un nuevo hospital
//===========================

app.post("/", mAutorization.verificaToken, (req, res) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id,
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mesanje: "Error al crear hospital",
        errors: err,
      });
    }
    res.status(201).json({
      ok: true,
      Hospital: hospitalGuardado,
    });
  });
});
// ==========================
// eliminar hospital por id
//===========================
app.delete("/:id", mAutorization.verificaToken, (req, res) => {
  var id = req.params.id;

  hospital.findByIdAndRemove(id, (err, HospitalBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mesanje: "Error al borrar Hospital",
        errors: err,
      });
    }
    if (!HospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mesanje: "No existe Hospital con ese ID",
        errors: { message: "No existe Hospital con ese ID" },
      });
    }
    res.status(200).json({
      ok: true,
      Hospital: HospitalBorrado,
    });
  });
});

module.exports = app;
