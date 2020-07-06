var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var mAutorization = require("../middlewares/auteinticacion");
var SEED = require("../config/config").SEED;

var app = express();
var Usuario = require("../models/ususario");
// método de login
app.post("/", (req, res) => {
  var body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mesanje: "Error al buscar usuario",
        errors: err,
      });
    }
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mesanje: "Credenciales incorrectas - email",
        errors: err,
      });
    }
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mesanje: "Credenciales incorrectas - password",
        errors: err,
      });
    }
    // crear un token
    var token = jwt.sign({ usuario: usuarioDB }, SEED, {
      expiresIn: 14400,
    });

    usuarioDB.password = ":)";

    res.status(200).json({
      ok: true,
      token: token,
      usuario: usuarioDB,
      id: usuarioDB._id,
    });
  });
});

module.exports = app;
