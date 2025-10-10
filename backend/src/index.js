import express from 'express'
import cors from 'cors'
import {mongodb} from './Db.js'


console.log(new Date().toISOString()); // Logs current UTC time in ISO format

const app=express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

mongodb().then(()=>{
app.listen(8000,()=>{
    console.log("server started at localhost:8000");
})
}
)