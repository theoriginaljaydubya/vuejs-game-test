<template>
    <Card class="creature">
        <template #title>{{ name }}</template>
        <template #content>
            <div class="creature-props">
                <div>
                    <Inplace :closable="true">
                        <template #display>
                            <label>Health:</label>
                            <div>{{ health.current }}/{{ health.max }}</div>
                        </template>
                        <template #content>
                            <div class="edit-health">
                                <label>Current</label>
                                <InputText v-model="health.current" autofocus></InputText>
                                <label>Max</label>
                                <InputText v-model="health.max" />
                            </div>
                        </template>
                    </Inplace>
                </div>
                <Knob v-model="health.current" :min="0" :max="health.max" :valueColor="barClass"></Knob>
            </div>
            <!-- <ProgressBar :value="percentHealth" class="creature-health" :class="barClass"></ProgressBar> -->
        </template>
    </Card>
</template>

<script setup>
import { computed, ref } from 'vue'
import Card from 'primevue/card';
import ProgressBar from 'primevue/progressbar';
import Inplace from 'primevue/inplace';
import InputText from 'primevue/inputtext';
import Knob from 'primevue/knob';

const props = defineProps({
    id: String,
    name: String,
    // health: Number,
    // maxHealth: Number,
    health: Object,
});

const percentHealth = computed(() => Math.floor((props.health.current / props.health.max) * 100));
const knobTemplate = computed(() => health.value.current);

// const barStyles = computed(() => {
//     return props.health < 0
//         ? { width: '0%' }
//         : { width: percentHealth.value + '%' };
// });

const barClass = computed(() => {
    return percentHealth.value > 66
        ? 'green'
        : percentHealth.value > 33
            ? 'yellow'
            : 'red';
});

</script>

<style lang="less" scoped>
.creature {
    .p-card-title {
        font-size: 1.5rem;
        font-weight: 600;
    }

    .edit-health {
        display: grid;
        grid-template-columns: 1fr;
        row-gap: .5rem;
    }

    .creature-props {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: .25rem;

        label {
            font-weight: 300;
        }

        div {
            font-weight: 700;
        }
    }

    .creature-health {
        margin: 1rem 0 0 0;

        div.p-progressbar-value {
            background-color: var(--p-yellow-500);
        }

        &.warning {
            background: var(--p-yellow-100);

            .p-progressbar-value {
                background-color: var(--p-yellow-500);
            }
        }

        &.danger {
            background: var(--p-red-100);

            .p-progressbar-value {
                background-color: var(--p-red-500);
            }
        }
    }
}




// .healthbar {
//     width: 100%;
//     height: 40px;
//     border: 1px solid var(--p-stone-700, #575757);
//     border-radius: var(--p-border-radius-lg, .5rem);
//     margin: 1rem 0;
//     background: var(--pprimary-50, #fde5e5);
// }

// .healthbar-value {
//     background-color: var(--p-primary-color);
//     width: 100%;
//     height: 100%;
//     border-radius: var(--p-border-radius-lg, .5rem);
// }</style>