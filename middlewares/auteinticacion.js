var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;

// ==========================
// verificar token
//===========================
exports.verificaToken = function (req, res, next) {
  var token = req.token;

  jwt.verify(token, SEED, (err, decode) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mesanje: "Token incorrecto",
        errors: err,
      });
    }
    req.usuario = decode.usuario;
    next();

    // res.status(200).json({
    //   ok: true,
    //   decode: decode,
    // });
  });
};
