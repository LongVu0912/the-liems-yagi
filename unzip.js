import fs from "fs";
import _7z from "7zip-min";
import path from "path";

const zipFilePath = "./tmp/db.7z";
const extractPath = "./tmp/";
const dbFilePath = path.join(extractPath, "db.sqlite3");

// Check if the db.sqlite3 file already exists
if (fs.existsSync(dbFilePath)) {
    console.log("The database file already exists:", dbFilePath);
} else {
    // Unpack the 7z file
    _7z.unpack(zipFilePath, extractPath, (err) => {
        if (err) {
            console.error("Error unzipping the database:", err);
        } else {
            console.log("Database unzipped successfully");
        }
    });
}
