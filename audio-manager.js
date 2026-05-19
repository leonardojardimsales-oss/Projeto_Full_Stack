(function () {
  const TEMPO_AUDIO_CHAVE = 'tempo_audio_id';
  const AUDIO_TOCANDO_CHAVE = 'tocando_audio_id';

  window.addEventListener('load', () => {
    const menuAudio = document.getElementById('menuAudio');
    if (!menuAudio) return;

    const tempoSalvo = sessionStorage.getItem(TEMPO_AUDIO_CHAVE);
    const estavaTocando = sessionStorage.getItem(AUDIO_TOCANDO_CHAVE) === 'true';

    if (tempoSalvo) {
      menuAudio.currentTime = parseFloat(tempoSalvo);
    }

    if (estavaTocando) {
      menuAudio.play().catch(() => {
        document.addEventListener('click', () => {
          menuAudio.play().catch(() => {});
        }, { once: true });
      });
    }

    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem(TEMPO_AUDIO_CHAVE, menuAudio.currentTime);
      sessionStorage.setItem(AUDIO_TOCANDO_CHAVE, String(!menuAudio.paused));
    });

    setInterval(() => {
      if (!menuAudio.paused) {
        sessionStorage.setItem(TEMPO_AUDIO_CHAVE, menuAudio.currentTime);
        sessionStorage.setItem(AUDIO_TOCANDO_CHAVE, 'true');
      }
    }, 500);
  });
})();

//isso aqui é com cristu