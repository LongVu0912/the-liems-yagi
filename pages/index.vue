<script setup lang="ts">
import type Transaction from '~/types/Transaction';
import { useDebounceFn } from '@vueuse/core'

const size = ref(6);
const page = ref(1);
const search = ref("");
const totalCredit = ref(0);

const creditRange = reactive({
    from: 0,
    to: 0,
});

const transactions = ref<Transaction[]>([]);
const totalTransactions = ref(0);
const isLoading = ref(true);

const columns = [
    {
        key: 'no',
        label: 'No',
        class: 'max-sm:hidden',
        rowClass: 'max-sm:hidden'
    },
    {
        key: 'date_time',
        label: 'Ngày',
        class: 'md:w-24'
    },
    {
        key: 'credit',
        label: 'Số tiền',
        class: 'md:w-24'
    },
    {
        key: 'detail',
        label: 'Nội dung',
        rowClass: 'break-all'
    },
]

onMounted(async () => {
    fetchData();

    try {
        const total = await $fetch(`/api/totalCredit`, {
            method: 'GET',
        });
        totalCredit.value = total;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

const fetchData = async () => {
    isLoading.value = true;
    try {
        const data = await $fetch(`/api/findBy`, {
            method: 'GET',
            params: {
                search: search.value,
                page: page.value,
                size: size.value,
                creditFrom: creditRange.from,
                creditTo: creditRange.to,
            }
        });
        transactions.value = data.rows as Transaction[];
        totalTransactions.value = data.totalRecords;
        isLoading.value = false;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const debouncedFetchData = useDebounceFn(fetchData, 500);

watch([page, size], () => {
    fetchData();
});

const formatDate = (date: string) => {
    const [day, month, year]: string[] = date.split('/');
    const formattedDate = new Date(Number(year), Number(month) - 1, Number(day));
    return formattedDate.toLocaleDateString();
};
</script>

<template>
    <div class="mx-2 pb-4 md:mx-32">
        <div class="flex items-center justify-between py-3.5">
            <div class="flex flex-col gap-2">
                <UForm :state="creditRange" @submit.prevent="fetchData">
                    <UInput v-model="search" placeholder="Tìm nội dung..."
                            :ui="{ icon: { trailing: { pointer: 'pointer-events-auto' } } }">
                        <template #trailing>
                            <UButton icon="heroicons:magnifying-glass-16-solid" color="primary"
                                     class="-me-2.5 rounded-none rounded-r-md" type="submit" />
                        </template>
                    </UInput>
                    <div class="mt-2 flex flex-row gap-2">
                        <div class="flex flex-row items-center gap-2">
                            <div>Từ</div>
                            <UInput v-model="creditRange.from">
                                <template #trailing>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">VND</span>
                                </template>
                            </UInput>
                        </div>
                        <div class="flex flex-row items-center gap-2">
                            <div>Đến</div>
                            <UInput v-model="creditRange.to">
                                <template #trailing>
                                    <span class="text-xs text-gray-500 dark:text-gray-400">VND</span>
                                </template>
                            </UInput>
                        </div>
                    </div>
                </UForm>
            </div>

            <div class="ml-4 flex flex-shrink-0 flex-row items-center justify-center gap-2">
                <div class="hidden md:flex">Giao dịch mỗi trang:</div>
                <USelect v-model="size" :options="[5, 6, 7, 8, 9, 10]" />
            </div>
        </div>

        <UTable class="rounded-lg border border-gray-100 dark:border-gray-700" :loading="isLoading"
                :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
                :progress="{ color: 'primary', animation: 'carousel' }" :rows="transactions" :columns="columns"
                :ui="{ strategy: 'override' }" :td="{ padding: 'p-2' }">
            <template #no-data="{ row }">
                <div class="font-bold">
                    {{ row.no }}
                </div>
            </template>

            <template #date_time-data="{ row }">
                <div>
                    {{ row.date_time }}
                </div>
            </template>

            <template #credit-data="{ row }">
                <UBadge variant="outline" color="primary">
                    {{ new Intl.NumberFormat().format(row.credit) }}
                </UBadge>
            </template>

            <template #detail-data="{ row }">
                {{ row.detail }}
            </template>
        </UTable>

        <div class="flex justify-between pt-4">
            <div>
                <div class="hidden sm:flex">
                    <b>Tổng:&nbsp;</b> {{ new Intl.NumberFormat().format(totalCredit) }} VNĐ
                </div>
            </div>
            <div class="flex flex-row items-center">
                <UPagination :max="7" v-model="page" :page-count="size" :total="totalTransactions" />
            </div>
        </div>
    </div>
</template>