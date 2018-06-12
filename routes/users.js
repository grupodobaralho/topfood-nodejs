var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({Arquiteto: "Israel Deorce Vieira Junior",
            Frontend: "Hercílio Ortiz Martins",
            Backend: "Diego Osmarin Basso"});
});

module.exports = router;
