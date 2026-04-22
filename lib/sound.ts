export function playAlarmSound(repeat: number = 5) {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    let offset = 0;

    for (let i = 0; i < repeat; i++) {
      const oscHigh = ctx.createOscillator();
      const gainHigh = ctx.createGain();
      oscHigh.connect(gainHigh);
      gainHigh.connect(ctx.destination);
      oscHigh.frequency.value = 1200;
      oscHigh.type = "square";
      gainHigh.gain.value = 0.25;
      oscHigh.start(now + offset);
      oscHigh.stop(now + offset + 0.15);

      const oscLow = ctx.createOscillator();
      const gainLow = ctx.createGain();
      oscLow.connect(gainLow);
      gainLow.connect(ctx.destination);
      oscLow.frequency.value = 800;
      oscLow.type = "square";
      gainLow.gain.value = 0.25;
      oscLow.start(now + offset + 0.2);
      oscLow.stop(now + offset + 0.35);

      offset = offset + 0.5;
    }
  } catch (e) {
    console.warn("Audio not supported", e);
  }
}

export function playNotifySound() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const notes = [523, 659, 784];
    let offset = 0;

    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = notes[i];
      osc.type = "sine";
      gain.gain.value = 0.2;
      osc.start(now + offset);
      osc.stop(now + offset + 0.3);

      offset = offset + 0.15;
    }
  } catch (e) {
    console.warn("Audio not supported", e);
  }
}
