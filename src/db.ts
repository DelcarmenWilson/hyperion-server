import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config()
// const pool = mysql
//   .createPool({
//     host: "127.0.0.1",
//     user: "root",
//     password: "Delcarmen1635!",
//     database: "hyperion",
//   })
//   .promise();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    
  })


  const login = (userId:string) => {
    pool.query(`CALL loginStatusOn(?)`, [userId]);
  };
  const logoff = (userId:string) => {
    pool.query(`CALL loginStatusOff(?)`, [userId]);
  };
  
  export { login,logoff };
