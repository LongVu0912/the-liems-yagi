const { dbMode } = useRuntimeConfig();

const sqlUtils = dbMode == 'postgres' ? PostgresUtils() : SqlLiteUtils();

export default defineEventHandler(async (event) => {
    const data = await sqlUtils.countTotalCredit();
    return data;
});
