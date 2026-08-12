const waterButton = document.getElementById("waterButton");
const plant = document.getElementById("plant");

let waterLevel = 0;

const plantStages = [
  "🌱",
  "🌿",
  "🪴",
  "🌳",
  "🌸"
];

waterButton.addEventListener("click", function () {

  if (waterLevel < plantStages.length - 1) {
    waterLevel++;

    plant.textContent = plantStages[waterLevel];
  }

});