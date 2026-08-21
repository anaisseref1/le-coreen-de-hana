/* =========================================================
   LE CORÉEN DE HANA
   Progression séquentielle à l'intérieur d'un chapitre
   ---------------------------------------------------------
   Ordre :
   1. Je comprends
   2. J'écoute
   3. Je parle
   4. J'écris
   5. Je révise
   6. Je l'utilise

   Les déblocages sont permanents :
   ils reposent sur les clés "completed" déjà enregistrées
   dans localStorage.
   ========================================================= */

(function () {
  "use strict";

  const STEP_DEFINITIONS = [
    {
      id: "understanding",
      label: "Je comprends",
      icon: "📖",
      pagePrefix: "chapitre",
      keySuffix: "understanding"
    },
    {
      id: "listening",
      label: "J'écoute",
      icon: "🎧",
      pagePrefix: "ecoute",
      keySuffix: "listening"
    },
    {
      id: "speaking",
      label: "Je parle",
      icon: "🗣️",
      pagePrefix: "parle",
      keySuffix: "speaking"
    },
    {
      id: "writing",
      label: "J'écris",
      icon: "✍️",
      pagePrefix: "ecriture",
      keySuffix: "writing"
    },
    {
      id: "review",
      label: "Je révise",
      icon: "🧠",
      pagePrefix: "revision",
      keySuffix: "review"
    },
    {
      id: "mission",
      label: "Je l'utilise",
      icon: "🎯",
      pagePrefix: "utilise",
      keySuffix: "mission"
    }
  ];

  function isCompleted(key) {
    return localStorage.getItem(key) === "completed";
  }

  function getChapterNumber() {
    const bodyNumber =
      document.body &&
      document.body.dataset &&
      document.body.dataset.chapter;

    if (bodyNumber && /^\d+$/.test(bodyNumber)) {
      return Number(bodyNumber);
    }

    const path = window.location.pathname;

    const match = path.match(
      /(?:chapitre|ecoute|exercice-ecoute|parle|ecriture|revision|utilise|resume)-(\d+)\.html/i
    );

    return match ? Number(match[1]) : null;
  }

  function key(chapterNumber, suffix) {
    return (
      "hanaKorean_chapter" +
      chapterNumber +
      "_" +
      suffix
    );
  }

  /*
    Certains chapitres ont une page
    "exercice-ecoute-N.html".

    Dans ce cas, la partie "J'écoute" est considérée comme
    entièrement terminée lorsque la clé listeningExercise
    existe et vaut "completed".

    Pour les anciens chapitres qui n'utilisent pas cette clé,
    la clé listening reste suffisante.
  */
  function listeningStageCompleted(chapterNumber) {
    const exerciseKey =
      key(chapterNumber, "listeningExercise");

    const listeningKey =
      key(chapterNumber, "listening");

    const exerciseState =
      localStorage.getItem(exerciseKey);

    if (exerciseState !== null) {
      return exerciseState === "completed";
    }

    return isCompleted(listeningKey);
  }

  function stepCompleted(chapterNumber, stepId) {
    if (stepId === "listening") {
      return listeningStageCompleted(chapterNumber);
    }

    const step =
      STEP_DEFINITIONS.find(
        item => item.id === stepId
      );

    return step
      ? isCompleted(
          key(
            chapterNumber,
            step.keySuffix
          )
        )
      : false;
  }

  function stepUnlocked(chapterNumber, stepIndex) {
    if (stepIndex === 0) {
      return true;
    }

    const previousStep =
      STEP_DEFINITIONS[stepIndex - 1];

    return stepCompleted(
      chapterNumber,
      previousStep.id
    );
  }

  function createPathContainer() {
    const section =
      document.createElement("section");

    section.className =
      "hana-chapter-path";

    section.id =
      "hanaChapterPath";

    const title =
      document.createElement("h2");

    title.className =
      "hana-chapter-path__title";

    title.textContent =
      "🌿 Ton parcours dans ce chapitre";

    const grid =
      document.createElement("div");

    grid.className =
      "hana-chapter-path__grid";

    section.appendChild(title);
    section.appendChild(grid);

    return {
      section,
      grid
    };
  }

  function findExistingPathContainer() {
    return (
      document.getElementById(
        "hanaChapterPath"
      ) ||
      document.querySelector(
        "[data-chapter-path]"
      )
    );
  }

  function findInsertionPoint() {
    const header =
      document.querySelector(
        "main header"
      );

    if (header) {
      return {
        parent: header.parentNode,
        after: header
      };
    }

    const main =
      document.querySelector("main");

    if (main) {
      return {
        parent: main,
        after: null
      };
    }

    return null;
  }

  function ensureContainer() {
    let section =
      findExistingPathContainer();

    if (section) {
      let grid =
        section.querySelector(
          ".hana-chapter-path__grid"
        );

      if (!grid) {
        grid =
          document.createElement("div");

        grid.className =
          "hana-chapter-path__grid";

        section.appendChild(grid);
      }

      return {
        section,
        grid
      };
    }

    const created =
      createPathContainer();

    const insertion =
      findInsertionPoint();

    if (!insertion) {
      return null;
    }

    if (insertion.after) {
      insertion.after.insertAdjacentElement(
        "afterend",
        created.section
      );
    } else {
      insertion.parent.prepend(
        created.section
      );
    }

    return created;
  }

  function makeStepButton(
    chapterNumber,
    step,
    index
  ) {
    const completed =
      stepCompleted(
        chapterNumber,
        step.id
      );

    const unlocked =
      stepUnlocked(
        chapterNumber,
        index
      );

    const button =
      document.createElement("button");

    button.type =
      "button";

    button.className =
      "hana-chapter-path__step";

    button.dataset.step =
      step.id;

    const status =
      document.createElement("span");

    status.className =
      "hana-chapter-path__status";

    if (completed) {
      button.classList.add(
        "is-completed"
      );

      status.textContent =
        "✓";

      button.setAttribute(
        "aria-label",
        step.label +
        " — terminé"
      );
    } else if (unlocked) {
      button.classList.add(
        "is-unlocked"
      );

      status.textContent =
        "";

      button.setAttribute(
        "aria-label",
        step.label +
        " — disponible"
      );
    } else {
      button.classList.add(
        "is-locked"
      );

      status.textContent =
        "🔒";

      button.disabled =
        true;

      button.setAttribute(
        "aria-label",
        step.label +
        " — verrouillé"
      );
    }

    const icon =
      document.createElement("span");

    icon.className =
      "hana-chapter-path__icon";

    icon.textContent =
      step.icon;

    const label =
      document.createElement("span");

    label.className =
      "hana-chapter-path__label";

    label.textContent =
      step.label;

    button.appendChild(status);
    button.appendChild(icon);
    button.appendChild(label);

    if (unlocked) {
      button.addEventListener(
        "click",
        () => {
          window.location.href =
            step.pagePrefix +
            "-" +
            chapterNumber +
            ".html";
        }
      );
    }

    return button;
  }

  function renderChapterPath() {
    const chapterNumber =
      getChapterNumber();

    if (!chapterNumber) {
      return;
    }

    const container =
      ensureContainer();

    if (!container) {
      return;
    }

    container.grid.innerHTML =
      "";

    STEP_DEFINITIONS.forEach(
      (step, index) => {
        container.grid.appendChild(
          makeStepButton(
            chapterNumber,
            step,
            index
          )
        );
      }
    );
  }

  /*
    Permet aux pages de rafraîchir immédiatement
    le parcours juste après avoir enregistré une validation.
  */
  window.HanaChapterProgress = {
    render:
      renderChapterPath,

    isCompleted:
      stepCompleted,

    isUnlocked:
      stepUnlocked
  };

  document.addEventListener(
    "DOMContentLoaded",
    renderChapterPath
  );

  /*
    Si l'utilisateur revient sur une page avec le bouton Retour,
    le navigateur peut restaurer une ancienne version visuelle.
    On force donc un nouveau rendu.
  */
  window.addEventListener(
    "pageshow",
    renderChapterPath
  );

  /*
    Si une autre page/onglet modifie localStorage,
    on actualise le parcours.
  */
  window.addEventListener(
    "storage",
    renderChapterPath
  );
})();