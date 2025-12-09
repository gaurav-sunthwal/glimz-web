"use client"

import { useState, useEffect, useRef } from 'react';
import { Play, Info, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade, Keyboard } from 'swiper/modules';

export const HeroBanner = ({ video, videos, onPlay, onMoreInfo }) => {
  const [imageLoaded, setImageLoaded] = useState({});
  const [isMuted, setIsMuted] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [cachedVideos, setCachedVideos] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const swiperRef = useRef(null);

  // Session Storage & Data Management
  useEffect(() => {
    if (videos && videos.length > 0) {
      sessionStorage.setItem('hero_videos', JSON.stringify(videos));
    }
  }, [videos]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('hero_videos');
      if (cached) {
        try {
          setCachedVideos(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to parse hero_videos", e);
        }
      }
    }
  }, []);

  const resolvedVideos = (videos && videos.length > 0) ? videos : (cachedVideos.length > 0 ? cachedVideos : (video ? [video] : []));
  const videoList = resolvedVideos;
  const currentVideo = videoList[currentSlide] || videoList[0];

  // Parallax Effect
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!currentVideo) return null;

  const handleImageLoad = (index) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  };

  const getHeroSrc = (v) => {
    if (!v) return '/api/placeholder/1920/1080';
    return (
      v.heroImage || v.heroimage || v.thumbnail || v.thimainel || v.thumb || v.poster || v.image || '/api/placeholder/1920/1080'
    );
  };

  return (
    <section
      className="relative w-full overflow-hidden h-[60vh] xs:h-[65vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh] xl:h-[85vh] min-h-[340px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[520px]"
    >
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Pagination, Navigation, EffectFade, Keyboard]}
        effect="fade"
        speed={800}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: false,
        }}
        navigation={videoList.length > 1}
        keyboard={{
          enabled: true,
        }}
        loop={videoList.length > 1}
        onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
        className="hero-swiper h-full w-full"
      >
        {videoList.map((videoItem, index) => (
          <SwiperSlide key={videoItem.id || index}>
            {/* Background Image with Parallax */}
            <div className="absolute inset-0 overflow-hidden">
              {!imageLoaded[index] && (
                <div className="absolute inset-0 bg-background-secondary animate-pulse" />
              )}
              <div
                className="relative w-full h-[120%] -top-[10%]"
                style={{
                  transform: `translateY(${scrollY * 0.4}px)`,
                  willChange: 'transform'
                }}
              >
                <NextImage
                  src={getHeroSrc(videoItem)}
                  alt={videoItem.title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={`
                    object-cover object-top transition-opacity duration-700 w-full h-full
                    ${imageLoaded[index] ? 'opacity-100' : 'opacity-0'}
                  `}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageLoad(index)}
                  draggable={false}
                  unoptimized
                />
              </div>

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div
              className="
                relative z-10
                w-full
                h-full
                flex items-center
                px-3 xs:px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24
                max-w-full
              "
            >
              <div
                className="
                  w-full
                  max-w-full
                  sm:max-w-2xl
                  md:max-w-3xl
                  lg:max-w-4xl
                  xl:max-w-5xl
                  space-y-3 xs:space-y-4 sm:space-y-6
                "
              >
                {/* Title */}
                <div className="space-y-1 xs:space-y-2 sm:space-y-3">
                  <h1
                    className="
                      text-2xl xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl
                      font-bold text-white leading-tight
                      break-words
                      max-w-full
                    "
                    style={{ wordBreak: 'break-word' }}
                  >
                    {videoItem.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-1 xs:gap-2 sm:gap-3 md:gap-4 text-white/80">
                    <span className="text-sm xs:text-base sm:text-lg font-medium">{videoItem.releaseYear}</span>
                    {videoItem.rating && (
                      <span className="px-2 py-1 bg-white/20 rounded text-xs xs:text-sm font-medium">
                        {videoItem.rating}
                      </span>
                    )}
                    {videoItem.duration && videoItem.duration !== 'N/A' && (
                      <span className="text-sm xs:text-base sm:text-lg">{videoItem.duration}</span>
                    )}
                    {videoItem.genre && videoItem.genre.length > 0 && (
                      <div className="flex gap-1 xs:gap-2">
                        {videoItem.genre.slice(0, 2).map((genre) => (
                          <span key={genre} className="genre-tag text-xs xs:text-sm">
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="max-w-full sm:max-w-xl md:max-w-2xl">
                  <p
                    className={`
                      text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl
                      text-white/90 leading-relaxed
                      break-words
                    `}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {(() => {
                      const full = videoItem.description || '';
                      const short = videoItem.shortDescription || (full.length > 120 ? full.slice(0, 120) + '...' : full);
                      return descExpanded ? full : short;
                    })()}
                  </p>

                  {(videoItem.description && (videoItem.shortDescription || videoItem.description.length > 220)) && (
                    <button
                      onClick={() => setDescExpanded((s) => !s)}
                      className="mt-2 text-sm text-white/80 underline underline-offset-2"
                      aria-expanded={descExpanded}
                    >
                      {descExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row items-center gap-2 xs:gap-3 sm:gap-4 w-full">
                  <Button
                    onClick={() => router.push(`/video/${videoItem.id}`)}
                    className="
                      btn-glimz-primary
                      text-xs xs:text-sm sm:text-base
                      px-3 xs:px-4 sm:px-5
                      py-2
                      shadow-glow
                      flex items-center justify-center
                      min-w-[110px]
                    "
                  >
                    <Play className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 mr-2 fill-current" />
                    Watch Now
                  </Button>

                  <Button
                    onClick={() => onMoreInfo?.(videoItem.id)}
                    className="
                      btn-glimz-secondary
                      text-xs xs:text-sm sm:text-base
                      px-3 xs:px-4 sm:px-5
                      py-2
                      flex items-center justify-center
                      min-w-[110px]
                    "
                  >
                    <Info className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 mr-2" />
                    More Info
                  </Button>
                </div>

                {/* Audio Control */}
                <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="
                      p-2 xs:p-2.5 sm:p-3
                      rounded-full
                      bg-white/10
                      backdrop-blur-sm
                      border border-white/20
                      hover:bg-white/20
                      flex items-center justify-center
                    "
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                    ) : (
                      <Volume2 className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                    )}
                  </Button>
                  <span className="text-white/60 text-xs xs:text-sm">
                    {isMuted ? 'Unmute' : 'Mute'}
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      {videoList.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (swiperRef.current && swiperRef.current.swiper) {
                swiperRef.current.swiper.slidePrev();
              }
            }}
            className="
              absolute
              left-4 sm:left-6 md:left-8 lg:left-3
              top-1/2
              -translate-y-1/2
              z-20
              p-2 sm:p-3 md:p-4
              rounded-full
              bg-white/10
              backdrop-blur-sm
              border border-white/30
              hover:bg-white/20
              hover:border-white/50
              transition-all duration-300
              group
              flex items-center justify-center
              cursor-pointer
            "
            aria-label="Previous slide"
            type="button"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (swiperRef.current && swiperRef.current.swiper) {
                swiperRef.current.swiper.slideNext();
              }
            }}
            className="
              absolute
              right-4 sm:right-6 md:right-8 lg:right-3
              top-1/2
              -translate-y-1/2
              z-20
              p-2 sm:p-3 md:p-4
              rounded-full
              bg-white/10
              backdrop-blur-sm
              border border-white/30
              hover:bg-white/20
              hover:border-white/50
              transition-all duration-300
              group
              flex items-center justify-center
              cursor-pointer
            "
            aria-label="Next slide"
            type="button"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Custom Swiper Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Swiper Base Styles */
        .swiper {
          margin-left: auto;
          margin-right: auto;
          position: relative;
          overflow: hidden;
          list-style: none;
          padding: 0;
          z-index: 1;
        }

        .swiper-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 1;
          display: flex;
          transition-property: transform;
          box-sizing: content-box;
        }

        .swiper-slide {
          flex-shrink: 0;
          width: 100%;
          height: 100%;
          position: relative;
          transition-property: transform;
        }

        .swiper-fade .swiper-slide {
          pointer-events: none;
          transition-property: opacity;
        }

        .swiper-fade .swiper-slide-active {
          pointer-events: auto;
        }

        /* Hero Swiper Specific */
        .hero-swiper {
          width: 100%;
          height: 100%;
        }

        .hero-swiper .swiper-pagination {
          bottom: 2rem !important;
        }

        .hero-swiper .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.4);
          opacity: 1;
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .hero-swiper .swiper-pagination-bullet-active {
          width: 40px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }

        .hero-swiper .swiper-button-next,
        .hero-swiper .swiper-button-prev {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .hero-swiper .swiper-button-next:hover,
        .hero-swiper .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }

        .hero-swiper .swiper-button-next::after,
        .hero-swiper .swiper-button-prev::after {
          font-size: 20px;
          color: white;
          font-weight: bold;
        }

        @media (max-width: 640px) {
          .hero-swiper .swiper-button-next,
          .hero-swiper .swiper-button-prev {
            width: 40px;
            height: 40px;
          }

          .hero-swiper .swiper-button-next::after,
          .hero-swiper .swiper-button-prev::after {
            font-size: 16px;
          }

          .hero-swiper .swiper-pagination {
            bottom: 1rem !important;
          }

          .hero-swiper .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
          }

          .hero-swiper .swiper-pagination-bullet-active {
            width: 24px;
          }
        }
      `}} />
    </section>
  );
};
