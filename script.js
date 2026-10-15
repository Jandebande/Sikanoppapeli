const setup = document.getElementById("setup");
const game = document.getElementById("game");
const playerCount = document.getElementById("playerCount");
const nameFields = document.getElementById("nameFields");
const diceMode = document.getElementById("diceMode");
const targetInput = document.getElementById("targetScore");
const startButton = document.getElementById("startGame");
const rollButton = document.getElementById("rollButton");
const bankButton = document.getElementById("bankButton");
const newGameButton = document.getElementById("newGame");
const playAgainButton = document.getElementById("playAgain");
const dieOne = document.getElementById("dieOne");
const dieTwo = document.getElementById("dieTwo");
const roundScoreElement = document.getElementById("roundScore");
const lastRoll = document.getElementById("lastRoll");
const turnBanner = document.getElementById("turnBanner");
const scoreboard = document.getElementById("scoreboard");
const roundNumber = document.getElementById("roundNumber");
const targetLabel = document.getElementById("targetLabel");
const ruleMessage = document.getElementById("ruleMessage");
const rulesText = document.getElementById("rulesText");
const winnerPanel = document.getElementById("winnerPanel");
const winnerTitle = document.getElementById("winnerTitle");
const winnerText = document.getElementById("winnerText");
const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

let players = [];
let currentPlayer = 0;
let roundScore = 0;
let targetScore = 100;
let mode = 1;
let round = 1;
let consecutiveDoubles = 0;
let gameOver = false;

function renderNameFields() {
  nameFields.replaceChildren();
  for (let i = 0; i < Number(playerCount.value); i++) {
    const label = document.createElement("label");
    label.textContent = `Pelaajan ${i + 1} nimi`;
    const input = document.createElement("input");
    input.type = "text";
    input.id = `playerName${i}`;
    input.value = `Pelaaja ${i + 1}`;
    input.maxLength = 24;
    label.appendChild(input);
    nameFields.appendChild(label);
  }
}
playerCount.addEventListener("change", renderNameFields);
renderNameFields();
startButton.addEventListener("click", startGame);
rollButton.addEventListener("click", rollDice);
bankButton.addEventListener("click", bankPoints);
newGameButton.addEventListener("click", returnToSetup);
playAgainButton.addEventListener("click", returnToSetup);

function startGame() {
  const names = Array.from(nameFields.querySelectorAll("input"), input => input.value.trim());
  if (names.some(name => !name)) {
    ruleMessage.textContent = "Anna nimi kaikille pelaajille.";
    return;
  }
  targetScore = Number(targetInput.value);
  if (!Number.isFinite(targetScore) || targetScore < 10 || targetScore > 1000) {
    ruleMessage.textContent = "Voittorajan pitää olla 10–1000 pistettä.";
    return;
  }
  mode = Number(diceMode.value);
  players = names.map(name => ({ name, score: 0 }));
  currentPlayer = 0;
  roundScore = 0;
  round = 1;
  consecutiveDoubles = 0;
  gameOver = false;
  setup.classList.add("hidden");
  winnerPanel.classList.add("hidden");
  game.classList.remove("hidden");
  targetLabel.textContent = `${targetScore} pistettä`;
  dieTwo.classList.toggle("hidden", mode === 1);
  ruleMessage.textContent = "";
  lastRoll.textContent = "Heitä noppaa aloittaaksesi.";
  renderRules();
  renderGame();
}

function rollDice() {
  if (gameOver) return;
  const first = rollOneDie();
  const second = mode === 2 ? rollOneDie() : null;
  dieOne.textContent = diceFaces[first - 1];
  if (mode === 2) dieTwo.textContent = diceFaces[second - 1];
  ruleMessage.textContent = "";

  if (mode === 1) {
    lastRoll.textContent = `Heitit ${first}.`;
    if (first === 1) {
      roundScore = 0;
      renderGame();
      endTurn("Ykkönen! Vuoron pisteet menetettiin.");
    } else {
      roundScore += first;
      renderGame();
    }
    return;
  }

  if (first === 1 && second === 1) {
    roundScore += 25;
    consecutiveDoubles = 0;
    lastRoll.textContent = "Kaksi ykköstä: +25 pistettä!";
    renderGame();
    return;
  }

  if (first === 1 || second === 1) {
    roundScore = 0;
    consecutiveDoubles = 0;
    lastRoll.textContent = `Heitit ${first} ja ${second}.`;
    renderGame();
    endTurn("Ykkönen! Vuoron pisteet menetettiin.");
    return;
  }

  if (first === second) {
    consecutiveDoubles++;
    const points = (first + second) * 2;
    roundScore += points;
    lastRoll.textContent = `Tuplat ${first} + ${second}: +${points} pistettä!`;
    if (consecutiveDoubles >= 3) {
      roundScore = 0;
      renderGame();
      endTurn("Kolmet tuplat peräkkäin! Vuoron pisteet menetettiin.");
      return;
    }
  } else {
    consecutiveDoubles = 0;
    roundScore += first + second;
    lastRoll.textContent = `Heitit ${first} ja ${second}: +${first + second} pistettä.`;
  }
  renderGame();
}

function rollOneDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function bankPoints() {
  if (gameOver) return;
  if (roundScore <= 0) {
    ruleMessage.textContent = "Heitä ensin pisteitä ennen pankitusta.";
    return;
  }
  const player = players[currentPlayer];
  player.score += roundScore;
  const banked = roundScore;
  roundScore = 0;
  consecutiveDoubles = 0;

  if (player.score >= targetScore) {
    gameOver = true;
    renderGame();
    winnerTitle.textContent = `🏆 ${player.name} voitti!`;
    winnerText.textContent = `${player.name} keräsi ${player.score} pistettä ja saavutti voittorajan.`;
    winnerPanel.classList.remove("hidden");
    rollButton.disabled = true;
    bankButton.disabled = true;
    return;
  }
  endTurn(`${player.name} pankitti ${banked} pistettä.`);
}

function endTurn(message) {
  roundScore = 0;
  consecutiveDoubles = 0;
  currentPlayer = (currentPlayer + 1) % players.length;
  if (currentPlayer === 0) round++;
  ruleMessage.textContent = message;
  lastRoll.textContent = `${players[currentPlayer].name} on seuraavana vuorossa.`;
  renderGame();
}

function renderGame() {
  turnBanner.textContent = `🎯 ${players[currentPlayer].name} heittää`;
  roundScoreElement.textContent = roundScore;
  roundNumber.textContent = `Kierros ${round}`;
  scoreboard.replaceChildren();

  players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "score-row" + (index === currentPlayer ? " active" : "");
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = index === currentPlayer ? "🎲" : "🐷";
    const meta = document.createElement("div");
    meta.className = "player-meta";
    const name = document.createElement("div");
    name.className = "player-name";
    name.textContent = player.name;
    const status = document.createElement("div");
    status.className = "player-status";
    status.textContent = index === currentPlayer ? `Vuoron pisteet: ${roundScore}` : "Kokonaispisteet";
    const score = document.createElement("div");
    score.className = "player-score";
    score.textContent = player.score;
    meta.append(name, status);
    row.append(avatar, meta, score);
    scoreboard.appendChild(row);
  });
  rollButton.disabled = gameOver;
  bankButton.disabled = gameOver;
}

function renderRules() {
  rulesText.replaceChildren();
  const list = document.createElement("ul");
  const instructions = mode === 1 ? [
    "Heitä noppaa niin monta kertaa kuin haluat.",
    "Jos heität ykkösen, menetät koko vuoron pisteet.",
    "Pankita pisteet ennen ykköstä, niin ne lisätään kokonaissaldoosi."
  ] : [
    "Tavallinen heitto lisää silmälukujen summan vuoron pisteisiin.",
    "Tuplat (esim. 3 ja 3) antavat kaksinkertaisen summan eli 12 pistettä.",
    "Kaksi ykköstä antaa 25 pistettä.",
    "Jos vain toinen noppa näyttää ykköstä, menetät vuoron pisteet.",
    "Kolmet tuplat peräkkäin päättävät vuoron ja nollaavat vuoron pisteet.",
    "Pankita pisteet ennen riskinottoa. Ensimmäinen voittorajan saavuttanut voittaa."
  ];
  instructions.forEach(text => {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  });
  rulesText.appendChild(list);
}

function returnToSetup() {
  game.classList.add("hidden");
  winnerPanel.classList.add("hidden");
  setup.classList.remove("hidden");
  rollButton.disabled = false;
  bankButton.disabled = false;
  ruleMessage.textContent = "";
}
