import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
const __dirname = path.resolve();
dotenv.config();

//routes
import  userRoutes from './src/routes/user.js';
import invoiceRoutes from './src/routes/invoice.js'
import globalErrorHandler from './src/utils/GlobalErrorHandler.js';

const app = express();
//we can use express.json instead of body-parser (body-parser is a middleware)
//middleware is used to manipulate the request data (in b/w the request and handling of data)
app.use(express.json());

//CORS is shorthand for Cross-Origin Resource Sharing.  It is a mechanism to allow or restrict 
//requested resources on a web server depend on where the HTTP request was initiated. 
//This policy is used to secure a certain web server from access by other website or domain.
app.use(cors());

//serve image and pdf 

app.use('/static/pdf', express.static(path.join(__dirname, 'simple-e-invoice-pdfs')));
app.use('/static/qrcodes', express.static(path.join(__dirname, 'simple-e-invoice-qrcodes')));



//writing an api keyword before all apis
app.use('/api/admin/user', userRoutes);
app.use('/api/admin/invoice', invoiceRoutes);



//ERROR HANDLER
app.use(globalErrorHandler);

//connecting to DB
const DB_CONN_URL=process.env.DB_CONN;
const PORT=process.env.PORT;

mongoose.connect(DB_CONN_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }).then(()=> {
      console.log("Database Connected");
      app.listen(PORT, ()=> console.log(`Server running on port : ${PORT}`));
  }).catch((error) => {
      console.log("Database Connection Failed -", error);
  });