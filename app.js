const path = require('path');
const express = require("express");
const port = 8080;
const app = express();
const bodyparser = require("body-parser");
const feedRouter = require("./Routes/feed");
const authRouter = require('./Routes/authRoute');
const mongoose = require("mongoose");
const multer = require('multer');

const fileStorage = multer.diskStorage({
   destination: (req, file, cb) =>{
    cb(null, 'image')
  },
  filename: (req, file, cb)=>{
    cb(null, Date.now()+"-" + file.originalname);
  }
})

const filefilter = (req,file,cb) => {
  if (file.mimetype === 'image/png' ||
     file.mimetype === 'image/jpg' ||
     file.minetype==='image/jpeg'
  ) {
    cb(null, true); 
  }
  else {
    cb(null, false);
  }
}
app.use(bodyparser.json());

app.use('/image', express.static(path.join(__dirname, 'image')));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST, PUT ,DELETE ,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});
app.use(multer({
  dest: 'image/',
  storage: fileStorage,
  fileFilter: filefilter,
}).single('image'));
app.use("/feed", feedRouter);
app.use('/auth',authRouter);
app.use((error,req,res,next) => {
  console.log(error); 
  const status = error.statusCode || 500;
  const message = error.message;
 res.status(status).json({ message: message });

})

mongoose.connect('mongodb://localhost/messagepost', { useNewUrlParser: true ,useUnifiedTopology:true})
  .then(res => {
    console.log("Mongodb Connect Successfully!")
    const server = app.listen(port, err => {
      if (err) {
        console.log('Error in Server', err);
        throw err;   
      }
      console.log('Server is Running up',port)
    });
     
    const io = require('./sockets').init(server);
    io.on('connection', socket => {
      console.log("Client Connected Successfully!");
    })
    
   
  })
  .catch(err => console.log("Error Occcured!",err));


