/* =========================================================
   LE CORÉEN DE HANA
   PLANTE — CROISSANCE AUTOMATIQUE
   ========================================================= */

const plant = document.getElementById("plant");
const waterButton = document.getElementById("waterButton");

const TOTAL_CHAPTERS = 42;
const PLANT_STORAGE_KEY = "hanaKorean_plant_seenChapters";

const plantStages = [
  { min: 0, emoji: "🌱", label: "Une petite pousse apparaît." },
  { min: 3, emoji: "🌿", label: "Ta pousse devient plus feuillue." },
  { min: 8, emoji: "🪴", label: "Ta plante commence vraiment à grandir." },
  { min: 16, emoji: "🌳", label: "Ta plante est devenue un bel arbre." },
  { min: 30, emoji: "🌸", label: "Ton arbre fleurit grâce à tout ton travail." }
];

function getCompletedChapters() {
  const completed = [];

  for (
    let chapterNumber = 1;
    chapterNumber <= TOTAL_CHAPTERS;
    chapterNumber++
  ) {
    const key =
      "hanaKorean_chapter" +
      chapterNumber +
      "_completed";

    if (
      localStorage.getItem(key) ===
      "completed"
    ) {
      completed.push(chapterNumber);
    }
  }

  return completed;
}

function getPlantStage(completedCount) {
  let stage = plantStages[0];

  plantStages.forEach(candidate => {
    if (
      completedCount >= candidate.min
    ) {
      stage = candidate;
    }
  });

  return stage;
}

function getPlantMessageElement() {
  let message =
    document.getElementById(
      "plantMessage"
    );

  if (
    !message &&
    plant
  ) {
    message =
      document.createElement("p");

    message.id =
      "plantMessage";

    message.className =
      "plant-message";

    plant.insertAdjacentElement(
      "afterend",
      message
    );
  }

  return message;
}

function setPlantMessage(text) {
  const message =
    getPlantMessageElement();

  if (message) {
    message.textContent = text;
  }
}

function readSeenChapters() {
  try {
    const saved =
      JSON.parse(
        localStorage.getItem(
          PLANT_STORAGE_KEY
        ) || "[]"
      );

    return Array.isArray(saved)
      ? saved
      : [];
  }

  catch (error) {
    return [];
  }
}

function saveSeenChapters(chapters) {
  localStorage.setItem(
    PLANT_STORAGE_KEY,
    JSON.stringify(chapters)
  );
}

function renderPlant() {
  if (!plant) {
    return;
  }

  /*
    L'ancien bouton d'arrosage manuel
    n'est plus utilisé.
  */

  if (waterButton) {
    waterButton.hidden = true;
    waterButton.disabled = true;
  }

  const completedChapters =
    getCompletedChapters();

  const completedCount =
    completedChapters.length;

  const stage =
    getPlantStage(
      completedCount
    );

  /*
    La plante grandit légèrement
    à chaque chapitre terminé.
  */

  const growthSize =
    68 +
    Math.min(
      completedCount,
      TOTAL_CHAPTERS
    ) *
    0.5;

  plant.textContent =
    stage.emoji;

  plant.style.fontSize =
    growthSize + "px";

  plant.setAttribute(
    "aria-label",
    "Plante de progression : " +
      completedCount +
      " chapitre" +
      (
        completedCount > 1
          ? "s"
          : ""
      ) +
      " terminé" +
      (
        completedCount > 1
          ? "s"
          : ""
      )
  );

  const seenChapters =
    readSeenChapters();

  /*
    Premier affichage :
    on synchronise simplement la mémoire.
  */

  if (
    seenChapters.length === 0
  ) {
    saveSeenChapters(
      completedChapters
    );

    if (
      completedCount === 0
    ) {
      setPlantMessage(
        "🌱 Termine ton premier chapitre pour aider ta plante à grandir."
      );
    }

    else {
      setPlantMessage(
        stage.label +
          " " +
          completedCount +
          " chapitre" +
          (
            completedCount > 1
              ? "s"
              : ""
          ) +
          " terminé" +
          (
            completedCount > 1
              ? "s"
              : ""
          ) +
          "."
      );
    }

    return;
  }

  /*
    Recherche d'un nouveau chapitre
    qui n'avait encore jamais été compté.
  */

  const newChapters =
    completedChapters.filter(
      chapterNumber =>
        !seenChapters.includes(
          chapterNumber
        )
    );

  if (
    newChapters.length > 0
  ) {
    const latestChapter =
      Math.max(
        ...newChapters
      );

    setPlantMessage(
      "🌱 Ta plante a grandi grâce au chapitre " +
        latestChapter +
        " !"
    );

    saveSeenChapters(
      completedChapters
    );

    return;
  }

  /*
    Si la progression a été réinitialisée,
    la mémoire de la plante se resynchronise.
  */

  const removedChapters =
    seenChapters.filter(
      chapterNumber =>
        !completedChapters.includes(
          chapterNumber
        )
    );

  if (
    removedChapters.length > 0
  ) {
    saveSeenChapters(
      completedChapters
    );
  }

  /*
    Message normal lorsque rien de nouveau
    n'a été détecté.
  */

  if (
    completedCount === TOTAL_CHAPTERS
  ) {
    setPlantMessage(
      "🌸 Ton arbre est en fleurs : tu as terminé les 42 chapitres !"
    );
  }

  else if (
    completedCount === 0
  ) {
    setPlantMessage(
      "🌱 Termine ton premier chapitre pour aider ta plante à grandir."
    );
  }

  else {
    setPlantMessage(
      stage.label +
        " " +
        completedCount +
        " / " +
        TOTAL_CHAPTERS +
        " chapitres terminés."
    );
  }
}

renderPlant();

window.addEventListener(
  "pageshow",
  renderPlant
);

window.addEventListener(
  "storage",
  renderPlant
);