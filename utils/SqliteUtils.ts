import type Transaction from "~/types/Transaction";
import db from "./database";

export const SqlLiteUtils = () => {
    return {
        selectAll: (
            searchTerm: string,
            size: number,
            page: number,
            creditFrom: number,
            creditTo: number
        ): Promise<{ rows: Transaction[]; totalRecords: number }> => {
            const offset = (page - 1) * size;
            let countSql = `SELECT COUNT(*) AS total FROM chuyen_khoan`;
            let fetchSql = `SELECT * FROM chuyen_khoan LIMIT ? OFFSET ?`;
            let params: any[] = [size, offset];

            console.log("searchTerm:", searchTerm);
            console.log("creditFrom:", creditFrom);
            console.log("creditTo:", creditTo);
            console.log("=====================================");

            // * All params are default
            if (searchTerm === "" && creditFrom === 0 && creditTo === 0) {
                countSql = `SELECT COUNT(*) AS total FROM chuyen_khoan`;
                fetchSql = `SELECT * FROM chuyen_khoan LIMIT ? OFFSET ?`;
                params = [size, offset];
                console.log("Case 1: All params are default");
            }

            // * Only search is null
            else if (searchTerm === "") {
                countSql = `SELECT COUNT(*) AS total FROM chuyen_khoan WHERE credit >= ? AND credit <= ?`;
                fetchSql = `SELECT * FROM chuyen_khoan WHERE credit >= ? AND credit <= ? LIMIT ? OFFSET ?`;
                params = [creditFrom, creditTo, size, offset];
                console.log("Case 2: Only search is null");
            }

            // * Only credit is null
            else if (creditFrom === 0 && creditTo === 0) {
                countSql = `SELECT COUNT(*) AS total FROM chuyen_khoan WHERE LOWER(detail) LIKE '%' || LOWER(?) || '%'`;
                fetchSql = `SELECT * FROM chuyen_khoan WHERE LOWER(detail) LIKE '%' || LOWER(?) || '%' LIMIT ? OFFSET ?`;
                params = [searchTerm, size, offset];
                console.log("Case 3: Only credit is null");
            }

            // * Both search and credit are not null
            else {
                countSql = `SELECT COUNT(*) AS total FROM chuyen_khoan WHERE LOWER(detail) LIKE '%' || LOWER(?) || '%' AND credit >= ? AND credit <= ?`;
                fetchSql = `SELECT * FROM chuyen_khoan WHERE LOWER(detail) LIKE '%' || LOWER(?) || '%' AND credit >= ? AND credit <= ? LIMIT ? OFFSET ?`;
                params = [searchTerm, creditFrom, creditTo, size, offset];
                console.log("Case 4: Both search and credit are not null");
            }

            return new Promise((resolve, reject) => {
                const countParams = searchTerm === "" 
                    ? (creditFrom === 0 && creditTo === 0 ? [] : [creditFrom, creditTo]) 
                    : (creditFrom === 0 && creditTo === 0 ? [searchTerm] : [searchTerm, creditFrom, creditTo]);

                console.log("countSql:", countSql);
                console.log("countParams:", countParams);

                db.get(countSql, countParams, (err, result: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const totalRecords: number = result.total;

                    db.all(fetchSql, params, (err, rows: Transaction[]) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ rows, totalRecords });
                        }
                    });
                });
            });
        },

        // New function to count total credit
        countTotalCredit: (): Promise<number> => {
            const sql = `SELECT SUM(credit) AS totalCredit FROM chuyen_khoan`;

            return new Promise((resolve, reject) => {
                db.get(sql, [], (err, result: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const totalCredit: number = result.totalCredit || 0;
                    resolve(totalCredit);
                });
            });
        },
    };
};