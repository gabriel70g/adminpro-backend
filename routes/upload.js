var express = require("express");
var app = express();
// file system
var fs = require("fs");

//importaciones de modelos
var usuario = require("../models/usuario");
var medico = require("../models/medico");
var hospital = require("../models/hospital");

const fileUpload = require("express-fileupload");

// default options
app.use(fileUpload());

app.put("/:tipo/:id", (req, res, next) => {
  //varialbes para archivos
  var tipo = req.params.tipo;
  var id = req.params.id;

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mesanje: "No seleccionó nada",
      errors: { message: "Debe seleccionar una imagen" },
    });
  }

  //obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  //solo estas extensiones aceptamos
  var extensioneValida = ["png", "jpg", "gif", "jpeg", "svg"];

  // tipos de coleccion
  var tiposValidos = ["hospitales", "medicos", "usuarios"];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mesanje: "Tipo de coleccion no valido",
      errors: {
        message: "Las colecciones válidas son " + tiposValidos.join(", "),
      },
    });
  }

  if (extensioneValida.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mesanje: "Extensión no válida",
      errors: {
        message: "Las extensiones válidas son " + extensioneValida.join(", "),
      },
    });
  }

  // nombre de archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
  //mover el archivo de un temporal a un path
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mesanje: "Error al mover archivo",
        errors: err,
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);

    // res.status(200).json({
    //   ok: true,
    //   mesanje: "Archivo movido",
    // });
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo == "usuarios") {
    usuario.findById(id, (err, usuario) => {
      var pathViejo = "./uploads/usuarios/" + usuario.img;

      // si existe, borrar la imagen anterior
      //   if (fs.existsSync(pathViejo)) {
      //     fs.unlink(pathViejo);
      //   }
      usuario.img = nombreArchivo;

      usuario.save((err, usuarioActualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mesanje: "Error actualizar el usuario",
            errors: err,
          });
        }
        return res.status(200).json({
          ok: true,
          mesanje: "Imagen de usuario actualizado",
          usuario: usuarioActualizado,
          pathViejo: pathViejo,
        });
      });
    });
  }
  if (tipo == "medicos") {
    medico.findById(id, (err, medico) => {
      var pathViejo = "./uploads/medicos/" + medico.img;

      // si existe, borrar la imagen anterior
      //   if (fs.existsSync(pathViejo)) {
      //     fs.unlink(pathViejo);
      //   }
      medico.img = nombreArchivo;

      medico.save((err, medicoActualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mesanje: "Error actualizar el medico",
            errors: err,
          });
        }
        return res.status(200).json({
          ok: true,
          mesanje: "Imagen del médico actualizada",
          medico: medicoActualizado,
          pathViejo: pathViejo,
        });
      });
    });
  }
  if (tipo == "hospitales") {
    hospital.findById(id, (err, hospital) => {
      var pathViejo = "./uploads/hospitales/" + hospital.img;

      // si existe, borrar la imagen anterior
      //   if (fs.existsSync(pathViejo)) {
      //     fs.unlink(pathViejo);
      //   }
      hospital.img = nombreArchivo;

      hospital.save((err, hospitalActualizado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mesanje: "Error actualizar el medico",
            errors: err,
          });
        }
        return res.status(200).json({
          ok: true,
          mesanje: "Imagen del hospital actualizada",
          hospital: hospitalActualizado,
          pathViejo: pathViejo,
        });
      });
    });
  }
}

module.exports = app;
