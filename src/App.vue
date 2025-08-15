<template>

  <div class="main">
    <header>
      <h1>Vue.js Tutorial Project</h1>
    </header>

    <div class="content">
      <div class="creatures">
        <div>
          <GameCreature
            v-bind="monster"
            @updateHealth="(val) => updateHealth(monster, val)"
            @updateOa="(val) => updateOa(monster, val)"
            @updateDa="(val) => updateDa(monster, val)">
          </GameCreature>
        </div>
        <div>
          <GameCreature
            v-bind="player"
            @updateHealth="(val) => updateHealth(player, val)"
            @updateOa="(val) => updateOa(player, val)"
            @updateDa="(val) => updateDa(player, val)">
          </GameCreature>
        </div>

        <section class="container game-over" v-if="winner">
          <h2>Game Over!</h2>
          <h3 v-if="winner === 'monster'">You lost!</h3>
          <h3 v-else-if="winner === 'player'">You won!</h3>
          <h3 v-else="winner === 'draw'">It's a draw</h3>
          <PrimevueButton @click="startGame">Start Over</PrimevueButton>
        </section>

        <section class="controls" v-else>
          <div>
            <PrimevueButton @click="doBattleRound(player.attack.melee)">Attack</PrimevueButton>
            <PrimevueButton :disabled="specialAttackDisabled" @click="doBattleRound(player.attack.special)">
              Special Attack
            </PrimevueButton>
            <PrimevueButton @click="doBattleRound(player.attack.heal)">Heal</PrimevueButton>
            <PrimevueButton @click="battle">{{ battleButtonText }}</PrimevueButton>
          </div>
        </section>
      </div>

      <section class="log-section container">
        <h2>Stats</h2>
        <div class="stats">
          <div class="item">
            <label>Player Average Damage</label>
            <div class="data">{{ playerDamageAverage }}</div>
          </div>
          <div class="item">
            <label>Player Crits</label>
            <div class="data">{{ playerCrits }}</div>
          </div>
          <div class="item">
            <label>Monster Average Damage</label>
            <div class="data">{{ monsterDamageAverage }}</div>
          </div>
          <div class="item">
            <label>Monster Misses</label>
            <div class="data">{{ monsterMisses }}</div>
          </div>
        </div>

        <div>
          <h2>Log</h2>
          <DataView :value="logs">
            <template #list="slotProps">
              <div class="log">
                <div v-for="(item, index) in slotProps.items" :key="index" class="log-item">
                  <div>{{ item.round }}</div>
                  <div :class="{ 'log-player': item.who === 'Player', 'log-monster': item.who === 'Monster' }">
                    {{ item.who }}
                  </div>
                  <div :class="{ 'miss': item.action === 'missed', 'crit': item.action.indexOf('crit') >= 0 }">
                    {{ item.action }}
                  </div>
                  <div>{{ item.value }}</div>
                </div>
              </div>
            </template>
          </DataView>
        </div>
      </section>
    </div>
  </div>

</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { getRandomValue, calculateAverage } from '@/shared/common.js';
import { create, all } from 'mathjs'

import PrimevueButton from 'primevue/button';
import DataView from 'primevue/dataview';

import GameCreature from '@/components/GameCreature.vue';

const monster = reactive({
  id: 'monster',
  name: 'Monster',
  health: { current: 750, max: 750 },
  offensiveAbility: 250,
  defensiveAbility: 150,
  attack: {
    melee: { min: 25, max: 80, name: 'melee', apr: 1 }
  }
});
const player = reactive({
  id: 'player',
  name: 'Player',
  health: { current: 300, max: 300 },
  offensiveAbility: 1500,
  defensiveAbility: 500,
  attack: {
    melee: { min: 25, max: 50, name: 'melee', apr: 2 },
    special: {
      min: 50,
      max: 75,
      name: 'special',
      //apr: 1
    },
    heal: { min: 15, max: 40, name: 'heal' }
  }
});

const math = create(all, {});

const currentRound = ref(0);
const winner = ref('');
const logs = ref([]);
const battleRunning = ref(false);
const stopBattleId = ref(0);
const battleInterval = 500;
let roundSpecialAvailable = 0;

const battleButtonText = computed(() => battleRunning.value ? 'Pause' : 'Battle')
const specialAttackDisabled = computed(() =>
  currentRound.value < roundSpecialAvailable
  || player.health === 0
  || monster.health === 0
);

const playerDamageAverage = ref(0);
const playerCrits = ref(0);
const monsterDamageAverage = ref(0);
const monsterMisses = ref(0);
watch(logs, () => {
  const playerLogs = logs.value.filter(x => x.who === 'Player');
  const monsterLogs = logs.value.filter(x => x.who === 'Monster');

  const numbers = playerLogs.filter(x => x.action !== 'healed').map((x) => x.value.damage);
  playerDamageAverage.value = numbers.length ? math.round(math.mean(numbers), 2) : 0;
  playerCrits.value = playerLogs.filter(x => x.action.includes('critical')).length;

  const numbers2 = monsterLogs.map((x) => x.value.damage);
  monsterDamageAverage.value = numbers2.length ? math.round(math.mean(numbers2), 2) : 0;
  monsterMisses.value = monsterLogs.filter(x => x.action === 'missed').length;
});

