'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LogoSplash() {
  const [visible, setVisible] = useState(true);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 2800);
    const t3 = setTimeout(() => setVisible(false), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (!visible) return null;

  const spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  const flip = 'cubic-bezier(0.25, 1.4, 0.5, 1)';

  // All coordinates are % of the 2048×2048 logo canvas
  // Derived via OpenCV template matching on the actual logo.png
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FFF2E1] transition-opacity duration-700"
      style={{ opacity: stage === 2 ? 0 : 1 }}
    >
      {/* Square canvas matching the 2048×2048 logo */}
      <div className="relative w-[min(90vw,90vh)] aspect-square">

        {/* ── LAYER 1: Letter base (aral + n + k) ── */}

        {/* aral.png  x=109 y=208  → 5.32% / 10.16%  1786×1033 */}
        <div className="absolute" style={{
          left: '5.32%', top: '10.16%', width: '87.21%', height: '50.44%',
          zIndex: 10,
          transform: stage > 0 ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.85)',
          opacity: stage > 0 ? 1 : 0,
          transition: `transform 700ms ${spring} 80ms, opacity 400ms ease 80ms`,
        }}>
          <Image src="/assets/aral.png" alt="aral" fill className="object-contain" priority />
        </div>

        {/* n.png  x=132 y=1006  → 6.45% / 49.12%  550×620 */}
        <div className="absolute" style={{
          left: '6.45%', top: '49.12%', width: '26.86%', height: '30.27%',
          zIndex: 10,
          transform: stage > 0 ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.85)',
          opacity: stage > 0 ? 1 : 0,
          transition: `transform 700ms ${spring} 160ms, opacity 400ms ease 160ms`,
        }}>
          <Image src="/assets/n.png" alt="n" fill className="object-contain" priority />
        </div>

        {/* k.png  x=1392 y=940  → 67.97% / 45.90%  500×650 */}
        <div className="absolute" style={{
          left: '68.97%', top: '45.90%', width: '24.41%', height: '31.74%',
          zIndex: 45,
          transform: stage > 0 ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.85)',
          opacity: stage > 0 ? 1 : 0,
          transition: `transform 700ms ${spring} 240ms, opacity 400ms ease 240ms`,
        }}>
          <Image src="/assets/k.png" alt="k" fill className="object-contain" priority />
        </div>

        {/* ── LAYER 2: Pencil (sits between 'o's and 'k', behind glasses) ── */}

        {/* pencil.png — between right 'o' and 'k', pointing diagonally down-right */}
        <div className="absolute" style={{
          left: '55%', top: '46%', width: '26.56%', height: '26.56%',
          zIndex: 35,
          transform: stage > 0 ? 'rotate(0deg) scale(1)' : 'rotate(20deg) scale(0.6)',
          opacity: stage > 0 ? 1 : 0,
          transition: `transform 800ms ${spring} 350ms, opacity 400ms ease 350ms`,
        }}>
          <Image src="/assets/pencil.png" alt="pencil" fill className="object-contain" priority />
        </div>

        {/* ── LAYER 3: Eye circles (the two 'o's in 'nook') ── */}

        {/* left eye.png  x=594 y=1054  → 29.00% / 51.46%  508×508 */}
        <div className="absolute" style={{
          left: '29.00%', top: '51.46%', width: '24.80%', height: '24.80%',
          zIndex: 30,
          transform: stage > 0 ? 'scale(1)' : 'scale(0.2)',
          opacity: stage > 0 ? 1 : 0,
          transition: `transform 600ms ${spring} 420ms, opacity 300ms ease 420ms`,
        }}>
          <Image src="/assets/left eye.png" alt="left eye" fill className="object-contain" priority />
        </div>

        {/* right eye — mirrored: left eye ends at 29+24.8=53.8%, so right eye starts ~51% to overlap slightly */}
        <div className="absolute" style={{
          left: '48.00%', top: '49.46%', width: '24.80%', height: '24.80%',
          zIndex: 30,
          transform: stage > 0 ? 'scale(1)' : 'scale(0.2)',
          opacity: stage > 0 ? 1 : 0,
          transition: `transform 600ms ${spring} 490ms, opacity 300ms ease 490ms`,
        }}>
          <Image src="/assets/right eye.png" alt="right eye" fill className="object-contain" priority />
        </div>

        {/* ── LAYER 4: Pupils (blink!) ── */}

        {/* left pupil  x=701 y=1265  → 34.23% / 61.77%  76×105 */}
        <div className="absolute animate-blink" style={{
          left: '34.23%', top: '61.77%', width: '3.71%', height: '5.13%',
          zIndex: 35,
          opacity: stage > 0 ? 1 : 0,
          transition: `opacity 300ms ease 580ms`,
        }}>
          <Image src="/assets/left eyes.png" alt="left pupil" fill className="object-contain" priority />
        </div>

        {/* right pupil  x=1104 y=1215  → 53.91% / 59.33%  76×105 */}
        <div className="absolute animate-blink" style={{
          left: '53.91%', top: '59.33%', width: '3.71%', height: '5.13%',
          zIndex: 35,
          opacity: stage > 0 ? 1 : 0,
          transition: `opacity 300ms ease 580ms`,
        }}>
          <Image src="/assets/right eyes.png" alt="right pupil" fill className="object-contain" priority />
        </div>

        {/* ── LAYER 5: Glasses (on top of eye circles) ── */}

        {/* GLASSES.png  x=617 y=1075  → 30.13% / 52.49%  839×404 */}
        <div className="absolute" style={{
          left: '31%', top: '52.49%', width: '40.97%', height: '19.73%',
          zIndex: 40,
          transform: stage > 0 ? 'scale(1) translateY(0)' : 'scale(1.3) translateY(-20px)',
          opacity: stage > 0 ? 1 : 0,
          transition: `transform 650ms ${flip} 650ms, opacity 400ms ease 650ms`,
        }}>
          <Image src="/assets/GLASSES.png" alt="glasses" fill className="object-contain" priority />
        </div>

        {/* ── LAYER 6: Lips / smile ── */}

        {/* lips — below the glasses, centered between the two 'o's */}
        <div className="absolute" style={{
          left: '42.3%', top: '72%', width: '15.19%', height: '5.18%',
          zIndex: 45,
          transform: stage > 0 ? 'scale(1)' : 'scale(0)',
          opacity: stage > 0 ? 1 : 0,
          transition: `transform 500ms ${spring} 800ms, opacity 300ms ease 800ms`,
        }}>
          <Image src="/assets/lips.png" alt="smile" fill className="object-contain" priority />
        </div>

      </div>
    </div>
  );
}
