(() => {
  "use strict";

  const blockRightButton = (event) => {
    if (event.button === 2) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  document.addEventListener("mousedown", blockRightButton, true);
  document.addEventListener("mouseup", blockRightButton, true);
  document.addEventListener("auxclick", blockRightButton, true);
})();
