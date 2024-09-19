import pg from "pg";
import Transaction from "~/types/Transaction";
const { Client } = pg;
const { dbUser, dbHost, dbName, dbPassword, isSSL } = useRuntimeConfig().public;

export const PostgresUtils = () => {
    const createClient = () : pg.Client => {
        if (isSSL == "true") {
            return new Client({
                user: dbUser,
                host: dbHost,
                database: dbName,
                password: dbPassword,
                ssl: {
                    rejectUnauthorized: true,
                },
            });
        } else {
            return new Client({
                user: dbUser,
                host: dbHost,
                database: dbName,
                password: dbPassword,
            });
        }
    };

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
            let fetchSql = `SELECT * FROM giao_dich ORDER BY no ASC LIMIT $1 OFFSET $2`;
            let params: any[] = [size, offset];

            if (searchTerm === "" && creditFrom === 0 && creditTo === 0) {
                countSql = `SELECT COUNT(*) AS total FROM giao_dich`;
                fetchSql = `SELECT * FROM giao_dich ORDER BY no ASC LIMIT $1 OFFSET $2`;
                params = [size, offset];
            } else if (searchTerm === "") {
                countSql = `SELECT COUNT(*) AS total FROM giao_dich WHERE credit >= $1 AND credit <= $2`;
                fetchSql = `SELECT * FROM giao_dich WHERE credit >= $1 AND credit <= $2 ORDER BY no ASC LIMIT $3 OFFSET $4`;
                params = [creditFrom, creditTo, size, offset];
            } else if (creditFrom === 0 && creditTo === 0) {
                countSql = `SELECT COUNT(*) AS total FROM giao_dich WHERE LOWER(detail) LIKE '%' || LOWER($1) || '%'`;
                fetchSql = `SELECT * FROM giao_dich WHERE LOWER(detail) LIKE '%' || LOWER($1) || '%' ORDER BY no ASC LIMIT $2 OFFSET $3`;
                params = [searchTerm, size, offset];
            } else {
                countSql = `SELECT COUNT(*) AS total FROM giao_dich WHERE LOWER(detail) LIKE '%' || LOWER($1) || '%' AND credit >= $2 AND credit <= $3`;
                fetchSql = `SELECT * FROM giao_dich WHERE LOWER(detail) LIKE '%' || LOWER($1) || '%' AND credit >= $2 AND credit <= $3 ORDER BY no ASC LIMIT $4 OFFSET $5`;
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

            const client = createClient();
            await client.connect();

            const totalRecordsResult = await client.query(
                countSql,
                countParams
            );
            const totalRecords: number = parseInt(
                totalRecordsResult.rows[0].total,
                10
            );

            const rowsResult = await client.query(fetchSql, params);
            const rows: Transaction[] = rowsResult.rows;

            await client.end();

            return { rows, totalRecords };
        },

        countTotalCredit: async (): Promise<number> => {
            const sql = `SELECT SUM(credit) AS total_credit FROM giao_dich`;
            const client = createClient();
            await client.connect();
            const result = await client.query(sql);
            const totalCredit: number = result.rows[0].total_credit || 0;
            await client.end();
            return totalCredit;
        },
    };
};
