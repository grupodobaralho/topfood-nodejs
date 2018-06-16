var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({
    Aplicacao: "topfood",
    Descricao: "Aplicativo de Comida que apresenta lanches servidos nos restaurantes da PUCRS e permite aos usuários a postarem imagens das comidas e comentários a respeito.",
    Arquiteto: "Israel Deorce Vieira Júnior",
    Frontend: "Hercilio Martins Ortiz",
    Backend: "Diego Osmarin Basso"
  });
});

module.exports = router;
