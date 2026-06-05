/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Synthesizer for high-fidelity offline sound generation.
// This ensures that the user can hear real-time customized audio fx immediately,
// even if external URLs are slow or unavailable.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSynthesizedSound(type: string) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'sb-1': // Bomb Ticking
        // Short high-pitched tick with noise
        for (let i = 0; i < 4; i++) {
          const t = now + i * 0.5;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, t);
          osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
          
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.15);
        }
        break;

      case 'sb-2': // Block Alignment
        // 2-tone melodic retro chirp
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc1.frequency.setValueAtTime(1046.50, now + 0.24); // C6

        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.5);
        break;

      case 'sb-3': // Tower Collapse Crash
        // Bandpass filtered noise decay
        const bufferSize = ctx.sampleRate * 0.5; // half second buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseNode.start(now);
        noiseNode.stop(now + 0.52);
        break;

      case 'sb-4': // Fanfare completed
        // Upbeat major chords
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // CEGC
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          // Vibrato
          osc.frequency.linearRampToValueAtTime(f * 1.02, now + 0.4);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + 0.8);
        });
        break;

      case 'md-1': // heartbeat loop tension
        // Heavy pulsing bass thump
        for (let i = 0; i < 3; i++) {
          const t = now + i * 0.6;
          const oscLine = ctx.createOscillator();
          const gainLine = ctx.createGain();
          oscLine.type = 'sine';
          oscLine.frequency.setValueAtTime(65, t);
          oscLine.frequency.exponentialRampToValueAtTime(20, t + 0.25);

          gainLine.gain.setValueAtTime(0.5, t);
          gainLine.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

          oscLine.connect(gainLine);
          gainLine.connect(ctx.destination);
          oscLine.start(t);
          oscLine.stop(t + 0.3);

          // Second heartbeat thump
          const t2 = t + 0.15;
          const oscLine2 = ctx.createOscillator();
          const gainLine2 = ctx.createGain();
          oscLine2.type = 'sine';
          oscLine2.frequency.setValueAtTime(60, t2);
          oscLine2.frequency.exponentialRampToValueAtTime(20, t2 + 0.25);

          gainLine2.gain.setValueAtTime(0.4, t2);
          gainLine2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.25);

          oscLine2.connect(gainLine2);
          gainLine2.connect(ctx.destination);
          oscLine2.start(t2);
          oscLine2.stop(t2 + 0.3);
        }
        break;

      case 'md-2': // Trapdoor Metal Slam
        const oscSlam = ctx.createOscillator();
        const gainSlam = ctx.createGain();
        oscSlam.type = 'square';
        oscSlam.frequency.setValueAtTime(80, now);
        oscSlam.frequency.linearRampToValueAtTime(30, now + 0.25);
        gainSlam.gain.setValueAtTime(0.4, now);
        gainSlam.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscSlam.connect(gainSlam);
        gainSlam.connect(ctx.destination);
        oscSlam.start(now);
        oscSlam.stop(now + 0.35);
        break;

      case 'md-3': // Cash coin drop cascade
        // Beautiful falling chips/coins cascade
        for (let i = 0; i < 12; i++) {
          const delay = i * 0.06;
          const tone = 900 + Math.random() * 800;
          const oscC = ctx.createOscillator();
          const gainC = ctx.createGain();
          oscC.type = 'sine';
          oscC.frequency.setValueAtTime(tone, now + delay);
          gainC.gain.setValueAtTime(0.15, now + delay);
          gainC.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

          oscC.connect(gainC);
          gainC.connect(ctx.destination);
          oscC.start(now + delay);
          oscC.stop(now + delay + 0.15);
        }
        break;

      case 'md-4': // Wrong Answer Horn
        const oscH1 = ctx.createOscillator();
        const oscH2 = ctx.createOscillator();
        const gainH = ctx.createGain();
        oscH1.type = 'sawtooth';
        oscH2.type = 'sawtooth';
        oscH1.frequency.setValueAtTime(140, now);
        oscH2.frequency.setValueAtTime(138, now); // beat frequency for ugly sound
        
        gainH.gain.setValueAtTime(0.3, now);
        gainH.gain.setValueAtTime(0.3, now + 0.1);
        gainH.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        oscH1.connect(gainH);
        oscH2.connect(gainH);
        gainH.connect(ctx.destination);

        oscH1.start(now);
        oscH2.start(now);
        oscH1.stop(now + 0.6);
        oscH2.stop(now + 0.6);
        break;

      case 'sl-1': // Dice roll rattle
        // Rapid succession of small low-passed pops
        for (let i = 0; i < 8; i++) {
          const t = now + i * 0.08 + Math.random() * 0.03;
          const oscR = ctx.createOscillator();
          const gainR = ctx.createGain();
          oscR.type = 'triangle';
          oscR.frequency.setValueAtTime(220 + Math.random() * 100, t);
          gainR.gain.setValueAtTime(0.2, t);
          gainR.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

          oscR.connect(gainR);
          gainR.connect(ctx.destination);
          oscR.start(t);
          oscR.stop(t + 0.08);
        }
        break;

      case 'sl-2': // Ladder climb magic ascend
        const notes = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // E G C E G C magic chord
        notes.forEach((freq, idx) => {
          const t = now + idx * 0.1;
          const oscS = ctx.createOscillator();
          const gainS = ctx.createGain();
          oscS.type = 'sine';
          oscS.frequency.setValueAtTime(freq, t);
          gainS.gain.setValueAtTime(0.15, t);
          gainS.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

          oscS.connect(gainS);
          gainS.connect(ctx.destination);
          oscS.start(t);
          oscS.stop(t + 0.25);
        });
        break;

      case 'sl-3': // Snake hiss
        // White noise high frequency hiss
        const hissBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
        const hissData = hissBuffer.getChannelData(0);
        for (let i = 0; i < hissBuffer.length; i++) {
          hissData[i] = Math.random() * 2 - 1;
        }

        const hissNode = ctx.createBufferSource();
        hissNode.buffer = hissBuffer;

        const hissFilter = ctx.createBiquadFilter();
        hissFilter.type = 'highpass';
        hissFilter.frequency.setValueAtTime(4500, now);
        // Slither sweep down slightly
        hissFilter.frequency.exponentialRampToValueAtTime(2000, now + 0.5);

        const hissGain = ctx.createGain();
        hissGain.gain.setValueAtTime(0.2, now);
        hissGain.gain.linearRampToValueAtTime(0.15, now + 0.2);
        hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        hissNode.connect(hissFilter);
        hissFilter.connect(hissGain);
        hissGain.connect(ctx.destination);

        hissNode.start(now);
        hissNode.stop(now + 0.62);
        break;

      case 'sl-4': // Firework celebration series
        for (let f = 0; f < 4; f++) {
          const fireworkTime = now + f * 0.3;
          // Pop explosion
          const popOsc = ctx.createOscillator();
          const popGain = ctx.createGain();
          popOsc.type = 'sine';
          popOsc.frequency.setValueAtTime(100 + Math.random() * 80, fireworkTime);
          popOsc.frequency.exponentialRampToValueAtTime(10, fireworkTime + 0.15);
          popGain.gain.setValueAtTime(0.4, fireworkTime);
          popGain.gain.exponentialRampToValueAtTime(0.001, fireworkTime + 0.15);
          popOsc.connect(popGain);
          popGain.connect(ctx.destination);
          popOsc.start(fireworkTime);
          popOsc.stop(fireworkTime + 0.2);

          // Crackle sound shortly after
          const crackleDelay = fireworkTime + 0.1;
          for (let c = 0; c < 5; c++) {
            const crackTime = crackleDelay + c * 0.04;
            const crackOsc = ctx.createOscillator();
            const crackGain = ctx.createGain();
            crackOsc.type = 'triangle';
            crackOsc.frequency.setValueAtTime(1500 + Math.random() * 1000, crackTime);
            crackGain.gain.setValueAtTime(0.08, crackTime);
            crackGain.gain.exponentialRampToValueAtTime(0.001, crackTime + 0.03);
            crackOsc.connect(crackGain);
            crackGain.connect(ctx.destination);
            crackOsc.start(crackTime);
            crackOsc.stop(crackTime + 0.04);
          }
        }
        break;

      case 'sys-1': // Attention Airhorn Brass Blast
        const tEnd = now + 0.8;
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const o3 = ctx.createOscillator();
        const finalGain = ctx.createGain();

        o1.type = 'sawtooth';
        o2.type = 'sawtooth';
        o3.type = 'sawtooth';

        o1.frequency.setValueAtTime(220, now); // A3
        o2.frequency.setValueAtTime(222, now); // slightly detuned
        o3.frequency.setValueAtTime(330, now); // E4 (perfect fifth)

        finalGain.gain.setValueAtTime(0, now);
        finalGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        finalGain.gain.linearRampToValueAtTime(0.25, now + 0.2);
        finalGain.gain.exponentialRampToValueAtTime(0.001, tEnd);

        o1.connect(finalGain);
        o2.connect(finalGain);
        o3.connect(finalGain);
        finalGain.connect(ctx.destination);

        o1.start(now);
        o2.start(now);
        o3.start(now);

        o1.stop(tEnd + 0.05);
        o2.stop(tEnd + 0.05);
        o3.stop(tEnd + 0.05);
        break;

      case 'sys-2': // Referee Referee Whistle
        const w1 = ctx.createOscillator();
        const w2 = ctx.createOscillator();
        const gWhistle = ctx.createGain();
        w1.type = 'sine';
        w2.type = 'sine';
        w1.frequency.setValueAtTime(2000, now);
        w2.frequency.setValueAtTime(2050, now); // high pitch beat frequency oscillator

        gWhistle.gain.setValueAtTime(0, now);
        gWhistle.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gWhistle.gain.linearRampToValueAtTime(0.18, now + 0.15);
        gWhistle.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        w1.connect(gWhistle);
        w2.connect(gWhistle);
        gWhistle.connect(ctx.destination);

        w1.start(now);
        w2.start(now);
        w1.stop(now + 0.4);
        w2.stop(now + 0.4);
        break;

      default:
        // Default warm simple chime
        const baseOsc = ctx.createOscillator();
        const baseGain = ctx.createGain();
        baseOsc.type = 'sine';
        baseOsc.frequency.setValueAtTime(440, now); // A4
        baseOsc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        baseGain.gain.setValueAtTime(0.25, now);
        baseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        baseOsc.connect(baseGain);
        baseGain.connect(ctx.destination);
        baseOsc.start(now);
        baseOsc.stop(now + 0.65);
    }
  } catch (error) {
    console.error('Synthesiser error: User must gesture/interact first to enable audio context.', error);
  }
}
