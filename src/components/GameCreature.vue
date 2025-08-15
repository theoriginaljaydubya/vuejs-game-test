<template>
    <Card class="creature">
        <template #title>{{ name }}</template>
        <template #content>
            <div v-if="editing === false" class="creature-props">
                <div>
                    <Inplace>
                        <template #display>
                            <label>Health:</label>
                            <div>{{ health.current }}/{{ health.max }}</div>
                        </template>
                        <template #content="{ closeCallback }">
                            <div class="edit-health">
                                <label>Current</label>
                                <InputText v-model="currentHealth" autofocus></InputText>
                                <label>Max</label>
                                <InputText v-model="maxHealth" />
                            </div>
                            <div>
                                <PrimevueButton @click="updateHealth(closeCallback)">Save</PrimevueButton>
                                <PrimevueButton @click="closeCallback">X</PrimevueButton>
                            </div>
                        </template>
                    </Inplace>
                    <div>OA: {{ offensiveAbility }}</div>
                    <div>DA: {{ defensiveAbility }}</div>
                    <Inplace>
                        <template #display>
                            <div>OA: {{ offensiveAbility }}</div>
                        </template>
                        <template #content="{ closeCallback }">
                            <InputText v-model="localOA" size="small" autofocus></InputText>
                            <PrimevueButton @click="updateOa(closeCallback)">Save</PrimevueButton>
                            <PrimevueButton @click="closeCallback">X</PrimevueButton>
                        </template>
                    </Inplace>
                    <Inplace>
                        <template #display>
                            <div>DA: {{ defensiveAbility }}</div>
                        </template>
                        <template #content="{ closeCallback }">
                            <InputText v-model="localDA" size="small" autofocus></InputText>
                            <PrimevueButton @click="updateDa(closeCallback)">Save</PrimevueButton>
                            <PrimevueButton @click="closeCallback">X</PrimevueButton>
                        </template>
                    </Inplace>
                </div>
                <Knob v-model="health.current" :min="0" :max="health.max" :valueColor="barClass"></Knob>
            </div>
            <div v-else>
                Under construction
            </div>
            <div>
                <PrimevueButton @click="toggleEdit">
                    <span v-if="editing === false">Edit</span>
                    <span v-else>Save</span>
                </PrimevueButton>
            </div>
        </template>
    </Card>
</template>

<script setup>
import { computed, ref } from 'vue'
import Card from 'primevue/card';
import Inplace from 'primevue/inplace';
import InputText from 'primevue/inputtext';
import Knob from 'primevue/knob';
import PrimevueButton from 'primevue/button';

const props = defineProps({
    id: String,
    name: String,
    health: Object,
    offensiveAbility: Number,
    defensiveAbility: Number,
});

const emit = defineEmits(['updateOa', 'updateDa', 'updateHealth']);

const editing = ref(false);
const localOA = ref(props.offensiveAbility);
const localDA = ref(props.defensiveAbility);
const currentHealth = ref(props.health.current);
const maxHealth = ref(props.health.max);

const percentHealth = computed(() => Math.floor((props.health.current / props.health.max) * 100));

const barClass = computed(() => {
    return percentHealth.value > 66
        ? 'green'
        : percentHealth.value > 33
            ? 'yellow'
            : 'red';
});

const toggleEdit = () => {
    editing.value = !editing.value;
};

const updateOa = (closeCallback) => {
    emit('updateOa', parseInt(localOA.value));
    closeCallback();
}

const updateDa = (closeCallback) => {
    emit('updateDa', parseInt(localDA.value));
    closeCallback();
}

const updateHealth = (closeCallback) => {
    emit('updateHealth', { current: parseInt(currentHealth.value), max: parseInt(maxHealth.value) });
    closeCallback();
}

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
</style>