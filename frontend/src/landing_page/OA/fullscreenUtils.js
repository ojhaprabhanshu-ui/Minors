/**
 * Cross-browser fullscreen helper supporting Chrome, Firefox, Safari, Edge, and Opera.
 */

export async function enterFullscreen() {
  const elem = document.documentElement;
  try {
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari / WebKit */
      await elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      await elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      await elem.msRequestFullscreen();
    }
    return true;
  } catch (err) {
    console.error("Fullscreen Request Error:", err);
    return false;
  }
}

export async function exitFullscreen() {
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    }
    return true;
  } catch (err) {
    console.error("Fullscreen Exit Error:", err);
    return false;
  }
}

export function isFullscreenActive() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}
