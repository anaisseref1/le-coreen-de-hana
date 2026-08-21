(() => {
  "use strict";

  // Identifiants techniques historiques conservés pour ne pas perdre
  // progression et profil déjà enregistrés dans le navigateur.
  const KEYS = {
    real: "hanaKorean_profile_realName",
    hangul: "hanaKorean_profile_hangulName",
    korean: "hanaKorean_profile_koreanName",
    romanization: "hanaKorean_profile_koreanRomanization",
    display: "hanaKorean_profile_displayMode",
    birthDate: "hanaKorean_profile_birthDate",
    birthTime: "hanaKorean_profile_birthTime",
    vibe: "hanaKorean_profile_vibe"
  };

  const DEFAULT = {
    real: "Ana",
    hangul: "아나",
    korean: "아나",
    romanization: "Ana",
    display: "real"
  };

  const ROMANIZATION = {
    "아나": "Ana",
    "서연": "Seo-yeon",
    "지우": "Ji-u",
    "수아": "Su-a",
    "민서": "Min-seo",
    "서윤": "Seo-yun",
    "하린": "Ha-rin",
    "나연": "Na-yeon",
    "유나": "Yu-na",
    "지민": "Ji-min",
    "하윤": "Ha-yun",
    "예린": "Ye-rin",
    "가은": "Ga-eun",
    "지아": "Ji-a",
    "윤서": "Yun-seo",
    "채원": "Chae-won",
    "시은": "Si-eun",
    "아린": "A-rin",
    "다온": "Da-on",
    "유진": "Yu-jin",
    "보라": "Bo-ra",
    "하늘": "Ha-neul",
    "봄": "Bom",
    "세아": "Se-a"
  };

  function clean(value, max=40) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max);
  }

  // Migration silencieuse d'un ancien profil par défaut.
  function migrateLegacyDefault() {
    const oldLatin = "Ha" + "na";
    const oldHangul = "\uD558\uB098";

    if (localStorage.getItem(KEYS.real) === oldLatin) {
      localStorage.setItem(KEYS.real, "Ana");
    }
    if (localStorage.getItem(KEYS.hangul) === oldHangul) {
      localStorage.setItem(KEYS.hangul, "아나");
    }
    if (localStorage.getItem(KEYS.korean) === oldHangul) {
      localStorage.setItem(KEYS.korean, "아나");
    }
    if (localStorage.getItem(KEYS.romanization) === oldLatin) {
      localStorage.setItem(KEYS.romanization, "Ana");
    }
  }

  migrateLegacyDefault();

  function getRealName() {
    return clean(localStorage.getItem(KEYS.real)) || DEFAULT.real;
  }

  function getHangulName() {
    return clean(localStorage.getItem(KEYS.hangul)) || DEFAULT.hangul;
  }

  function getKoreanName() {
    return clean(localStorage.getItem(KEYS.korean)) || DEFAULT.korean;
  }

  function getKoreanRomanization() {
    return clean(localStorage.getItem(KEYS.romanization))
      || ROMANIZATION[getKoreanName()]
      || getRealName()
      || DEFAULT.romanization;
  }

  function getDisplayMode() {
    const mode = localStorage.getItem(KEYS.display);
    return ["real", "hangul", "korean"].includes(mode) ? mode : DEFAULT.display;
  }

  function getDisplayName() {
    const mode = getDisplayMode();
    if (mode === "hangul") return getHangulName();
    if (mode === "korean") return getKoreanName();
    return getRealName();
  }

  function getKoreanStoryName() {
    return getDisplayMode() === "korean" ? getKoreanName() : getHangulName();
  }

  function getLatinStoryName() {
    return getDisplayMode() === "korean"
      ? getKoreanRomanization()
      : getRealName();
  }

  function setProfile(data={}) {
    if ("real" in data) {
      localStorage.setItem(KEYS.real, clean(data.real) || DEFAULT.real);
    }
    if ("hangul" in data) {
      localStorage.setItem(KEYS.hangul, clean(data.hangul) || DEFAULT.hangul);
    }
    if ("korean" in data) {
      localStorage.setItem(KEYS.korean, clean(data.korean) || DEFAULT.korean);
    }
    if ("koreanRomanization" in data || "romanization" in data) {
      const value = clean(data.koreanRomanization ?? data.romanization);
      localStorage.setItem(
        KEYS.romanization,
        value || ROMANIZATION[clean(data.korean)] || DEFAULT.romanization
      );
    }
    if (["real", "hangul", "korean"].includes(data.display)) {
      localStorage.setItem(KEYS.display, data.display);
    }
    if ("birthDate" in data) localStorage.setItem(KEYS.birthDate, clean(data.birthDate));
    if ("birthTime" in data) localStorage.setItem(KEYS.birthTime, clean(data.birthTime));
    if ("vibe" in data) localStorage.setItem(KEYS.vibe, clean(data.vibe));

    return getProfile();
  }

  function getProfile() {
    return {
      real: getRealName(),
      hangul: getHangulName(),
      korean: getKoreanName(),
      koreanRomanization: getKoreanRomanization(),
      display: getDisplayMode(),
      displayName: getDisplayName(),
      birthDate: localStorage.getItem(KEYS.birthDate) || "",
      birthTime: localStorage.getItem(KEYS.birthTime) || "",
      vibe: localStorage.getItem(KEYS.vibe) || "doux"
    };
  }

  function resetProfile() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    return getProfile();
  }

  function hasBatchim(word) {
    const chars = [...String(word || "")];
    if (!chars.length) return false;

    const code = chars[chars.length - 1].charCodeAt(0);
    if (code < 0xAC00 || code > 0xD7A3) return false;

    return ((code - 0xAC00) % 28) !== 0;
  }

  function copula(name) {
    return hasBatchim(name) ? "이에요" : "예요";
  }

  function nameEndingType(name=getKoreanStoryName()) {
    return hasBatchim(name) ? "consonne" : "voyelle";
  }

  function complementaryNameExample(name=getKoreanStoryName()) {
    if (hasBatchim(name)) {
      return {
        latin: "Su-a",
        hangul: "수아",
        ending: "voyelle",
        endingKo: "예요",
        sentence: "수아예요."
      };
    }

    return {
      latin: "Min-seok",
      hangul: "민석",
      ending: "consonne",
      endingKo: "이에요",
      sentence: "민석이에요."
    };
  }

  function protectBrand(text) {
    const brands = [];
    const protectedText = text.replace(
      /Le Coréen de Ana|Le coréen de Ana/g,
      match => {
        const token = `__ANA_BRAND_${brands.length}__`;
        brands.push(match);
        return token;
      }
    );
    return { protectedText, brands };
  }

  function restoreBrand(text, brands) {
    return text.replace(
      /__ANA_BRAND_(\d+)__/g,
      (_, i) => brands[Number(i)] || ""
    );
  }

  function replacePerson(text) {
    if (!text) return text;

    const latinName = getLatinStoryName();
    const koName = getKoreanStoryName();
    const protectedBrand = protectBrand(String(text));
    let r = protectedBrand.protectedText;

    r = r.replace(/저는 아나예요/g, `저는 ${koName}${copula(koName)}`);
    r = r.replace(/제 이름은 아나예요/g, `제 이름은 ${koName}${copula(koName)}`);
    r = r.replace(/저는 아나입니다/g, `저는 ${koName}입니다`);
    r = r.replace(/제 이름은 아나입니다/g, `제 이름은 ${koName}입니다`);
    r = r.replace(/아나예요/g, `${koName}${copula(koName)}`);
    r = r.replace(/아나입니다/g, `${koName}입니다`);

    const reps = [
      [/아나 씨에게/g, `${koName} 씨에게`],
      [/아나 씨하고/g, `${koName} 씨하고`],
      [/아나 씨와/g, `${koName} 씨와`],
      [/아나 씨는/g, `${koName} 씨는`],
      [/아나 씨가/g, `${koName} 씨가`],
      [/아나 씨를/g, `${koName} 씨를`],
      [/아나 씨의/g, `${koName} 씨의`],
      [/아나 씨도/g, `${koName} 씨도`],
      [/아나 씨한테/g, `${koName} 씨한테`],
      [/아나에게/g, `${koName} 씨에게`],
      [/아나하고/g, `${koName} 씨하고`],
      [/아나와/g, `${koName} 씨와`],
      [/아나는/g, `${koName} 씨는`],
      [/아나가/g, `${koName} 씨가`],
      [/아나를/g, `${koName} 씨를`],
      [/아나의/g, `${koName} 씨의`],
      [/아나도/g, `${koName} 씨도`],
      [/아나한테/g, `${koName} 씨한테`],
      [/아나 씨/g, `${koName} 씨`]
    ];

    reps.forEach(([pattern, replacement]) => {
      r = r.replace(pattern, replacement);
    });

    r = r.replace(/\bAna\b/g, latinName);

    return restoreBrand(r, protectedBrand.brands);
  }

  function applyToNode(root=document) {
    const displayName = getDisplayName();

    root.querySelectorAll?.("[data-profile-name]").forEach(el => {
      el.textContent = displayName;
    });

    const body = root.body || root;
    if (!body) return;

    const walker = document.createTreeWalker(
      body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;

          if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "OPTION"].includes(p.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (p.closest("[data-profile-static]")) {
            return NodeFilter.FILTER_REJECT;
          }

          return /Ana|아나/.test(node.nodeValue || "")
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      node.nodeValue = replacePerson(node.nodeValue);
    });

    root.querySelectorAll?.("[data-audio],[aria-label],[title]").forEach(el => {
      ["data-audio", "aria-label", "title"].forEach(attr => {
        if (!el.hasAttribute(attr)) return;

        const value = el.getAttribute(attr);
        if (/Ana|아나/.test(value || "")) {
          el.setAttribute(attr, replacePerson(value));
        }
      });
    });
  }

  let observer;

  function observe() {
    if (!document.body || observer) return;

    observer = new MutationObserver(mutations => {
      observer.disconnect();

      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (/Ana|아나/.test(node.nodeValue || "")) {
              node.nodeValue = replacePerson(node.nodeValue);
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            applyToNode(node);
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function patchSpeech() {
    if (!window.speechSynthesis || window.speechSynthesis.__hanaProfilePatched) return;

    const original = window.speechSynthesis.speak.bind(window.speechSynthesis);

    try {
      window.speechSynthesis.speak = function(utterance) {
        try {
          const text = utterance && utterance.text;

          if (text && /Ana|아나/.test(text)) {
            const u = new SpeechSynthesisUtterance(replacePerson(text));

            ["lang", "rate", "pitch", "volume", "voice"].forEach(key => {
              try {
                if (utterance[key] != null) u[key] = utterance[key];
              } catch (_) {}
            });

            return original(u);
          }
        } catch (_) {}

        return original(utterance);
      };

      window.speechSynthesis.__hanaProfilePatched = true;
    } catch (_) {}
  }

  function apply() {
    applyToNode(document);
    observe();
    patchSpeech();

    document.documentElement.dataset.profileName = getDisplayName();

    window.dispatchEvent(
      new CustomEvent("hana-profile-applied", {
        detail: getProfile()
      })
    );
  }

  window.HanaProfile = {
    KEYS,
    getProfile,
    setProfile,
    resetProfile,
    getDisplayName,
    getKoreanStoryName,
    getLatinStoryName,
    getRealName,
    getHangulName,
    getKoreanName,
    getKoreanRomanization,
    nameEndingType,
    complementaryNameExample,
    replacePerson,
    apply
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
