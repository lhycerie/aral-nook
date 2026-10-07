'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface NotebookProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  forceAnimated?: boolean;
  hideTextOnMobile?: boolean;
}

export default function Notebook({
  leftContent,
  rightContent,
  className = '',
  forceAnimated = false,
  hideTextOnMobile = false,
}: NotebookProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(forceAnimated);

  useEffect(() => {
    if (forceAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 50);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHasAnimated(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    const currentEl = containerRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [forceAnimated]);

  // Spring & flip animation curves
  const genshinSpring = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  const genshinFlip = 'cubic-bezier(0.25, 1.4, 0.5, 1)';

  const isCustomContent = Boolean(leftContent || rightContent);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className.includes('max-w-') ? '' : 'max-w-[1060px]'} mx-auto select-none [container-type:inline-size] ${className}`}
      style={{ perspective: '1400px' }}
    >
      {/* Aspect ratio container matching Figma notebook frame (2355 x 1772 -> 75.24%) */}
      <div
        className={`relative w-full pb-[75.24%] drop-shadow-2xl transition-transform duration-1000 ${hasAnimated ? 'animate-genshin-float' : ''
          }`}
      >
        <div className="absolute inset-0">
          {/* ============================================================== */}
          {/* LAYER 1: Book Lock - Figma 33:138                              */}
          {/* ============================================================== */}
          <div
            className="absolute pointer-events-none drop-shadow-lg"
            style={{
              left: '5.48%',
              top: '46.73%',
              width: '13.97%',
              height: '8.35%',
              zIndex: 1,
              transformOrigin: 'right center',
              transform: hasAnimated
                ? 'translateX(0) rotate(0deg) scale(1)'
                : 'translateX(-40px) rotate(-16deg) scale(0.8)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 700ms ${genshinSpring} 0ms, opacity 450ms ease-out 0ms`,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src="/notebook/book-lock.png"
                alt="Book lock"
                fill
                sizes="(max-width: 1440px) 25vw, 350px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* LAYER 2: Book Outer Cover - Figma 17:638                       */}
          {/* ============================================================== */}
          <div
            className="absolute pointer-events-none drop-shadow-2xl"
            style={{
              left: '12.70%',
              top: '16.08%',
              width: '74.44%',
              height: '67.83%',
              zIndex: 2,
              transform: hasAnimated ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(30px)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 700ms ${genshinSpring} 70ms, opacity 500ms ease-out 70ms`,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src="/notebook/book-outer-cover.png"
                alt="Book outer cover"
                fill
                sizes="(max-width: 1440px) 95vw, 1600px"
                className="object-fill"
                priority
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* LAYER 3: Book Cover (Inner) - Figma 17:639                     */}
          {/* ============================================================== */}
          <div
            className="absolute pointer-events-none drop-shadow-md"
            style={{
              left: '14.10%',
              top: '18.45%',
              width: '71.76%',
              height: '63.09%',
              zIndex: 3,
              transform: hasAnimated ? 'scale(1)' : 'scale(0.9)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 650ms ${genshinSpring} 130ms, opacity 450ms ease-out 130ms`,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src="/notebook/book-cover.png"
                alt="Book cover"
                fill
                sizes="(max-width: 1440px) 85vw, 1200px"
                className="object-fill"
                priority
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* LAYER 4: Spine - Figma 27:94                                   */}
          {/* ============================================================== */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '46.96%',
              top: '15.91%',
              width: '5.99%',
              height: '67.78%',
              zIndex: 4,
              transform: hasAnimated ? 'scaleY(1)' : 'scaleY(0.75)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 600ms ${genshinSpring} 190ms, opacity 400ms ease-out 190ms`,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src="/notebook/spine.png"
                alt="Spine"
                fill
                sizes="80px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* LAYER 5: 4 Corner Protectors - Figma 17:644, 752, 726, 739      */}
          {/* ============================================================== */}
          {/* Top Left - Figma 17:644 */}
          <div
            className="absolute pointer-events-none drop-shadow-md"
            style={{
              left: '11.13%',
              top: '14.45%',
              width: '19.75%',
              height: '23.31%',
              zIndex: 5,
              transform: hasAnimated
                ? 'translate(0, 0) scale(1)'
                : 'translate(-24px, -24px) scale(0.7)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 550ms ${genshinSpring} 240ms, opacity 400ms ease-out 240ms`,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src="/notebook/top-left-corner.png"
                alt="Top left corner"
                fill
                sizes="200px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Top Right - Figma 17:752 */}
          <div
            className="absolute pointer-events-none drop-shadow-md"
            style={{
              left: '69.04%',
              top: '14.00%',
              width: '19.75%',
              height: '23.31%',
              zIndex: 5,
              transform: hasAnimated
                ? 'translate(0, 0) scale(1)'
                : 'translate(24px, -24px) scale(0.7)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 550ms ${genshinSpring} 260ms, opacity 400ms ease-out 260ms`,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src="/notebook/top-right-corner.png"
                alt="Top right corner"
                fill
                sizes="200px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Bottom Left - Figma 17:726 */}
          <div
            className="absolute pointer-events-none drop-shadow-md"
            style={{
              left: '11.21%',
              top: '62.87%',
              width: '19.75%',
              height: '23.31%',
              zIndex: 5,
              transform: hasAnimated
                ? 'translate(0, 0) scale(1)'
                : 'translate(-24px, 24px) scale(0.7)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 550ms ${genshinSpring} 280ms, opacity 400ms ease-out 280ms`,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src="/notebook/bottom-left-corner.png"
                alt="Bottom left corner"
                fill
                sizes="200px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Bottom Right - Figma 17:739 */}
          <div
            className="absolute pointer-events-none drop-shadow-md"
            style={{
              left: '68.79%',
              top: '62.87%',
              width: '19.75%',
              height: '23.31%',
              zIndex: 5,
              transform: hasAnimated
                ? 'translate(0, 0) scale(1)'
                : 'translate(24px, 24px) scale(0.7)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 550ms ${genshinSpring} 300ms, opacity 400ms ease-out 300ms`,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src="/notebook/bottom-right-corner.png"
                alt="Bottom right corner"
                fill
                sizes="200px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* LAYER 6: Left Page (Figma 17:699) & Right Page (Figma 17:672)  */}
          {/* ============================================================== */}
          {/* LEFT PAGE - Figma 17:699 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '8.37%',
              top: '22.12%',
              width: '41.58%',
              height: '55.93%',
              zIndex: 10,
              transformOrigin: 'right center',
              transform: hasAnimated
                ? 'rotateY(0deg) scale(1) translateY(0)'
                : 'rotateY(-45deg) scale(0.9) translateY(20px)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 750ms ${genshinFlip} 360ms, opacity 500ms ease-out 360ms`,
            }}
          >
            <div className="relative w-full h-full">
              {/* lpaper page3 - Figma 18:767 */}
              <div
                className="absolute pointer-events-none drop-shadow-sm"
                style={{
                  left: `${((14.73 - 8.37) / 41.58) * 100}%`,
                  top: `${((22.29 - 22.12) / 55.93) * 100}%`,
                  width: `${(33.3 / 41.58) * 100}%`,
                  height: `${(55.76 / 55.93) * 100}%`,
                  zIndex: 1,
                }}
              >
                <Image
                  src="/notebook/lpaper%20page3.png"
                  alt="Left page stack 3"
                  fill
                  sizes="500px"
                  className="object-contain"
                />
              </div>

              {/* lpaper page2 - Figma 18:768 */}
              <div
                className="absolute pointer-events-none drop-shadow-sm"
                style={{
                  left: `${((15.63 - 8.37) / 41.58) * 100}%`,
                  top: `${((22.29 - 22.12) / 55.93) * 100}%`,
                  width: `${(33.3 / 41.58) * 100}%`,
                  height: `${(55.76 / 55.93) * 100}%`,
                  zIndex: 2,
                }}
              >
                <Image
                  src="/notebook/lpaper%20page2.png"
                  alt="Left page stack 2"
                  fill
                  sizes="500px"
                  className="object-contain"
                />
              </div>

              {/* Red Bookmark - Figma 92:156 */}
              <div
                className="absolute pointer-events-none drop-shadow-md"
                style={{
                  left: '0%',
                  top: `${((30.25 - 22.12) / 55.93) * 100}%`,
                  width: `${(20.08 / 41.58) * 100}%`,
                  height: `${(7.91 / 55.93) * 100}%`,
                  zIndex: 3,
                }}
              >
                <Image
                  src="/notebook/red%20bookmark.png"
                  alt="Red bookmark"
                  fill
                  sizes="200px"
                  className="object-contain"
                />
              </div>

              {/* lpaper page1 - Figma 17:700 */}
              <div
                className="absolute pointer-events-none drop-shadow-md"
                style={{
                  left: `${((16.65 - 8.37) / 41.58) * 100}%`,
                  top: '0%',
                  width: `${(33.3 / 41.58) * 100}%`,
                  height: '100%',
                  zIndex: 4,
                }}
              >
                <Image
                  src="/notebook/lpaper%20page1.png"
                  alt="Left page paper"
                  fill
                  sizes="500px"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Grid - Figma 17:701 */}
              <div
                className="absolute pointer-events-none mix-blend-multiply opacity-80"
                style={{
                  left: `${((18.66 - 8.37) / 41.58) * 100}%`,
                  top: `${((24.96 - 22.12) / 55.93) * 100}%`,
                  width: `${(29.43 / 41.58) * 100}%`,
                  height: `${(50.19 / 55.93) * 100}%`,
                  zIndex: 5,
                }}
              >
                <Image
                  src="/notebook/paper-grid.png"
                  alt="Paper grid"
                  fill
                  sizes="450px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* RIGHT PAGE - Figma 17:672 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '49.95%',
              top: '22.12%',
              width: '42.57%',
              height: '55.93%',
              zIndex: 10,
              transformOrigin: 'left center',
              transform: hasAnimated
                ? 'rotateY(0deg) scale(1) translateY(0)'
                : 'rotateY(45deg) scale(0.9) translateY(20px)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 750ms ${genshinFlip} 400ms, opacity 500ms ease-out 400ms`,
            }}
          >
            <div className="relative w-full h-full">
              {/* rpaper page3 - Figma 18:766 */}
              <div
                className="absolute pointer-events-none drop-shadow-sm"
                style={{
                  left: `${((51.8 - 49.95) / 42.57) * 100}%`,
                  top: `${((22.29 - 22.12) / 55.93) * 100}%`,
                  width: `${(33.3 / 42.57) * 100}%`,
                  height: `${(55.76 / 55.93) * 100}%`,
                  zIndex: 1,
                }}
              >
                <Image
                  src="/notebook/rpaper%20page3.png"
                  alt="Right page stack 3"
                  fill
                  sizes="500px"
                  className="object-contain"
                />
              </div>

              {/* Yellow Bookmark - Figma 92:155 (Behind 2nd page) */}
              <div
                className="absolute pointer-events-none drop-shadow-md"
                style={{
                  left: `${((70.23 - 49.95) / 42.57) * 100}%`,
                  top: `${((49.15 - 22.12) / 55.93) * 100}%`,
                  width: `${(20.08 / 42.57) * 100}%`,
                  height: `${(7.91 / 55.93) * 100}%`,
                  zIndex: 1,
                }}
              >
                <Image
                  src="/notebook/yellow%20bookmark.png"
                  alt="Yellow bookmark"
                  fill
                  sizes="200px"
                  className="object-contain"
                />
              </div>

              {/* rpaper page2 - Figma 18:765 */}
              <div
                className="absolute pointer-events-none drop-shadow-sm"
                style={{
                  left: `${((50.91 - 49.95) / 42.57) * 100}%`,
                  top: `${((22.29 - 22.12) / 55.93) * 100}%`,
                  width: `${(33.3 / 42.57) * 100}%`,
                  height: `${(55.76 / 55.93) * 100}%`,
                  zIndex: 2,
                }}
              >
                <Image
                  src="/notebook/rpaper%20page2.png"
                  alt="Right page stack 2"
                  fill
                  sizes="500px"
                  className="object-contain"
                />
              </div>

              {/* Green Bookmark - Figma 92:152 */}
              <div
                className="absolute pointer-events-none drop-shadow-md"
                style={{
                  left: `${((72.44 - 49.95) / 42.57) * 100}%`,
                  top: `${((28.05 - 22.12) / 55.93) * 100}%`,
                  width: `${(20.08 / 42.57) * 100}%`,
                  height: `${(7.91 / 55.93) * 100}%`,
                  zIndex: 3,
                }}
              >
                <Image
                  src="/notebook/green%20bookmark.png"
                  alt="Green bookmark"
                  fill
                  sizes="200px"
                  className="object-contain"
                />
              </div>

              {/* Blue Bookmark - Figma 92:154 */}
              <div
                className="absolute pointer-events-none drop-shadow-md"
                style={{
                  left: `${((70.23 - 49.95) / 42.57) * 100}%`,
                  top: `${((33.58 - 22.12) / 55.93) * 100}%`,
                  width: `${(20.08 / 42.57) * 100}%`,
                  height: `${(7.91 / 55.93) * 100}%`,
                  zIndex: 3,
                }}
              >
                <Image
                  src="/notebook/blue%20bookmark.png"
                  alt="Blue bookmark"
                  fill
                  sizes="200px"
                  className="object-contain"
                />
              </div>

              {/* rpaper page1 - Figma 17:673 */}
              <div
                className="absolute pointer-events-none drop-shadow-md"
                style={{
                  left: '0%',
                  top: '0%',
                  width: `${(33.3 / 42.57) * 100}%`,
                  height: '100%',
                  zIndex: 4,
                }}
              >
                <Image
                  src="/notebook/rpaper%20page1.png"
                  alt="Right page paper"
                  fill
                  sizes="500px"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Grid - Figma 17:674 */}
              <div
                className="absolute pointer-events-none mix-blend-multiply opacity-80"
                style={{
                  left: `${((51.96 - 49.95) / 42.57) * 100}%`,
                  top: `${((24.9 - 22.12) / 55.93) * 100}%`,
                  width: `${(29.43 / 42.57) * 100}%`,
                  height: `${(50.19 / 55.93) * 100}%`,
                  zIndex: 5,
                }}
              >
                <Image
                  src="/notebook/paper-grid.png"
                  alt="Paper grid"
                  fill
                  sizes="450px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* LAYER 7: Ringbind - Figma 24:79                                */}
          {/* ============================================================== */}
          <div
            className="absolute pointer-events-none drop-shadow-lg"
            style={{
              left: '45.61%',
              top: '26.92%',
              width: '8.75%',
              height: '46.17%',
              zIndex: 20,
              transform: hasAnimated ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(1.15)',
              opacity: hasAnimated ? 1 : 0,
              transition: `transform 650ms ${genshinSpring} 480ms, opacity 450ms ease-out 480ms`,
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src="/notebook/ringbind.png"
                alt="Ringbind"
                fill
                sizes="150px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* LAYER 8: Content & Decorative Elements                         */}
          {/* ============================================================== */}
          {isCustomContent ? (
            /* Custom slots (e.g. PlaceDetailModal dossier) */
            <>
              {leftContent && (
                <div
                  className="absolute overflow-hidden flex flex-col pointer-events-auto"
                  style={{
                    left: '18.66%',
                    top: '25.0%',
                    width: '27.5%',
                    height: '50.0%',
                    zIndex: 22,
                    opacity: hasAnimated ? 1 : 0,
                    transition: 'opacity 500ms ease-out 520ms',
                  }}
                >
                  {leftContent}
                </div>
              )}
              {rightContent && (
                <div
                  className="absolute overflow-hidden flex flex-col pointer-events-auto"
                  style={{
                    left: '52.0%',
                    top: '25.0%',
                    width: '27.5%',
                    height: '50.0%',
                    zIndex: 22,
                    opacity: hasAnimated ? 1 : 0,
                    transition: 'opacity 500ms ease-out 580ms',
                  }}
                >
                  {rightContent}
                </div>
              )}
            </>
          ) : (
            /* 13 Exact Figma Designs */
            <>
              {/* Node 7: Stamp - Figma 100:97 */}
              <div
                className="absolute pointer-events-none drop-shadow-sm"
                style={{
                  left: '34.63%',
                  top: '24.77%',
                  width: '11.23%',
                  height: '15.18%',
                  zIndex: 15,
                  transform: hasAnimated ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-8deg)',
                  opacity: hasAnimated ? 1 : 0,
                  transition: `transform 650ms ${genshinSpring} 500ms, opacity 450ms ease-out 500ms`,
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/notebook/stamp.png"
                    alt="Mushroom stamp"
                    fill
                    sizes="180px"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Node 10: Letter - Figma 91:151 */}
              <div
                className="absolute pointer-events-none drop-shadow-xl"
                style={{
                  left: '12.65%',
                  top: '50.5%',
                  width: '23.63%',
                  height: '38.21%',
                  zIndex: 25,
                  transform: hasAnimated ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(30px)',
                  opacity: hasAnimated ? 1 : 0,
                  transition: `transform 700ms ${genshinSpring} 540ms, opacity 450ms ease-out 540ms`,
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/notebook/letter.png"
                    alt="Postcard letter from lhycerie"
                    fill
                    sizes="400px"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Node 5: Leaves - Figma 100:100 */}
              <div
                className="absolute pointer-events-none drop-shadow-md"
                style={{
                  left: '31.04%',
                  top: '56.43%',
                  width: '15.93%',
                  height: '20.55%',
                  zIndex: 26,
                  transform: hasAnimated ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(15deg)',
                  opacity: hasAnimated ? 1 : 0,
                  transition: `transform 600ms ${genshinSpring} 580ms, opacity 400ms ease-out 580ms`,
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/notebook/leaves.png"
                    alt="Autumn leaf"
                    fill
                    sizes="250px"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Node 8: Title "aralnook" - Figma 100:112 */}
              <div
                className={`absolute pointer-events-none items-center ${hideTextOnMobile ? 'hidden md:flex' : 'flex'}`}
                style={{
                  left: '19.58%',
                  top: '26.35%',
                  width: '23.65%',
                  height: '4.46%',
                  zIndex: 18,
                  opacity: hasAnimated ? 1 : 0,
                  transition: 'opacity 500ms ease-out 480ms',
                }}
              >
                <h2 className="font-[family-name:var(--font-patrick)] text-[#583A23] text-[clamp(22px,2.37cqw,36px)] leading-none tracking-tight">
                  aralnook
                </h2>
              </div>

              {/* Node 3: Text 1 - Figma 100:113 */}
              <div
                className={`absolute pointer-events-none ${hideTextOnMobile ? 'hidden md:block' : ''}`}
                style={{
                  left: '19.58%',
                  top: '31.72%',
                  width: '15.41%',
                  height: '8.92%',
                  zIndex: 18,
                  opacity: hasAnimated ? 1 : 0,
                  transition: 'opacity 500ms ease-out 520ms',
                }}
              >
                <p className="font-[family-name:var(--font-playpen)] text-[#583A23] text-[clamp(13px,0.85cqw,18px)] leading-[1.55] text-justify">
                  can find cafes, libraries, study spaces within your 400 meters radius ^_^
                </p>
              </div>

              {/* Node 1: Text 2 - Figma 100:114 */}
              <div
                className={`absolute pointer-events-none ${hideTextOnMobile ? 'hidden md:block' : ''}`}
                style={{
                  left: '19.62%',
                  top: '40.86%',
                  width: '23.65%',
                  height: '8.92%',
                  zIndex: 18,
                  opacity: hasAnimated ? 1 : 0,
                  transition: 'opacity 500ms ease-out 540ms',
                }}
              >
                <p className="font-[family-name:var(--font-playpen)] text-[#583A23] text-[clamp(13px,0.85cqw,18px)] leading-[1.55] text-justify">
                  which is considered walking distance (Silitonga, 2020) and allows user to see
                  details about the place to help them decide in where they wanna go.
                </p>
              </div>

              {/* Node 2: Text 3 - Figma 101:115 */}
              <div
                className={`absolute pointer-events-none text-right flex-col justify-start ${hideTextOnMobile ? 'hidden md:flex' : 'flex'}`}
                style={{
                  left: '28.62%',
                  top: '50.11%',
                  width: '15.41%',
                  height: '8.92%',
                  zIndex: 18,
                  opacity: hasAnimated ? 1 : 0,
                  transition: 'opacity 500ms ease-out 560ms',
                }}
              >
                <p className="font-[family-name:var(--font-playpen)] text-[#583A23] text-[clamp(13px,0.85cqw,13px)] leading-[1.55] whitespace-pre-line">
                  {`  
                 thankiees for
                 visiting! <33`}
                </p>
              </div>

              {/* Node 4: Title "how did aralnook start?" - Figma 100:102 */}
              <div
                className={`absolute pointer-events-none items-center ${hideTextOnMobile ? 'hidden md:flex' : 'flex'}`}
                style={{
                  left: '55.97%',
                  top: '26.69%',
                  width: '26%',
                  height: '4.46%',
                  zIndex: 18,
                  opacity: hasAnimated ? 1 : 0,
                  transition: 'opacity 500ms ease-out 500ms',
                }}
              >
                <h2 className="font-[family-name:var(--font-patrick)] text-[#583A23] text-[clamp(18px,1.5cqw,28px)] leading-none tracking-tight">
                  how did aralnook start?
                </h2>
              </div>

              {/* Node 9: Story Text - Figma 100:103 */}
              <div
                className={`absolute pointer-events-none ${hideTextOnMobile ? 'hidden md:block' : ''}`}
                style={{
                  left: '55.97%',
                  top: '31.04%',
                  width: '24.59%',
                  height: '23.19%',
                  zIndex: 18,
                  opacity: hasAnimated ? 1 : 0,
                  transition: 'opacity 500ms ease-out 540ms',
                }}
              >
                <p className="font-[family-name:var(--font-playpen)] text-[#583A23] text-[clamp(13px,0.85cqw,18px)] leading-[1.55] text-justify indent-6 sm:indent-8">
                  it was 11pm at night and i was reviewing for an exam. i noticed how there&apos;s
                  literally little to none spaces near my place where i could&apos;ve invited my
                  friends to study or hang out together. i set up this site to look for those places
                  within walking distance as i value accessibility and worth-visiting cozy spots.
                </p>
              </div>

              {/* Node 12: Picture Manila - Figma 91:149 */}
              <div
                className="absolute pointer-events-none drop-shadow-xl"
                style={{
                  left: '57.54%',
                  top: '52.93%',
                  width: '25.84%',
                  height: '26.26%',
                  zIndex: 16,
                  transform: hasAnimated ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(25px)',
                  opacity: hasAnimated ? 1 : 0,
                  transition: `transform 700ms ${genshinSpring} 580ms, opacity 450ms ease-out 580ms`,
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/notebook/picture%20manila.png"
                    alt="Manila study heritage"
                    fill
                    sizes="450px"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Node 6: Circle Stamps - Figma 100:57 */}
              <div
                className="absolute pointer-events-none mix-blend-multiply opacity-85"
                style={{
                  left: '53.72%',
                  top: '57.22%',
                  width: '11.00%',
                  height: '14.62%',
                  zIndex: 17,
                  transform: hasAnimated ? 'scale(1)' : 'scale(0.7)',
                  opacity: hasAnimated ? 0.85 : 0,
                  transition: `transform 600ms ${genshinSpring} 620ms, opacity 400ms ease-out 620ms`,
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/notebook/circle%20stamps.png"
                    alt="Postal stamp mark"
                    fill
                    sizes="180px"
                    className="object-contain"
                  />
                </div>
              </div>
            </>
          )}

          {/* ============================================================== */}
          {/* LAYER 9: Grain FX - Figma 47:2                                 */}
          {/* ============================================================== */}
          <div
            className="absolute pointer-events-none mix-blend-multiply"
            style={{
              left: '17.62%',
              top: '22.12%',
              width: '66.88%',
              height: '55.93%',
              zIndex: 30,
              opacity: hasAnimated ? 0.25 : 0,
              transition: 'opacity 800ms ease-in-out 640ms',
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src="/notebook/grain-fx.png"
                alt="Grain effect"
                fill
                sizes="(max-width: 1440px) 80vw, 1100px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
