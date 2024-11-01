const express = require('express');

const cors = require('cors');
const path = require('path');

const app = express();

//seteamos la carpeta imagenes como recurso estatico PUBLICO para poder accederlo directamente
app.use('/imagenes', express.static("imagenes"));

// Enable CORS for all routes
app.use(cors());

app.listen(3000, () => {
    console.log(`Server is up and running on port 3000 ...`);
});

const data = [
    { name: "Alicia", age: 25,
      imagen:"http://localhost:3000/imagenes/1.webp", 
      "telefono":12312 , 
      "video":"https://www.youtube.com/embed/jt14g4XydyY"},
    { name: "Bruno", age: 30,imagen:"http://localhost:3000/imagen/2","telefono":55555 ,"video":"https://www.youtube.com/embed/Uc_y25dVxt4"},
    { name: "Carlitos", age: 35,imagen:"https://resizer.glanacion.com/resizer/v2/homero-simpson-es-un-amante-declarado-de-las-XO5SSLZVMJG4HFBYZYH6FBBV6Q.jpg?auth=b3b4aa72e1f1c8d359c4e395730b9e6cf33858d60624b480213641fd5e836198&width=1200&quality=70&smart=false&height=720",
      "telefono":67776 },
  ];

app.get("/data", function(req,res){
    return res.json(data);
})

app.get('/imagen/:id', (req, res) => {
    
    console.log(req.params.id);
    const imagen =req.params.id;
    // Set the path of the image
    const imagePath = path.join(__dirname, `imagenes_privadas/${imagen}.jpeg`);
    
    // Send the image file
    res.sendFile(imagePath);
  });