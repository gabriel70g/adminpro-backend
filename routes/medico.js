// declaracion de requires
var express = require("express");

var mAutorization = require("../middlewares/autenticacion");

var app = express();
var Medico = require("../models/medico");

// constantes
const { request } = require("./app");

// ==========================
// Obtener todos los Medicos
//===========================
app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre apellido email")
    .populate("hospital")
    .exec((err, medico) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mesanje: "Error cargando Medicos!",
          errors: err,
        });
      }

      Medico.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          medico,
          total: conteo,
        });
      });
    });
});

// ==========================
// actualizar medico
//===========================
app.put("/:id", mAutorization.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mesanje: "Error al buscar Medico",
        errors: err,
      });
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mesanje: "El Medico con el id " + id + " no existe",
        errors: { message: "No existe un Medico con ese ID" },
      });
    }
    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoActualizado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mesanje: "Error al actualizar Medico",
          errors: err,
        });
      }
      res.status(200).json({
        ok: true,
        medico: medicoActualizado,
      });
    });
  });
});

// ==========================
// crear un nuevo medico
//===========================

app.post("/", mAutorization.verificaToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital,
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mesanje: "Error al crear medico",
        errors: err,
      });
    }
    res.status(201).json({
      ok: true,
      Medico: medicoGuardado,
    });
  });
});
// ==========================
// eliminar medico por id
//===========================
app.delete("/:id", mAutorization.verificaToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mesanje: "Error al borrar médico",
        errors: err,
      });
    }
    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mesanje: "No existe medico con ese ID",
        errors: { message: "No existe medico con ese ID" },
      });
    }
    res.status(200).json({
      ok: true,
      medico: medicoBorrado,
    });
  });
});

module.exports = app;
