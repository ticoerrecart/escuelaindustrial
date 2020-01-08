 // server.js
    require('dotenv').config({ path: 'variables.env' });

    const express = require('express');
    const webPush = require('web-push');
    const bodyParser = require('body-parser');
    const path = require('path');

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

    app.set('port', process.env.PORT || 5000);
    const server = app.listen(app.get('port'), () => {
      console.log(`Express running on PORT ${server.address().port}`);
    });