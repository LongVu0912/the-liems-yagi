import sqlite3 from "sqlite3";

const dbName = "./the_liems.db";

let db = new sqlite3.Database(
    dbName,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Connected to the database");
        }
    }
);

export default db;
