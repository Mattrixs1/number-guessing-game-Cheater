async function readNumber() {
  const display = document.getElementById('display');
  const hint = document.getElementById('hint');
  const dot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  display.textContent = 'SCANNING...';
  display.className = 'number loading';
  hint.textContent = '';
  dot.className = 'dot';
  statusText.textContent = 'Lese Variable...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'MAIN', // Run in the page's own JS world, not the extension sandbox
      func: () => {
        if (typeof numberToGuess !== 'undefined') {
          return { success: true, value: numberToGuess };
        }
        // Fallback: try window explicitly
        if (typeof window.numberToGuess !== 'undefined') {
          return { success: true, value: window.numberToGuess };
        }
        return { success: false, reason: 'Variable nicht gefunden' };
      }
    });

    const result = results[0].result;

    if (result.success) {
      display.textContent = result.value;
      display.className = 'number';
      hint.textContent = 'Zahl liegt zwischen 0 und 100';
      dot.className = 'dot active';
      statusText.textContent = 'Variable gefunden ✓';
    } else {
      display.textContent = 'NICHT GEFUNDEN';
      display.className = 'number error';
      hint.textContent = result.reason;
      dot.className = 'dot';
      statusText.textContent = 'Falsche Seite?';
    }
  } catch (err) {
    display.textContent = 'FEHLER';
    display.className = 'number error';
    hint.textContent = 'Kein Zugriff auf diese Seite';
    dot.className = 'dot';
    statusText.textContent = err.message.slice(0, 40);
  }
}

document.getElementById('refresh-btn').addEventListener('click', readNumber);

// Auto-read on popup open
readNumber();
