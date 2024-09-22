import express from "express";
import cors from "cors";
// import pkg from "pg";
import {pool} from "./db.js";
// const {Pool} = pkg;
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
// connection interface
// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'day1',
//     password: '123456',
//     port: 5432
// });

app.get("/",async(req, res)=>{
    try{
        const client = await pool.connect();
        const result = await client.query("SELECT * FROM contacts");
        client.release();
        res.send(result.rows);
    } catch(err) {
        res.send("kuch ho gya...");
    }
});

// app.post("/insert",async(req, res)=>{
//     try{
//         const client = await pool.connect();
//         const qryStr = `insert into contacts
//         ("phoneNumber", "email", "linkPrecedency", "createdAt", "updatedAt") 
//         values ('9876543211','tesabc12@testflix.com','Primary',now(), now()) 
//         returning id`;
//         const result = await client.query(qryStr);
//         client.release();
//         res.status(200).json({
//             message: "Success",
//             data: {
//               result: result.rows[0]
//             }
//           });
//         } catch (error) {
//           res.status(500).json({
//             message: "Failed to insert data",
//             error: error.message
//           });
//         }
// });

async function validator(email, phoneNo, pool){
    const qryStr = `select max(id) mid, max("contacts"."linkedId") lid from contacts 
	where email = '${email}' OR "contacts"."phoneNumber" = '${phoneNo}'`;
    const client = await pool.connect();
    const result = await client.query(qryStr);
    client.release();
    if(result.rows.length > 0){
        let dataSet = result.rows[0];
        return dataSet;
        // if(dataSet.lid || dataSet.mid){
        //     return {id:lid, linkPerecedency:"Secondary"}
        // } else {
        //     return {id:mid, linkPerecedency:"Secondary"}
        // }
    }
}

app.post("/identity",async(req, res)=>{
    try{
        const email = req.body.email;
        const phoneNo = req.body.phoneNumber;
            if(email || phoneNo){
                const client = await pool.connect();
                let idList = await validator(email, phoneNo, pool);
                console.log(idList);
                
                const qryStr = `insert into contacts
                ("phoneNumber", "email", "linkPrecedency", "createdAt", "updatedAt") 
                values ('${phoneNo}','${email}','Primary',now(), now()) 
                returning id`;
                const result = await client.query(qryStr);
                client.release();
                res.status(200).json({
                    message: "Success",
                    data: {
                    result: result.rows[0]
                    }
                });
            } else {
                res.status(200).json({
                    message: "failed",
                    data: {
                    result: "parameter missing..."
                    }
                });
            }
        } catch (error) {
          res.status(500).json({
            message: "Failed to insert data",
            error: error.message
          });
        }
});


app.listen(port,()=>{
    console.log("Server is running at port:",port);
});