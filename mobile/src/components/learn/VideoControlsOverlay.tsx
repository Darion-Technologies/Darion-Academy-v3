import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';

export interface VideoControlsProps {
  showControls: boolean;
  fadeAnim: Animated.Value;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  hasEnded: boolean;
  autoplayCountdown: number | null;
  onReplay: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  navigationGoBack: () => void;
  contentFit: 'contain' | 'cover';
  setContentFit: (fit: 'contain' | 'cover') => void;
  progress: number;
  playerEndTime: number;
  handleSeek: (val: number) => void;
  playerStatus: string;
  isPlaying: boolean;
  togglePlay: () => void;
  formatTime: (sec: number) => string;
  playbackRate: number;
  setPlaybackRate: (r: number) => void;
  showSpeedMenu: boolean;
  setShowSpeedMenu: (b: boolean) => void;
  quality: string;
  setQuality: (q: string) => void;
  showQualityMenu: boolean;
  setShowQualityMenu: (b: boolean) => void;
}

export const VideoControlsOverlay = ({
  showControls,
  fadeAnim,
  isLocked,
  setIsLocked,
  hasEnded,
  autoplayCountdown,
  onReplay,
  isFullscreen,
  toggleFullscreen,
  navigationGoBack,
  contentFit,
  setContentFit,
  progress,
  playerEndTime,
  handleSeek,
  playerStatus,
  isPlaying,
  togglePlay,
  formatTime,
  playbackRate,
  setPlaybackRate,
  showSpeedMenu,
  setShowSpeedMenu,
  quality,
  setQuality,
  showQualityMenu,
  setShowQualityMenu,
}: VideoControlsProps) => {
  if (!showControls) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {isLocked ? (
        <TouchableOpacity onPress={() => setIsLocked(false)} style={styles.lockedContainer}>
          <BlurView intensity={40} tint="dark" style={styles.lockedBlur}>
            <Ionicons name="lock-closed" size={24} color="#fff" />
            <Text style={styles.lockedText}>Unlock Screen</Text>
          </BlurView>
        </TouchableOpacity>
      ) : (
        <>
          {hasEnded && autoplayCountdown === null && (
            <TouchableOpacity style={styles.replayButtonContainer} onPress={onReplay}>
              <View style={styles.replayButton}>
                <Ionicons name="refresh" size={40} color="#fff" />
              </View>
            </TouchableOpacity>
          )}

          {/* Top Control Bar */}
          <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.topBar}>
            <View style={styles.topBarRow}>
              <TouchableOpacity onPress={() => isFullscreen ? toggleFullscreen() : navigationGoBack()} style={styles.iconButton}>
                <Ionicons name={isFullscreen ? "chevron-down" : "close"} size={24} color="#fff" />
              </TouchableOpacity>
              {isFullscreen && (
                <TouchableOpacity onPress={() => setContentFit(contentFit === 'contain' ? 'cover' : 'contain')} style={[styles.iconButton, { marginLeft: 'auto' }]}>
                  <Ionicons name={contentFit === 'contain' ? "expand" : "contract"} size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {/* Bottom Control Bar */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.bottomBar}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={playerEndTime || 100}
              value={progress}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#1e88e5"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="#1e88e5"
            />
            
            <View style={styles.bottomControlsRow}>
              <View style={styles.bottomControlsLeft}>
                {playerStatus === 'loading' ? (
                  <ActivityIndicator size="small" color="#fff" style={styles.loader} />
                ) : (
                  <TouchableOpacity onPress={togglePlay} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="#fff" />
                  </TouchableOpacity>
                )}
                <Text style={styles.timeText}>
                  {formatTime(progress)} <Text style={styles.timeTextDim}>/ {formatTime(playerEndTime)}</Text>
                </Text>
              </View>
              
              <View style={styles.bottomControlsRight}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setIsLocked(true)}>
                  <Ionicons name="lock-open" size={16} color="#fff" />
                </TouchableOpacity>
                
                <View style={styles.menuContainer}>
                  <TouchableOpacity onPress={() => { setShowSpeedMenu(false); setShowQualityMenu(!showQualityMenu); }} style={styles.actionButton}>
                    <Ionicons name="settings" size={16} color="#fff" />
                  </TouchableOpacity>
                  {showQualityMenu && (
                    <View style={styles.menuDropdown}>
                      {(['Auto', '1080p', '720p', '480p', '360p'] as const).map((q) => (
                        <TouchableOpacity key={q} style={[styles.menuItem, quality === q && styles.menuItemActive]} onPress={() => { setQuality(q); setShowQualityMenu(false); }}>
                          <Text style={styles.menuItemText}>{q}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                
                <View style={styles.menuContainer}>
                  <TouchableOpacity onPress={() => { setShowQualityMenu(false); setShowSpeedMenu(!showSpeedMenu); }} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>{playbackRate}x</Text>
                  </TouchableOpacity>
                  {showSpeedMenu && (
                    <View style={[styles.menuDropdown, { width: 64 }]}>
                      {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                        <TouchableOpacity key={speed} style={[styles.menuItem, playbackRate === speed && styles.menuItemActive]} onPress={() => { setPlaybackRate(speed); setShowSpeedMenu(false); }}>
                          <Text style={styles.menuItemText}>{speed}x</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                
                <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenBtn}>
                  <Ionicons name={isFullscreen ? "contract" : "expand"} size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  lockedBlur: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  lockedText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 4,
  },
  replayButtonContainer: {
    position: 'absolute',
    zIndex: 50,
  },
  replayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 40,
    paddingBottom: 12,
  },
  slider: {
    width: '100%',
    height: 30,
    marginHorizontal: -4,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -2,
  },
  bottomControlsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loader: {
    marginRight: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  timeTextDim: {
    color: 'rgba(255,255,255,0.5)',
  },
  bottomControlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  menuContainer: {
    position: 'relative',
  },
  menuDropdown: {
    position: 'absolute',
    bottom: 36,
    right: 0,
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderRadius: 12,
    padding: 4,
    width: 80,
    zIndex: 50,
  },
  menuItem: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fullscreenBtn: {
    padding: 4,
  }
});
