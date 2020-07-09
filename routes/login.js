var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var SEED = require("../config/config").SEED;

var app = express();
var Usuario = require("../models/usuario");

// google
var CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

// ======================================
// Autenticacion de google
// ======================================
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  //const payload = ticket.getPayload();
  const payload = ticket.getPayload();

  return {
    nombre: payload.name,
    apellido: payload.name,
    email: payload.email,
    img: payload.img,
    google: true,
    //payload: payload
  };
}

app.post("/goolge", async (req, res) => {
  var token = req.body.token;

  var googleUser = await verify(token)
    .catch((err) => {
      return res.status(403).json({
        ok: false,
        mensaje: "Token no valido",
      });
    });

  // return res.status(200).json({
  //   ok: false,
  //   googleUser: googleUser
  // });
  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mesanje: "Error al buscar usuario",
        errors: err,
      });
    }

    if (usuarioDB) {

      if (usuarioDB.google === false) {

        return res.status(400).json({
          ok: false,
          mesanje: "Debe de usar su autenticación normal",

        });
      } else {
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });


        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id
        });
      }
      // return res.status(500).json({
      //   ok: false,
      //   mesanje: "Error al buscar usuario",
      //   errors: err,
      // });
    } else {
      // el usuario no existe hay que crear uno
      var usuario = new Usuario();
      usuario.apellido = googleUser.nombre;
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ':)';

      usuario.save((err, usuarioDB) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mesanje: "Error al guardar el usuario",
            errors: err,
          });
        }

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });


        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id
        });
      });

      ////////////////////////////////////
      // res.status(200).json({
      //   ok: true,
      //   usuario: usuarioDB,
      //   token: token,
      //   id: usuarioDB._id
      // });

      //////////////////

    }
  });

  // return res.status(200).json({
  //   ok: true,
  //   mensaje: "OK!",
  //   googleUser: googleUser,
  // });
});

// ======================================
// Autenticacion normal
// ======================================
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
    // ofuscar el password
    usuarioDB.password = ":)";
    // crear un token
    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });


    res.status(200).json({
      ok: true,
      token: token,
      usuario: usuarioDB,
      id: usuarioDB._id,
    });
  });
});

module.exports = app;
