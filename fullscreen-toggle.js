(function () {
  "use strict";

  const BUTTON_ID = "fullscreen-toggle-button";
  const ENTER_FULLSCREEN_ICON_SRC = "assets/ui/fullOff2.svg";
  const EXIT_FULLSCREEN_ICON_SRC = "assets/ui/fullOn2.svg";

  function isFullscreenActive() {
    return Boolean(
      document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );
  }

  function requestFullscreen() {
    const element = document.documentElement;
    const request =
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.msRequestFullscreen;

    if (typeof request === "function") {
      return request.call(element);
    }

    return null;
  }

  function exitFullscreen() {
    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen;

    if (typeof exit === "function") {
      return exit.call(document);
    }

    return null;
  }

  function swallowPromise(result) {
    if (result && typeof result.then === "function") {
      result.catch(function () {
        return null;
      });
    }
  }

  function updateButtonState(button) {
    const active = isFullscreenActive();
    const icon = button.querySelector("img");

    button.setAttribute("data-state", active ? "exit" : "enter");
    if (icon) {
      icon.src = active ? EXIT_FULLSCREEN_ICON_SRC : ENTER_FULLSCREEN_ICON_SRC;
    }
    button.setAttribute(
      "aria-label",
      active ? "Esci da fullscreen" : "Vai in fullscreen"
    );
    button.title = active ? "Esci da fullscreen" : "Vai in fullscreen";
  }

  function injectStyle() {
    if (document.getElementById("fullscreen-toggle-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "fullscreen-toggle-style";
    style.textContent =
      "#" +
      BUTTON_ID +
      " {" +
      "position: fixed;" +
      "right: 12px;" +
      "bottom: 12px;" +
      "right: calc(12px + env(safe-area-inset-right, 0px));" +
      "bottom: calc(12px + env(safe-area-inset-bottom, 0px));" +
      "width: 55.2px;" +
      "height: 55.2px;" +
      "border: 0;" +
      "border-radius: 999px;" +
      "background: #35A8E0;" +
      "color: #ffffff;" +
      "cursor: pointer;" +
      "padding: 0;" +
      "display: flex;" +
      "align-items: center;" +
      "justify-content: center;" +
      "z-index: 2147483647;" +
      "box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);" +
      "}" +
      "#" +
      BUTTON_ID +
      " img {" +
      "width: 30px;" +
      "height: 30px;" +
      "display: block;" +
      "object-fit: contain;" +
      "object-position: center;" +
      "transform: translate(1px, 1px);" +
      "pointer-events: none;" +
      "}" +
      "#" +
      BUTTON_ID +
      ":active { transform: scale(0.96); }" +
      "#" +
      BUTTON_ID +
      ":focus-visible { outline: 3px solid #8fd3ff; outline-offset: 2px; }";
    document.head.appendChild(style);
  }

  function init() {
    if (!document.body || document.getElementById(BUTTON_ID)) {
      return;
    }

    const canRequest = Boolean(
      document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.msRequestFullscreen
    );

    if (!canRequest) {
      return;
    }

    injectStyle();

    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    const icon = document.createElement("img");
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    icon.decoding = "async";
    button.appendChild(icon);

    updateButtonState(button);

    button.addEventListener("click", function () {
      if (isFullscreenActive()) {
        swallowPromise(exitFullscreen());
        return;
      }

      swallowPromise(requestFullscreen());
    });

    document.addEventListener("fullscreenchange", function () {
      updateButtonState(button);
    });
    document.addEventListener("webkitfullscreenchange", function () {
      updateButtonState(button);
    });
    document.addEventListener("MSFullscreenChange", function () {
      updateButtonState(button);
    });

    document.body.appendChild(button);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