watch([() => monster.health.current, () => player.health.current],
  ([mHealth, pHealth]) => {
    if (pHealth <= 0 && mHealth <= 0) {
      endGame('draw');
    } else if (pHealth <= 0) {
      endGame('monster');
    } else if (mHealth <= 0) {
      endGame('player');
    }
  });

const endGame = (winnerValue) => {
  winner.value = winnerValue;
  stopBattle();
}

const startGame = () => {
  setHealth(player, player.health.max);
  setHealth(monster, monster.health.max);
  winner.value = null;
  currentRound.value = 0;
  roundSpecialAvailable = 0;
  logs.value = [];
}

const battle = () => {
  if (battleRunning.value) {
    stopBattle();
  } else {
    startBattle();
  }
}

const stopBattle = () => {
  battleRunning.value = false;
  clearInterval(stopBattleId.value);
}

const startBattle = () => {
  battleRunning.value = true;
  const action = () => {
    doBattleRound(specialAttackDisabled.value ? player.attack.melee : player.attack.special);
  };
  stopBattleId.value = setInterval(action, battleInterval);
}

const doBattleRound = (attackData) => {
  incrementRound();

  if (attackData.name === 'special') roundSpecialAvailable = currentRound.value + 2;

  if (attackData.name === 'heal') {
    healPlayer(attackData);
  } else {
    const apr = attackData.apr ?? 1;
    for (let i = 0; i < apr; i++) {
      attack(player, monster, attackData);
    }
  }

  if (monster.health.current > 0) {
    for (let i = 0; i < monster.attack.melee.apr ?? 1; i++) {
      attack(monster, player, monster.attack.melee);
    }
  }
};

const decreaseHealth = (creature, value) => {
  setHealth(creature, creature.health.current - value);
};

const increaseHealth = (creature, value) => {
  const max = creature.health.max;
  const newVal = creature.health.current + value;

  setHealth(creature, newVal > max ? max : newVal);
};

const setHealth = (creature, value) => {
  creature.health.current = value;
};

const updateOa = (creature, oa) => {
  creature.offensiveAbility = oa;
}

const updateDa = (creature, da) => {
  creature.defensiveAbility = da;
}

const updateHealth = (creature, health) => {
  creature.health = health;
}

const attack = (attacker, target, attackData) => {
  const hitData = getHitData(attacker.offensiveAbility, target.defensiveAbility)
  const damage = (hitData.isSuccess ? math.randomInt(attackData.min, attackData.max + 1) : 0) * hitData.hitType.multiplier;
  decreaseHealth(target, damage);
  const attackType = hitData.isSuccess ? `${attackData.name} ${hitData.hitType.type}` : 'missed';
  log(attacker.name, attackType, { damage, hitData });
};

const healPlayer = (data) => {
  let value = math.randomInt(data.min, data.max + 1);
  increaseHealth(player, value);
  log(player.name, 'healed', value);
}

const getHitData = (oa, da) => {
  const pth = calculateToHit(oa, da);
  const max = (pth > 100 ? pth : 100) + 1;
  const roll = math.randomInt(0, max);
  return {
    pth,
    roll,
    hitType: getDamageType(pth, roll),
    isSuccess: roll <= pth
  };
};

const getDamageType = (pth, roll) => {
  if (roll < 90) return { type: 'normal', multiplier: 1 };
  if (roll < 100) return { type: 'critical 1', multiplier: 1.25 };
  if (roll < 110) return { type: 'critical 2', multiplier: 1.5 };
  if (roll < 120) return { type: 'critical 3', multiplier: 1.75 };
  if (roll < 130) return { type: 'critical 4', multiplier: 2 };
  if (roll < 140) return { type: 'critical 5', multiplier: 2.5 };
  if (roll < 150) return { type: 'critical 6', multiplier: 3 };
  return { type: 'demi-god', multiplier: 5 };
};

const calculateToHit = (oa, da) => {
  return math.round((((oa / ((da / 3.5) + oa) * 300) * 0.3) + (((((oa * 3.25) + 10000) - (da * 3.25)) / 100) * 0.7)) - 50)
};

const log = (who, action, value) => {
  logs.value = [{ who, action, value, round: currentRound.value }].concat(logs.value);
}

const incrementRound = () => {
  currentRound.value++;
}
</script>

<style lang="less" scoped>
header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 0.5rem;
  background-color: #000e88;
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  border-radius: 1rem;
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.creatures {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.controls>div {
  display: flex;
  gap: 1rem;
}

// .game-over {
//   grid-column: 1 / 2 span;
//   justify-self: center;
// }

.log-section {
  .stats {
    display: flex;
    gap: 1rem;

    .item {
      display: grid;
      grid-template-columns: 1fr;

      label {
        color: gray;
        font-size: 85%;
      }

      .data {
        font-size: 2rem;
        justify-self: center;
      }
    }
  }

  .log {
    display: grid;
    grid-template-columns: 3rem 9rem 9rem 1fr;
    gap: .5rem;
  }

  .log-item {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: span 4;

    &:has(.miss) {
      background-color: rgb(196, 196, 0);
    }

    &:has(.crit) {
      background-color: rgb(116, 160, 253);
    }
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    gap: .5rem;
    margin: 0.5rem 0;
  }
}
</style>
