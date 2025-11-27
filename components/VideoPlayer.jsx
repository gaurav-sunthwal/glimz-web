"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  X, 
  RotateCcw,
  SkipBack,
  SkipForward,
  Loader2,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  Check,
  Monitor,
  Zap,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Network speed detection utility
const detectNetworkSpeed = async () => {
  return new Promise((resolve) => {
    // Use Network Information API if available
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        
        // Map effectiveType to quality
        const speedMap = {
          'slow-2g': { speed: 'slow', quality: '360p', mbps: 0.5 },
          '2g': { speed: 'slow', quality: '360p', mbps: 0.5 },
          '3g': { speed: 'medium', quality: '480p', mbps: 1.5 },
          '4g': { speed: 'fast', quality: '720p', mbps: 10 },
        };
        
        const networkInfo = speedMap[effectiveType] || { speed: 'fast', quality: '720p', mbps: downlink || 10 };
        resolve({
          speed: networkInfo.speed,
          recommendedQuality: networkInfo.quality,
          mbps: networkInfo.mbps,
          effectiveType
        });
        return;
      }
    }
    
    // Fallback: Test with a small image
    const testImage = new Image();
    const startTime = Date.now();
    testImage.onload = () => {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      // Approximate size in bytes (1KB test)
      const sizeInBytes = 1024;
      const speedMbps = (sizeInBytes * 8) / (duration * 1000000);
      
      let recommendedQuality = '720p';
      let speed = 'fast';
      
      if (speedMbps < 1) {
        recommendedQuality = '360p';
        speed = 'slow';
      } else if (speedMbps < 3) {
        recommendedQuality = '480p';
        speed = 'medium';
      } else if (speedMbps < 8) {
        recommendedQuality = '720p';
        speed = 'medium';
      } else {
        recommendedQuality = '1080p';
        speed = 'fast';
      }
      
      resolve({
        speed,
        recommendedQuality,
        mbps: speedMbps,
        effectiveType: 'unknown'
      });
    };
    
    testImage.onerror = () => {
      // Default to medium quality if test fails
      resolve({
        speed: 'medium',
        recommendedQuality: '720p',
        mbps: 5,
        effectiveType: 'unknown'
      });
    };
    
    // Use a small transparent pixel with cache busting
    testImage.src = `data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7?t=${Date.now()}`;
  });
};

