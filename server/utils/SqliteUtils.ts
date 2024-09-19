import type Transaction from "~/types/Transaction";
import { createDatabase } from "db0";
import path from "path";
import sqlite from "db0/connectors/better-sqlite3";

const dbPath = path.join("tmp", "db.sqlite3");

export const SqlLiteUtils = () => {
    const db = createDatabase(
        sqlite({
            path: dbPath,
        })
    );

    return {
        selectAll: async (
            searchTerm: string,
            size: number,
            page: number,
            creditFrom: number,
            creditTo: number
        ): Promise<{ rows: Transaction[]; totalRecords: number }> => {
            const offset = (page - 1) * size;
            let countSql = `SELECT COUNT(*) AS total FROM giao_dich`;
            let fetchSql = `SELECT * FROM giao_dich LIMIT ? OFFSET ?`;
            let params: any[] = [size, offset];

            // All params are default
            if (searchTerm === "" && creditFrom === 0 && creditTo === 0) {
                countSql = `SELECT COUNT(*) AS total FROM giao_dich`;
                fetchSql = `SELECT * FROM giao_dich LIMIT ? OFFSET ?`;
                params = [size, offset];
            }
            // Only search is null
            else if (searchTerm === "") {
                countSql = `SELECT COUNT(*) AS total FROM giao_dich WHERE credit >= ? AND credit <= ?`;
                fetchSql = `SELECT * FROM giao_dich WHERE credit >= ? AND credit <= ? LIMIT ? OFFSET ?`;
                params = [creditFrom, creditTo, size, offset];
            }
            // Only credit is null
            else if (creditFrom === 0 && creditTo === 0) {
                countSql = `SELECT COUNT(*) AS total FROM giao_dich WHERE LOWER(detail) LIKE '%' || LOWER(?) || '%'`;
                fetchSql = `SELECT * FROM giao_dich WHERE LOWER(detail) LIKE '%' || LOWER(?) || '%' LIMIT ? OFFSET ?`;
                params = [searchTerm, size, offset];
            }
            // Both search and credit are not null
            else {
                countSql = `SELECT COUNT(*) AS total FROM giao_dich WHERE LOWER(detail) LIKE '%' || LOWER(?) || '%' AND credit >= ? AND credit <= ?`;
                fetchSql = `SELECT * FROM giao_dich WHERE LOWER(detail) LIKE '%' || LOWER(?) || '%' AND credit >= ? AND credit <= ? LIMIT ? OFFSET ?`;
                params = [searchTerm, creditFrom, creditTo, size, offset];
            }

            const countParams =
                searchTerm === ""
                    ? creditFrom === 0 && creditTo === 0
                        ? []
                        : [creditFrom, creditTo]
                    : creditFrom === 0 && creditTo === 0
                    ? [searchTerm]
                    : [searchTerm, creditFrom, creditTo];

            const totalRecords: number = (
                (await db.prepare(countSql).get(...countParams)) as any
            ).total;

            const rows: Transaction[] = (await db
                .prepare(fetchSql)
                .all(...params)) as any;

            return { rows, totalRecords };
        },

        // New function to count total credit
        countTotalCredit: async (): Promise<number> => {
            const sql = `SELECT SUM(credit) AS totalCredit FROM giao_dich`;
            const result = await db.prepare(sql).get();
            const totalCredit: number = (result as any).totalCredit || 0;
            return totalCredit;
        },
    };
};
