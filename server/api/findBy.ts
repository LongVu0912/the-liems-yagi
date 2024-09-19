const { dbMode } = useRuntimeConfig();

const sqlUtils = dbMode == 'postgres' ? PostgresUtils() : SqlLiteUtils();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const search = (query.search as string) || "";
    const size = Number(query.size) || 10;
    const page = Number(query.page) || 1;
    const creditFrom = Number(query.creditFrom) || 0;
    const creditTo = Number(query.creditTo) || 0;

    const data = await sqlUtils.selectAll(
        search,
        size,
        page,
        creditFrom,
        creditTo
    );
    return data;
});
