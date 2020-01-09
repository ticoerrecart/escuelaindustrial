 // server.js
    require('dotenv').config({ path: 'variables.env' });

    const express = require('express');
    const webPush = require('web-push');
    const bodyParser = require('body-parser');
    const path = require('path');
    const http = require('http');
    const https = require('https');
    const fs = require('fs');

    var key = fs.readFileSync(__dirname + '/certs/selfsigned.key');
    var cert = fs.readFileSync(__dirname + '/certs/selfsigned.crt');
    var credentials  = {
      key: key,
      cert: cert
    };

    const app = express();

    app.use(bodyParser.json());

    app.use(express.static(path.join(__dirname, 'cliente')));

    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "*");
      
      next();//paso el control al próximo handler (si hubiera varios en la cadena) con esta funcion
    });



    const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
    const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

    webPush.setVapidDetails('mailto:ticoerrecart@gmail.com', publicVapidKey, privateVapidKey);

    app.post('/obtenerClavePublica', (req, res) => {
      console.log(`public key ${publicVapidKey}`)
      res.json(publicVapidKey);
    });

    app.post('/subscribe', (req, res) => {
      console.log("/suscribe");
      const subscription = req.body;
      console.log(subscription);

      //res.status(200).json({});
      
      var d = new Date().toLocaleDateString("es-AR");
      const payload = JSON.stringify({
        title: `Push notifications con Service Workers, ${d}`,
      });

      console.log("before sendNotification");
      //webPush.sendNotification(subscription, payload).catch(error => console.error(error));

      webPush.sendNotification(subscription, payload).then(function() {
        res.sendStatus(201);
      })
      .catch(function(error) {
        res.sendStatus(500);
        console.log(error);
      });

    });


    app.get('/', (req, res)=>{
        console.log("Bienvenido");
        console.log(credentials );

    });

    app.set('httpPort', process.env.PORT_HTTP || 5000);
    app.set('httpsPort', process.env.PORT_HTTPS || 5001);

let httpServer = http.createServer(app);
let httpsServer = https.createServer(credentials, app);


httpServer.listen(app.get('httpPort'), () => {
  console.log(`Express running on PORT ${httpServer.address().port}`);
});

httpsServer.listen(app.get('httpsPort'), () => {
  console.log(`Express running on PORT ${httpsServer.address().port}`);
});