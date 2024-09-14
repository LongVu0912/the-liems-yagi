import { SqlLiteUtils } from "~/utils/SqliteUtils";

const sqliteUtils = SqlLiteUtils();

export default defineEventHandler(async (event) => {
    const data = await sqliteUtils.countTotalCredit();
    return data;
});