const VideoPlayer = ({ 
  video, 
  onClose, 
  autoPlay = false,
  isFullscreen = false,
  onFullscreenChange 
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const networkSpeedRef = useRef(null);
  const qualityChangeTimeoutRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const lastQualityRef = useRef(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [networkSpeed, setNetworkSpeed] = useState(null);
  const [isChangingQuality, setIsChangingQuality] = useState(false);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoQuality, setVideoQuality] = useState('auto');
  const [userSelectedQuality, setUserSelectedQuality] = useState(null); // null means auto
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [subtitleLanguage, setSubtitleLanguage] = useState('en');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Security state
  const [securityWarning, setSecurityWarning] = useState(false);
  const [rightClickDisabled, setRightClickDisabled] = useState(false);
  const [devToolsWarning, setDevToolsWarning] = useState(false);
  
  // Context menu state
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isLooping, setIsLooping] = useState(false);
  
  // Volume status bar
  const [showVolumeStatus, setShowVolumeStatus] = useState(false);
  const [volumeStatusTimeout, setVolumeStatusTimeout] = useState(null);
  
  // YouTube-style panels
  const [showSpeedPanel, setShowSpeedPanel] = useState(false);
  const [showQualityPanel, setShowQualityPanel] = useState(false);
  const [showSubtitlePanel, setShowSubtitlePanel] = useState(false);
  
  // Extract available qualities from video variants
  const availableQualities = useMemo(() => {
    if (!video?.video?.variants) {
      return [{ value: 'auto', label: 'Auto' }];
    }
    
    const variants = video.video.variants;
    const qualityOrder = ['1080p', '720p', '480p', '360p', '240p'];
    const qualities = [{ value: 'auto', label: 'Auto' }];
    
    qualityOrder.forEach(quality => {
      if (variants[quality]) {
        qualities.push({ value: quality, label: quality });
      }
    });
    
    // Add any other variants not in the standard list
    Object.keys(variants).forEach(key => {
      if (key !== 'auto' && !qualityOrder.includes(key) && !qualities.find(q => q.value === key)) {
        qualities.push({ value: key, label: key });
      }
    });
    
    return qualities;
  }, [video?.video?.variants]);
  
  // Get current video URL based on quality selection
  const getVideoUrl = useCallback((quality) => {
    if (!video?.video?.variants) return video?.videoUrl || '';
    
    const variants = video.video.variants;
    
    if (quality === 'auto' || !quality) {
      // Auto mode: use network speed recommendation or fallback
      if (networkSpeedRef.current?.recommendedQuality && variants[networkSpeedRef.current.recommendedQuality]) {
        return variants[networkSpeedRef.current.recommendedQuality];
      }
      // Fallback order
      return variants.auto || variants['720p'] || variants['480p'] || variants['360p'] || Object.values(variants)[0] || '';
    }
    
    return variants[quality] || variants.auto || video?.videoUrl || '';
  }, [video]);
  
  // Detect network speed on mount
  useEffect(() => {
    const checkNetworkSpeed = async () => {
      const speedInfo = await detectNetworkSpeed();
      networkSpeedRef.current = speedInfo;
      setNetworkSpeed(speedInfo);
      
      // Auto-select quality if user hasn't manually selected
      if (!userSelectedQuality && video?.video?.variants) {
        const recommended = speedInfo.recommendedQuality;
        if (video.video.variants[recommended]) {
          setVideoQuality(recommended);
        }
      }
    };
    
    checkNetworkSpeed();
    
    // Monitor network changes
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const handleConnectionChange = async () => {
          const speedInfo = await detectNetworkSpeed();
          networkSpeedRef.current = speedInfo;
          setNetworkSpeed(speedInfo);
          
          // Auto-adjust quality if in auto mode
          if (!userSelectedQuality && video?.video?.variants) {
            const recommended = speedInfo.recommendedQuality;
            if (video.video.variants[recommended] && videoQuality !== recommended) {
              setVideoQuality(recommended);
            }
          }
        };
        
        connection.addEventListener('change', handleConnectionChange);
        return () => connection.removeEventListener('change', handleConnectionChange);
      }
    }
  }, [video, userSelectedQuality, videoQuality]);
  
  // Auto-play effect when video is ready
  useEffect(() => {
    if (autoPlay && videoRef.current && video) {
      const tryAutoPlay = () => {
        if (videoRef.current && videoRef.current.readyState >= 3) { // HAVE_FUTURE_DATA
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
              })
              .catch((error) => {
                // Autoplay prevented - this is normal in many browsers
                console.log('Autoplay prevented by browser:', error);
                setIsPlaying(false);
              });
          }
        }
      };
      
      // Try immediately if ready
      if (videoRef.current.readyState >= 3) {
        tryAutoPlay();
      } else {
        // Wait for video to be ready
        videoRef.current.addEventListener('canplaythrough', tryAutoPlay, { once: true });
        videoRef.current.addEventListener('loadeddata', tryAutoPlay, { once: true });
      }
    }
  }, [autoPlay, video, videoQuality]);

  // Update video source when quality changes
  useEffect(() => {
    if (!videoRef.current || !video || !video.video?.variants) return;
    
    const newUrl = getVideoUrl(videoQuality);
    const currentSrc = videoRef.current.src || videoRef.current.currentSrc;
    
    // Check if URL actually changed (compare full URLs)
    if (newUrl && newUrl !== currentSrc && newUrl !== '') {
      const wasPlaying = isPlaying;
      // Only save time if this is not the initial load and we have a valid position
      const shouldRestorePosition = !isInitialLoadRef.current && lastQualityRef.current !== null;
      const savedTime = shouldRestorePosition ? Math.max(0, videoRef.current.currentTime || 0) : 0;
      
      // Update refs
      lastQualityRef.current = videoQuality;
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
      
      setIsChangingQuality(true);
      setIsLoading(true);
      
      // Pause and save state
      if (wasPlaying) {
        videoRef.current.pause();
      }
      
      // Store the saved time in a ref to ensure it persists
      const savedTimeRef = { value: savedTime };
      
      // Function to restore playback position
      const restorePlayback = () => {
        if (!videoRef.current) return;
        
        const seekToTime = () => {
          if (videoRef.current && videoRef.current.readyState >= 2 && savedTimeRef.value > 0) {
            // Ensure we don't seek beyond duration
            const maxTime = videoRef.current.duration || Infinity;
            const targetTime = Math.min(savedTimeRef.value, maxTime);
            
            if (targetTime > 0 && targetTime < maxTime) {
              videoRef.current.currentTime = targetTime;
              setCurrentTime(targetTime);
              setIsChangingQuality(false);
              
              // Resume playback if it was playing
              if (wasPlaying || (autoPlay && isInitialLoadRef.current === false)) {
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                  playPromise
                    .then(() => {
                      setIsPlaying(true);
                    })
                    .catch(() => {
                      setIsPlaying(false);
                    });
                }
              }
              return true;
            }
          }
          return false;
        };
        
        // Only restore if we have a saved time
        if (savedTimeRef.value > 0) {
          // Try multiple events to ensure we catch when video is ready
          const handleCanSeek = () => {
            if (seekToTime()) {
              // Remove other listeners since we succeeded
              if (videoRef.current) {
                videoRef.current.removeEventListener('canplay', handleCanSeek);
                videoRef.current.removeEventListener('canplaythrough', handleCanSeek);
                videoRef.current.removeEventListener('loadeddata', handleCanSeek);
              }
            }
          };
          
          // Listen for multiple events to ensure we can seek
          if (videoRef.current) {
            videoRef.current.addEventListener('canplay', handleCanSeek, { once: true });
            videoRef.current.addEventListener('canplaythrough', handleCanSeek, { once: true });
            videoRef.current.addEventListener('loadeddata', handleCanSeek, { once: true });
            
            // Also try immediately if video is already ready
            if (videoRef.current.readyState >= 2) {
              setTimeout(() => {
                if (!seekToTime()) {
                  // If immediate seek failed, wait a bit more
                  setTimeout(seekToTime, 200);
                }
              }, 50);
            }
          }
        } else {
          // No position to restore, just mark as done
          setIsChangingQuality(false);
          if (wasPlaying || autoPlay) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                })
                .catch(() => {
                  setIsPlaying(false);
                });
            }
          }
        }
      };
      
      // Change source
      videoRef.current.src = newUrl;
      videoRef.current.load();
      
      // Restore playback after source change
      restorePlayback();
    } else if (isInitialLoadRef.current && newUrl) {
      // First load - mark as not initial anymore
      isInitialLoadRef.current = false;
      lastQualityRef.current = videoQuality;
    }
  }, [videoQuality, video, getVideoUrl, isPlaying, autoPlay]);
  
  // Speed options
  const speedOptions = [
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: 'Normal' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' }
  ];

  // Security measures and keyboard controls
  useEffect(() => {
    // Handle right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    };

    // Handle keyboard controls and security
    const handleKeyDown = (e) => {
      // Security: Disable forbidden keys
      const forbiddenKeys = [
        'F12', // Dev tools
        'Ctrl+Shift+I', // Dev tools
        'Ctrl+U', // View source
        'Ctrl+S', // Save
        'Ctrl+A', // Select all
        'Ctrl+P', // Print
        'Ctrl+Shift+C', // Inspect element
      ];
      
      if (forbiddenKeys.some(key => 
        key.includes('Ctrl+') ? 
        e.ctrlKey && e.key === key.split('+')[1] :
        e.key === key
      )) {
        e.preventDefault();
        setSecurityWarning(true);
        setTimeout(() => setSecurityWarning(false), 3000);
        return;
      }

      // Keyboard controls for video player
      if (videoRef.current) {
        switch (e.key) {
          case ' ':
          case 'k':
            e.preventDefault();
            if (isPlaying) {
              handlePause();
            } else {
              handlePlay();
            }
            break;
          case 'ArrowLeft':
            e.preventDefault();
            handleSkip(-10);
            break;
          case 'ArrowRight':
            e.preventDefault();
            handleSkip(10);
            break;
          case 'ArrowUp':
            e.preventDefault();
            handleVolumeKeyChange(0.05); // Smaller increment
            break;
          case 'ArrowDown':
            e.preventDefault();
            handleVolumeKeyChange(-0.05); // Smaller increment
            break;
          case 'm':
            e.preventDefault();
            handleMuteToggle();
            break;
          case 'f':
            e.preventDefault();
            handleFullscreen();
            break;
          case 'j':
            e.preventDefault();
            handleSkip(-10);
            break;
          case 'l':
            e.preventDefault();
            handleSkip(10);
            break;
          case '0':
            e.preventDefault();
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
            }
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            e.preventDefault();
            if (videoRef.current) {
              const percentage = parseInt(e.key) / 10;
              videoRef.current.currentTime = videoRef.current.duration * percentage;
            }
            break;
          case 'c':
            e.preventDefault();
            setShowSubtitles(!showSubtitles);
            break;
          case 's':
            e.preventDefault();
            setShowSettings(!showSettings);
            break;
          case '?':
          case 'h':
            e.preventDefault();
            setShowKeyboardHelp(!showKeyboardHelp);
            break;
          case 'Escape':
            if (showSettings) {
              setShowSettings(false);
            } else if (showKeyboardHelp) {
              setShowKeyboardHelp(false);
            } else if (isFullscreen) {
              handleFullscreen();
            }
            break;
        }
      }
    };

    // Detect dev tools
    const detectDevTools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        setDevToolsWarning(true);
        setTimeout(() => setDevToolsWarning(false), 5000);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    const devToolsInterval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(devToolsInterval);
      if (volumeStatusTimeout) {
        clearTimeout(volumeStatusTimeout);
      }
    };
  }, [rightClickDisabled, isPlaying, volume, showSubtitles, showSettings, isFullscreen]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
      setIsChangingQuality(false);
      
      // Auto-play if enabled
      if (autoPlay && !isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              // Autoplay was prevented (browser policy)
              console.log('Autoplay prevented:', error);
              setIsPlaying(false);
            });
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Calculate buffered progress
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / videoRef.current.duration) * 100;
        setBuffered(bufferedPercent);
      }
    }
  };

  const handleWaiting = () => {
    setIsBuffering(true);
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setIsBuffering(false);
    
    // Auto-play if enabled and not already playing
    if (autoPlay && videoRef.current && !isPlaying && videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            // Autoplay was prevented
            console.log('Autoplay prevented:', error);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleCanPlayThrough = () => {
    setIsLoading(false);
    setIsBuffering(false);
    
    // Auto-play if enabled and not already playing
    if (autoPlay && videoRef.current && !isPlaying && videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log('Autoplay prevented:', error);
            setIsPlaying(false);
          });
      }
    }
  };

  const handlePlaying = () => {
    setIsLoading(false);
    setIsBuffering(false);
    setIsPlaying(true);
  };

  const handleStalled = () => {
    setIsBuffering(true);
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      const bufferedPercent = (bufferedEnd / videoRef.current.duration) * 100;
      setBuffered(bufferedPercent);
      
      // If buffered enough, stop showing loading
      if (bufferedPercent > 5) {
        setIsBuffering(false);
      }
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value) => {
    if (videoRef.current) {
      videoRef.current.volume = value[0];
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
      
      // Show volume status bar
      setShowVolumeStatus(true);
      if (volumeStatusTimeout) {
        clearTimeout(volumeStatusTimeout);
      }
      const timeout = setTimeout(() => {
        setShowVolumeStatus(false);
      }, 1500);
      setVolumeStatusTimeout(timeout);
    }
  };

  const handleVolumeKeyChange = (increment) => {
    const newVolume = Math.max(0, Math.min(1, volume + increment));
    handleVolumeChange([newVolume]);
  };

  const handleVolumeClick = (event) => {
    const slider = event.currentTarget;
    const rect = slider.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newVolume = Math.max(0, Math.min(1, percentage));
    handleVolumeChange([newVolume]);
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
      
      // Show volume status bar
      setShowVolumeStatus(true);
      if (volumeStatusTimeout) {
        clearTimeout(volumeStatusTimeout);
      }
      const timeout = setTimeout(() => {
        setShowVolumeStatus(false);
      }, 1500);
      setVolumeStatusTimeout(timeout);
    }
  };

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handleQualityChange = (quality) => {
    if (quality === 'auto') {
      setUserSelectedQuality(null);
      // Use network speed recommendation
      if (networkSpeedRef.current?.recommendedQuality && video?.video?.variants?.[networkSpeedRef.current.recommendedQuality]) {
        const recommended = networkSpeedRef.current.recommendedQuality;
        setVideoQuality(recommended);
        // Force update by setting a different value first, then the target
        setTimeout(() => {
          setVideoQuality(recommended);
        }, 10);
      } else {
        setVideoQuality('auto');
      }
    } else {
      setUserSelectedQuality(quality);
      // Force update
      setVideoQuality(quality);
      setTimeout(() => {
        setVideoQuality(quality);
      }, 10);
    }
    setShowQualityPanel(false);
  };
  
  // Handle click on video to play/pause
  const handleVideoClick = (e) => {
    // Don't trigger if clicking on controls
    if (e.target.closest('[data-controls]') || e.target.closest('button') || e.target.closest('[data-settings-panel]')) {
      return;
    }
    
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      onFullscreenChange?.(true);
    } else {
      document.exitFullscreen();
      onFullscreenChange?.(false);
    }
  };

  const handleSkip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Context menu functions
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowContextMenu(false);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: video?.description,
        url: window.location.href,
      });
    } else {
      handleCopyUrl();
    }
    setShowContextMenu(false);
  };

  const handleLoop = () => {
    if (videoRef.current) {
      videoRef.current.loop = !isLooping;
      setIsLooping(!isLooping);
    }
    setShowContextMenu(false);
  };

  const handlePictureInPicture = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error('Picture-in-Picture failed:', err);
      }
    }
    setShowContextMenu(false);
  };

  // Format time helper
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [resetControlsTimeout]);

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettings || showSpeedPanel || showQualityPanel || showSubtitlePanel || showContextMenu) {
        const target = event.target;
        if (!target.closest('[data-settings-panel]') && 
            !target.closest('[data-speed-panel]') && 
            !target.closest('[data-quality-panel]') && 
            !target.closest('[data-subtitle-panel]') &&
            !target.closest('[data-context-menu]')) {
          setShowSettings(false);
          setShowSpeedPanel(false);
          setShowQualityPanel(false);
          setShowSubtitlePanel(false);
          setShowContextMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings, showSpeedPanel, showQualityPanel, showSubtitlePanel, showContextMenu]);

  // Security overlay
  const SecurityOverlay = () => (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <Shield className="h-16 w-16 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">Security Warning</h3>
        <p className="text-gray-300 max-w-md">
          This content is protected. Downloading, recording, or sharing is prohibited.
        </p>
        <Button 
          onClick={() => setSecurityWarning(false)}
          className="bg-red-600 hover:bg-red-700"
        >
          I Understand
        </Button>
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-screen'}`}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={handleVideoClick}
      data-controls-container
    >
      {/* Security Warning Overlay */}
      {securityWarning && <SecurityOverlay />}
      
      {/* Dev Tools Warning */}
      {devToolsWarning && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-40">
          <Lock className="h-4 w-4" />
          <span>Developer tools detected. Please close them to continue.</span>
        </div>
      )}

      {/* Volume Status Bar */}
      {showVolumeStatus && (
        <div className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-black/90 backdrop-blur-sm rounded-lg p-4 z-40 border border-white/20">
          <div className="flex items-center gap-3">
            <Volume2 className={`h-6 w-6 ${isMuted ? 'text-red-400' : 'text-white'}`} />
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-glimz-primary transition-all duration-200"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
              <span className="text-white text-sm font-medium">
                {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </div>
      )}

       {/* Video Element */}
       <video
         ref={videoRef}
         className="w-full h-full object-cover transition-opacity duration-300"
         src={getVideoUrl(videoQuality)}
         autoPlay={autoPlay}
         muted={false} // Don't force mute - let user control
         onLoadedMetadata={handleLoadedMetadata}
         onTimeUpdate={handleTimeUpdate}
         onPlay={handlePlaying}
         onPause={handlePause}
         onLoadStart={() => setIsLoading(true)}
         onCanPlay={handleCanPlay}
         onCanPlayThrough={handleCanPlayThrough}
         onWaiting={handleWaiting}
         onStalled={handleStalled}
         onProgress={handleProgress}
         onError={() => {
           setIsLoading(false);
           setIsBuffering(false);
         }}
         controls={false}
         onContextMenu={(e) => e.preventDefault()}
         preload="auto"
         playsInline
         style={{
           pointerEvents: 'none', // Prevent direct video interaction
           opacity: isChangingQuality ? 0.5 : 1,
         }}
       />

      {/* Loading Overlay */}
      {(isLoading || isBuffering || isChangingQuality) && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30 transition-opacity duration-300">
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-glimz-primary animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="space-y-2">
              {isChangingQuality && (
                <p className="text-white font-medium text-lg">Changing quality...</p>
              )}
              {isBuffering && !isChangingQuality && (
                <p className="text-white font-medium text-lg">Buffering...</p>
              )}
              {isLoading && !isBuffering && !isChangingQuality && (
                <p className="text-white font-medium text-lg">Loading video...</p>
              )}
              {networkSpeed && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                  {networkSpeed.speed === 'fast' ? (
                    <Wifi className="h-4 w-4 text-green-400" />
                  ) : networkSpeed.speed === 'medium' ? (
                    <Wifi className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-400" />
                  )}
                  <span>Network: {networkSpeed.speed}</span>
                  {videoQuality !== 'auto' && (
                    <span className="text-gray-400">• Quality: {videoQuality}</span>
                  )}
                </div>
              )}
            </div>
            {/* Progress indicator */}
            <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-glimz-primary transition-all duration-300"
                style={{ width: `${buffered}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Video Controls Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-200 ease-in-out ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        data-controls
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
              <h2 className="text-white font-semibold truncate max-w-md">
                {video?.title}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Shield className="h-3 w-3 mr-1" />
                Protected
              </Badge>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (isPlaying) {
                handlePause();
              } else {
                handlePlay();
              }
            }}
            size="lg"
            className="bg-white/90 hover:bg-white text-black p-8 rounded-full shadow-lg pointer-events-auto transition-transform duration-200 hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="h-12 w-12" />
            ) : (
              <Play className="h-12 w-12 ml-1" />
            )}
          </Button>
        </div>

        {/* YouTube-style Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
          {/* Progress Bar */}
          <div className="px-4 py-2">
            <div className="relative group">
              {/* Buffered Progress */}
              <div 
                className="absolute top-0 left-0 h-1 bg-white/30 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              {/* Progress Bar */}
              <Slider
                ref={progressRef}
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-between px-4 py-2">
            {/* Left Controls */}
            <div className="flex items-center gap-1">
              {/* Play/Pause */}
              <Button
                onClick={isPlaying ? handlePause : handlePlay}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              {/* Skip Backward */}
              <Button
                onClick={() => handleSkip(-10)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2 rounded-full"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              {/* Skip Forward */}
              <Button
                onClick={() => handleSkip(10)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2 rounded-full"
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              

              {/* Time Display */}
              <div className="text-white text-sm font-mono ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2 ml-2 group/volume relative">
                <Button
                  onClick={handleMuteToggle}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2 rounded-full"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : volume < 0.5 ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                {/* Volume Slider - appears on hover */}
                <div 
                  className="w-20 opacity-0 group-hover/volume:opacity-100 transition-opacity duration-200 cursor-pointer hover:opacity-100"
                  onClick={handleVolumeClick}
                >
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-full"
                  />
                </div>
                {/* Volume Status - shows current volume percentage */}
                <div className="opacity-0 group-hover/volume:opacity-100 transition-opacity duration-200 text-white text-xs min-w-[3ch] hover:opacity-100">
                  {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
                </div>
              </div>  
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1">
              {/* Settings */}
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2 rounded-full"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Subtitles */}
              <Button
                onClick={() => setShowSubtitles(!showSubtitles)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2 rounded-full"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"/>
                </svg>
              </Button>

              {/* Fullscreen */}
              <Button
                onClick={handleFullscreen}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2 rounded-full"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard Help Overlay */}
        {showKeyboardHelp && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-black/95 backdrop-blur-sm rounded-lg p-8 w-96 max-w-[90vw] space-y-6 border border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-xl font-bold">Keyboard Shortcuts</h3>
                <Button
                  onClick={() => setShowKeyboardHelp(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">Space</kbd>
                    <span className="text-white/80">Play/Pause</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">K</kbd>
                    <span className="text-white/80">Play/Pause</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">← →</kbd>
                    <span className="text-white/80">Skip 10s</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">J L</kbd>
                    <span className="text-white/80">Skip 10s</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">↑ ↓</kbd>
                    <span className="text-white/80">Volume</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">M</kbd>
                    <span className="text-white/80">Mute</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">F</kbd>
                    <span className="text-white/80">Fullscreen</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">0-9</kbd>
                    <span className="text-white/80">Jump to %</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">C</kbd>
                    <span className="text-white/80">Subtitles</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">S</kbd>
                    <span className="text-white/80">Settings</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20">
                <div className="flex justify-between">
                  <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">Esc</kbd>
                  <span className="text-white/80">Close/Exit Fullscreen</span>
                </div>
                <div className="flex justify-between mt-2">
                  <kbd className="px-2 py-1 bg-white/20 rounded text-white font-mono">? H</kbd>
                  <span className="text-white/80">Show/Hide Help</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YouTube-style Settings Panel */}
        {showSettings && (
          <div 
            data-settings-panel
            className="absolute bottom-16 right-4 bg-black/95 backdrop-blur-sm rounded-lg p-2 w-64 space-y-1 shadow-2xl border border-white/20"
          >
            {/* Playback Speed */}
            <div 
              className="px-3 py-2 hover:bg-white/10 rounded cursor-pointer"
              onClick={() => {
                setShowSettings(false);
                setShowSpeedPanel(true);
              }}
            >
              <div className="text-white text-sm">Playback speed</div>
              <div className="text-white/70 text-xs mt-1">
                {speedOptions.find(opt => opt.value === playbackSpeed)?.label || 'Normal'}
              </div>
            </div>

            {/* Quality */}
            <div 
              className="px-3 py-2 hover:bg-white/10 rounded cursor-pointer"
              onClick={() => {
                setShowSettings(false);
                setShowQualityPanel(true);
              }}
            >
              <div className="text-white text-sm">Quality</div>
              <div className="text-white/70 text-xs mt-1 flex items-center gap-2">
                {userSelectedQuality ? (
                  <span>{userSelectedQuality}</span>
                ) : (
                  <>
                    <span>Auto</span>
                    {networkSpeed && (
                      <span className="text-gray-500">({networkSpeed.recommendedQuality})</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Subtitles */}
            <div 
              className="px-3 py-2 hover:bg-white/10 rounded cursor-pointer"
              onClick={() => {
                setShowSettings(false);
                setShowSubtitlePanel(true);
              }}
            >
              <div className="text-white text-sm">Subtitles</div>
              <div className="text-white/70 text-xs mt-1">
                {showSubtitles ? 'On' : 'Off'}
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div 
              className="px-3 py-2 hover:bg-white/10 rounded cursor-pointer"
              onClick={() => {
                setShowSettings(false);
                setShowKeyboardHelp(true);
              }}
            >
              <div className="text-white text-sm">Keyboard shortcuts</div>
              <div className="text-white/70 text-xs mt-1">Press ? for help</div>
            </div>
          </div>
        )}

        {/* Speed Panel */}
        {showSpeedPanel && (
          <div 
            data-speed-panel
            className="absolute bottom-16 right-4 bg-black/95 backdrop-blur-sm rounded-lg p-2 w-48 space-y-1 shadow-2xl border border-white/20"
          >
            <div className="px-3 py-2 text-white text-sm font-medium">Playback speed</div>
            {speedOptions.map((option) => (
              <div
                key={option.value}
                className={`px-3 py-2 hover:bg-white/10 rounded cursor-pointer ${
                  playbackSpeed === option.value ? 'bg-glimz-primary/20' : ''
                }`}
                onClick={() => {
                  handleSpeedChange(option.value);
                  setShowSpeedPanel(false);
                }}
              >
                <div className="text-white text-sm">{option.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quality Panel */}
        {showQualityPanel && (
          <div 
            data-quality-panel
            className="absolute bottom-16 right-4 bg-black/95 backdrop-blur-sm rounded-lg p-2 w-56 space-y-1 shadow-2xl border border-white/20 z-50"
          >
            <div className="px-3 py-2 text-white text-sm font-medium border-b border-white/10">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span>Quality</span>
              </div>
              {networkSpeed && (
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  {networkSpeed.speed === 'fast' ? (
                    <Zap className="h-3 w-3 text-green-400" />
                  ) : networkSpeed.speed === 'medium' ? (
                    <Gauge className="h-3 w-3 text-yellow-400" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-400" />
                  )}
                  <span>Network: {networkSpeed.speed}</span>
                </div>
              )}
            </div>
            {availableQualities.map((option) => {
              const isSelected = option.value === 'auto' 
                ? !userSelectedQuality 
                : userSelectedQuality === option.value;
              const isRecommended = option.value === 'auto' 
                ? false 
                : networkSpeed?.recommendedQuality === option.value && !userSelectedQuality;
              
              return (
              <div
                key={option.value}
                  className={`px-3 py-2 hover:bg-white/10 rounded cursor-pointer transition-all duration-150 ${
                    isSelected ? 'bg-glimz-primary/30' : ''
                  }`}
                  onClick={() => handleQualityChange(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">{option.label}</span>
                      {option.value === 'auto' && (
                        <Zap className="h-3 w-3 text-gray-400" />
                      )}
              </div>
                    <div className="flex items-center gap-2">
                      {isRecommended && !isSelected && (
                        <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                          Recommended
                        </Badge>
                      )}
                      {isSelected && (
                        <Check className="h-4 w-4 text-glimz-primary" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Subtitle Panel */}
        {showSubtitlePanel && (
          <div 
            data-subtitle-panel
            className="absolute bottom-16 right-4 bg-black/95 backdrop-blur-sm rounded-lg p-2 w-48 space-y-1 shadow-2xl border border-white/20"
          >
            <div className="px-3 py-2 text-white text-sm font-medium">Subtitles</div>
            <div
              className={`px-3 py-2 hover:bg-white/10 rounded cursor-pointer ${
                !showSubtitles ? 'bg-glimz-primary/20' : ''
              }`}
              onClick={() => {
                setShowSubtitles(false);
                setShowSubtitlePanel(false);
              }}
            >
              <div className="text-white text-sm">Off</div>
            </div>
            <div
              className={`px-3 py-2 hover:bg-white/10 rounded cursor-pointer ${
                showSubtitles ? 'bg-glimz-primary/20' : ''
              }`}
              onClick={() => {
                setShowSubtitles(true);
                setShowSubtitlePanel(false);
              }}
            >
              <div className="text-white text-sm">English</div>
            </div>
           </div>
         )}

         {/* Context Menu */}
         {showContextMenu && (
           <div 
             data-context-menu
             className="fixed bg-black/95 backdrop-blur-sm rounded-lg p-2 w-48 space-y-1 shadow-2xl border border-white/20 z-50"
             style={{
               left: contextMenuPosition.x,
               top: contextMenuPosition.y,
               transform: 'translate(-100%, -10px)' // Position above and to the left of cursor
             }}
           >
             <div 
               className="px-3 py-2 hover:bg-white/10 rounded cursor-pointer flex items-center gap-2"
               onClick={handleCopyUrl}
             >
               <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                 <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
                 <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
               </svg>
               <span className="text-white text-sm">Copy video URL</span>
             </div>

             <div 
               className="px-3 py-2 hover:bg-white/10 rounded cursor-pointer flex items-center gap-2"
               onClick={handleShare}
             >
               <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                 <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
               </svg>
               <span className="text-white text-sm">Share</span>
             </div>

             <div 
               className="px-3 py-2 hover:bg-white/10 rounded cursor-pointer flex items-center gap-2"
               onClick={handleLoop}
             >
               <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
               </svg>
               <span className="text-white text-sm">
                 {isLooping ? 'Turn off loop' : 'Loop'}
               </span>
             </div>

             <div 
               className="px-3 py-2 hover:bg-white/10 rounded cursor-pointer flex items-center gap-2"
               onClick={handlePictureInPicture}
             >
               <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
               </svg>
               <span className="text-white text-sm">Picture-in-Picture</span>
             </div>

             <div className="border-t border-white/20 my-1"></div>

             <div 
               className="px-3 py-2 hover:bg-white/10 rounded cursor-pointer flex items-center gap-2"
               onClick={() => {
                 setShowSettings(true);
                 setShowContextMenu(false);
               }}
             >
               <Settings className="h-4 w-4 text-white" />
               <span className="text-white text-sm">Video settings</span>
             </div>

             <div 
               className="px-3 py-2 hover:bg-white/10 rounded cursor-pointer flex items-center gap-2"
               onClick={handleFullscreen}
             >
               {isFullscreen ? (
                 <Minimize className="h-4 w-4 text-white" />
               ) : (
                 <Maximize className="h-4 w-4 text-white" />
               )}
               <span className="text-white text-sm">
                 {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
               </span>
             </div>
           </div>
         )}
       </div>
     </div>
   );
};

export default VideoPlayer;
