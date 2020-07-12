// declaracion de requires
var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var mAutorization = require("../middlewares/autenticacion");

var app = express();
var Usuario = require("../models/usuario");

// constantes
const { request } = require("./app");

// ==========================
// Obtener todos los usuarios
//===========================
app.get("/", (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, "_id nombre apellido email img role")
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mesanje: "Error cargando usuarios!",
          errors: err,
        });
      }

      Usuario.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          usuarios,
          total: conteo,
        });
      });
    });
});

// ==========================
// actualizar usuaro
//===========================
app.put("/:id", mAutorization.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mesanje: "Error al buscar usuario",
        errors: err,
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mesanje: "El usuario con el id " + id + " no existe",
        errors: { message: "No existe un usuario con ese ID" },
      });
    }
    usuario.nombre = body.nombre;
    usuario.apellido = body.apellido;
    usuario.email = body.email;
    usuario.save((err, usuarioActualizado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mesanje: "Error al actualizar usuario",
          errors: err,
        });
      }

      usuarioActualizado.password = ":)";
      res.status(200).json({
        ok: true,
        usuario: usuarioActualizado,
      });
    });
  });
});

// ==========================
// crear un nuevo usuaro
//===========================

app.post("/", (req, res) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    apellido: body.apellido,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role,
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mesanje: "Error al crear usuario",
        errors: err,
      });
    }
    usuarioGuardado.password = ":)";
    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
    });
  });
});
// ==========================
// eliminar usuaro por id
//===========================
app.delete("/:id", mAutorization.verificaToken, (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mesanje: "Error al borrar usuario",
        errors: err,
      });
    }
    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mesanje: "No existe usuario con ese ID",
        errors: { message: "No existe usuario con ese ID" },
      });
    }
    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado,
    });
  });
});

module.exports = app;
