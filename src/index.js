require("dotenv").config();

const express = require("express");
const routes = require("./routes");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const DadoBancario = require("../src/app/models/DadoBancario")
const Jobs = require("../src/config/schedule")

require("./database/index");

const app = express();

app.use((req, res, next) => {
  // res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  console.log('entrou no middleware')
  next();
})

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(routes);



passport.use(
  new OAuth2Strategy(
    {
      authorizationURL:"https://sandbox.sicoob.com.br/oauth2/authorize?response_type=code&redirect_uri=https://api-academic-control-v2.herokuapp.com/auth/sicoob/callback&client_id=WSqTJUVMcf69ebmG15QNwbrDf4Ea&scope=cobranca_boletos_incluir+cobranca_boletos_consultar+cobranca_boletos_pagador+cobranca_boletos_segunda_via",
      tokenURL: "https://sandbox.sicoob.com.br/token",
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://api-academic-control-v2.herokuapp.com/auth/sicoob/callback",
      host: "https://sandbox.sicoob.com.br/oauth2/",
      mode: 'cors',
      "Access-Control-Allow-Origin": "*",
      'Access-Control-Allow-Methods' : 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Credentials' : true,
    },

    async function (accessToken, refreshToken, profile, callback) {
      const object = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile,
        callback: callback,
      };

      console.log(object);
    //   Salvnado dados do token para um dados bacário pentencente a uma associação no caso estática mesmo
    const dadosBancarios = await DadoBancario.findByPk(1)
      await dadosBancarios.update({
        accessToken: accessToken,
        refreshToken: refreshToken,
      })
      callback()
    }
  )
);

// Jobs.jobRefreshToken()

const port = 3236;




app.listen(process.env.PORT || port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
