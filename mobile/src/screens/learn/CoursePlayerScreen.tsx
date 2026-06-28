import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, useColorScheme, Dimensions, Alert, Animated, TextInput, PanResponder, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import Markdown from 'react-native-marked';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { localIp } from '../../api/client';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import * as Brightness from 'expo-brightness';

import { useLessonQuery, useAddNoteMutation, useDeleteNoteMutation, useCompleteLessonMutation } from '../../api/queries/useLessonQuery';
import { CourseTabs } from '../../components/learn/CourseTabs';
import { CourseAssignment } from '../../components/learn/CourseAssignment';
import { NoteItem } from '../../components/learn/NoteItem';
import { VideoControlsOverlay } from '../../components/learn/VideoControlsOverlay';

const MemoizedMarkdown = React.memo(({ content, theme }: { content: string, theme: any }) => (
  <Markdown 
    value={content || ' '}
    flatListProps={{ contentContainerStyle: { padding: 20 } }}
    theme={{ colors: { text: theme.text, background: theme.bg, code: theme.muted, link: theme.primary, border: theme.border } }}
  />
), (prevProps, nextProps) => prevProps.content === nextProps.content && prevProps.theme.text === nextProps.theme.text);

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CoursePlayerScreen({ route, navigation }: any) {
  const { id } = route.params || {};
  
  const { data, isLoading: loading, error } = useLessonQuery(id);
  const addNoteMutation = useAddNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();
  const completeLessonMutation = useCompleteLessonMutation();

  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<string>('idle');
  const [isLocked, setIsLocked] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [isDoubt, setIsDoubt] = useState(false);

  const [progress, setProgress] = useState(0);
  const [maxWatched, setMaxWatched] = useState(0);
  const [duration, setDuration] = useState(0);

  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [proxyLoading, setProxyLoading] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [quality, setQuality] = useState<'Auto' | '1080p' | '720p' | '480p' | '360p'>('Auto');
  const [brightness, setBrightness] = useState(1);
  const [volume, setVolume] = useState(1);
  const [swipeIndicator, setSwipeIndicator] = useState<'volume' | 'brightness' | null>(null);

  useEffect(() => {
    Brightness.getBrightnessAsync().then(setBrightness).catch(() => {});
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contentFit, setContentFit] = useState<'contain' | 'cover'>('contain');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => setDimensions(window));
    return () => subscription?.remove();
  }, []);
  
  useEffect(() => {
    return () => { 
      ScreenOrientation.unlockAsync(); 
      NavigationBar.setVisibilityAsync("visible").catch(() => {});
    };
  }, []);

  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;
    if (isFullscreen) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      parent.setOptions({ 
        tabBarStyle: { backgroundColor: theme.bg, borderTopColor: theme.border, borderTopWidth: 1, display: 'flex' } 
      });
    }
    return () => {
      if (isFullscreen) {
        parent.setOptions({ tabBarStyle: { backgroundColor: theme.bg, borderTopColor: theme.border, borderTopWidth: 1, display: 'flex' } });
      }
    };
  }, [isFullscreen, navigation]);

  const videoStartTime = data?.lesson?.videoStartTime || 0;
  const videoEndTime = data?.lesson?.videoEndTime || 0;
  const isYoutubeType = data?.lesson?.type === 'YOUTUBE';
  const isYoutubeProxy = isYoutubeType && !!proxyUrl;
  const playerEndTime = videoEndTime > 0 ? videoEndTime : (isYoutubeProxy ? videoStartTime + duration : duration);

  const [autoplayCountdown, setAutoplayCountdown] = useState<number | null>(null);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    if (autoplayCountdown === null) return;
    if (autoplayCountdown <= 0) {
      setAutoplayCountdown(null);
      if (data?.nextLessonId) navigation.replace('CoursePlayer', { id: data.nextLessonId });
      return;
    }
    const timer = setTimeout(() => setAutoplayCountdown(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [autoplayCountdown, data?.nextLessonId, navigation]);

  const progressRef = useRef(progress);
  const maxWatchedRef = useRef(maxWatched);
  const hasSeekedInit = useRef(false);
  const lastSeekRef = useRef(0);

  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { maxWatchedRef.current = maxWatched; }, [maxWatched]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const [doubleTapAction, setDoubleTapAction] = useState<'left' | 'right' | null>(null);
  const lastTapRef = useRef<number | null>(null);

  const hideControls = useCallback(() => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setShowControls(false));
  }, [fadeAnim]);

  const swipeDataRef = useRef({ brightness, volume, player: null as any });
  
  const initialSwipeValueRef = useRef(0);
  
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gestureState) => {
      if (isLocked) return false;
      return Math.abs(gestureState.dy) > 15;
    },
    onPanResponderGrant: (_, gestureState) => {
      const isLeft = gestureState.x0 < dimensions.width / 2;
      setSwipeIndicator(isLeft ? 'brightness' : 'volume');
      initialSwipeValueRef.current = isLeft ? swipeDataRef.current.brightness : swipeDataRef.current.volume;
    },
    onPanResponderMove: (_, gestureState) => {
      const isLeft = gestureState.x0 < dimensions.width / 2;
      const delta = -gestureState.dy / (dimensions.height * 0.5);
      let newValue = initialSwipeValueRef.current + delta;
      newValue = Math.max(0, Math.min(1, newValue));
      
      if (isLeft) {
        setBrightness(newValue);
        Brightness.setBrightnessAsync(newValue).catch(() => {});
      } else {
        setVolume(newValue);
        if (swipeDataRef.current.player) swipeDataRef.current.player.volume = newValue;
      }
    },
    onPanResponderRelease: () => setSwipeIndicator(null),
    onPanResponderTerminate: () => setSwipeIndicator(null),
  }), [dimensions.width, dimensions.height, isLocked]);

  const handleOverlayTap = (e: any) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {
      if (isLocked) return;
      const { locationX } = e.nativeEvent;
      const isLeft = locationX < dimensions.width / 2;
      
      let seekAmount = isLeft ? -10 : 10;
      let newTime = progressRef.current + seekAmount;
      if (newTime < videoStartTime) newTime = videoStartTime;
      const end = playerEndTime;
      if (end > 0 && newTime > end) newTime = end;
      if (!data?.existingProgress?.completed && newTime > maxWatchedRef.current) newTime = maxWatchedRef.current;
      
      setProgress(newTime);
      if (swipeDataRef.current.player) {
        lastSeekRef.current = Date.now();
        try {
          swipeDataRef.current.player.currentTime = isYoutubeProxy ? newTime - videoStartTime : newTime;
        } catch (e) {}
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      setDoubleTapAction(isLeft ? 'left' : 'right');
      rippleAnim.setValue(1);
      Animated.timing(rippleAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => setDoubleTapAction(null));

      setShowControls(true);
      fadeAnim.setValue(1);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now) {
          if (isLocked) {
            if (showControls) hideControls();
            else {
              setShowControls(true);
              Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
            }
          } else {
            togglePlay();
            setShowControls(true);
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
          }
        }
      }, DOUBLE_PRESS_DELAY);
    }
  };

  useEffect(() => {
    if (isPlaying && showControls) {
      const t = setTimeout(hideControls, 3000);
      return () => clearTimeout(t);
    }
  }, [isPlaying, showControls, hideControls]);

  const isDark = useColorScheme() === 'dark';
  const theme = useMemo(() => ({
    bg: isDark ? '#000000' : '#f3f6f8',
    card: isDark ? '#111111' : '#ffffff',
    text: isDark ? '#ffffff' : '#111827',
    muted: isDark ? '#a1a1aa' : '#6b7280',
    primary: '#1e88e5',
    border: isDark ? '#27272a' : '#e5e7eb',
    success: '#10b981',
  }), [isDark]);

  useEffect(() => {
    if (data?.videoProgress) {
      const vStart = data.lesson?.videoStartTime || 0;
      setProgress(Math.max(data.videoProgress.timestamp || 0, vStart));
      setMaxWatched(Math.max(data.videoProgress.maxTimestamp || 0, vStart));
    }
  }, [data?.videoProgress]);

  useEffect(() => {
    if (data?.lesson?.type === 'YOUTUBE' && data?.lesson?.youtubeVideoId) {
      const start = data.lesson.videoStartTime || 0;
      const end = data.lesson.videoEndTime || 0;
      const resume = progressRef.current > start ? Math.floor(progressRef.current) : Math.max(data.videoProgress?.timestamp || 0, start);
      const qualityParam = quality === 'Auto' ? 'Auto' : quality.replace('p', '');
      setProxyUrl(`http://${localIp}:8080/hls/${data.lesson.youtubeVideoId}/playlist.m3u8?start=${start}&end=${end}&resume=${resume}&h=${qualityParam}`);
    }
  }, [data?.lesson?.youtubeVideoId, data?.lesson?.type, data?.lesson?.videoStartTime, data?.lesson?.videoEndTime, quality]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await addNoteMutation.mutateAsync({ lessonId: id, text: noteText, timestamp: Math.floor(progress), isDoubt });
    setNoteText('');
    setIsDoubt(false);
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteNoteMutation.mutateAsync({ lessonId: id, noteId });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    ]);
  };

  const handleComplete = async () => {
    if (completeLessonMutation.isPending || data?.existingProgress?.completed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await completeLessonMutation.mutateAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const togglePlay = () => {
    if (swipeDataRef.current.player) {
      try {
        if (swipeDataRef.current.player.playing) swipeDataRef.current.player.pause();
        else swipeDataRef.current.player.play();
      } catch (e) {}
    }
  };

  const handleSeek = (value: number) => {
    hasSeekedInit.current = true;
    let newTime = value;
    if (newTime < videoStartTime) newTime = videoStartTime;
    const end = playerEndTime;
    if (end > 0 && newTime > end) newTime = end;
    if (!data?.existingProgress?.completed && newTime > maxWatchedRef.current) newTime = maxWatchedRef.current;
    
    setProgress(newTime);
    if (swipeDataRef.current.player) {
      lastSeekRef.current = Date.now();
      try {
        swipeDataRef.current.player.currentTime = isYoutubeProxy ? newTime - videoStartTime : newTime;
      } catch (e) {}
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      await NavigationBar.setVisibilityAsync("visible").catch(() => {});
      setIsFullscreen(false);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      await NavigationBar.setVisibilityAsync("hidden").catch(() => {});
      setIsFullscreen(true);
    }
  };

  const videoSource = isYoutubeProxy ? proxyUrl : (!isYoutubeType && data?.lesson?.videoUrl ? data.lesson.videoUrl : null);

  const player = useVideoPlayer(videoSource, p => {
    p.loop = false;
    p.addListener('statusChange', (event) => setPlayerStatus(event.status));
    p.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
      if (event.isPlaying) setHasEnded(false);
    });
  });

  useEffect(() => {
    swipeDataRef.current.player = player;
  }, [player]);

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('playToEnd', () => {
      setHasEnded(true);
      if (data?.nextLessonId) {
        setAutoplayCountdown(5);
        if (isFullscreen) {
           ScreenOrientation.unlockAsync();
           setIsFullscreen(false);
        }
      }
    });
    return () => sub.remove();
  }, [player, data?.nextLessonId, isFullscreen]);

  useEffect(() => {
    if (player) player.playbackRate = playbackRate;
  }, [player, playbackRate]);

  useEffect(() => {
    if (player && player.duration) setDuration(player.duration);
  }, [player?.duration]);

  useEffect(() => {
    if (!videoSource || !player) return;
    const interval = setInterval(() => {
      try {
        if (player.status === 'readyToPlay' && !hasSeekedInit.current) hasSeekedInit.current = true;
        if (!hasSeekedInit.current) return;
        if (Date.now() - lastSeekRef.current < 1500) return;

        let cTime = player.currentTime;
        if (isYoutubeProxy) cTime += videoStartTime;
        
        setProgress(cTime);
        if (cTime > maxWatchedRef.current) setMaxWatched(cTime);

        const end = playerEndTime;
        if (end > 0 && cTime >= end - 1) {
          player.pause();
          if (!data?.existingProgress?.completed && data?.canComplete) handleComplete();
          return;
        }

        if (!data?.existingProgress?.completed && cTime > maxWatchedRef.current + 2) {
          const revertTime = maxWatchedRef.current;
          player.currentTime = isYoutubeProxy ? revertTime - videoStartTime : revertTime;
        }
      } catch (e) {}
    }, 1000);
    return () => clearInterval(interval);
  }, [player, videoSource, data?.existingProgress?.completed, data?.canComplete, isYoutubeProxy, videoStartTime, playerEndTime]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.videoPlaceholder, { height: dimensions.width * (9 / 16) }]} />
        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }
  if (!data || !data.lesson) return null;

  const { lesson, existingProgress, canComplete, nextLessonId, prevLessonId, submission } = data;
  const isCompleted = existingProgress?.completed;
  const notes = lesson.videoNotes || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={isFullscreen ? [] : ['top']}>
      <StatusBar hidden={isFullscreen} />
      <View style={[isFullscreen ? { height: dimensions.height, width: dimensions.width } : { height: dimensions.width * (9/16) }, styles.videoContainer]}>
        {isYoutubeType && proxyLoading ? (
          <View style={styles.proxyLoaderContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.proxyLoaderText}>Bypassing Ads via Proxy...</Text>
          </View>
        ) : videoSource ? (
          <View style={styles.videoPlayerContainer}>
            <VideoView style={styles.videoPlayerContainer} player={player} nativeControls={false} contentFit={contentFit} />
            
            <Animated.View {...panResponder.panHandlers} style={StyleSheet.absoluteFill}>
              <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} onPress={handleOverlayTap}>
                <View style={StyleSheet.absoluteFill}>
                  <VideoControlsOverlay
                    showControls={showControls} fadeAnim={fadeAnim} isLocked={isLocked} setIsLocked={setIsLocked}
                    hasEnded={hasEnded} autoplayCountdown={autoplayCountdown} 
                    onReplay={() => {
                      setHasEnded(false);
                      if (player) { lastSeekRef.current = Date.now(); try { player.currentTime = 0; setProgress(isYoutubeProxy ? videoStartTime : 0); player.play(); } catch(e){} }
                    }}
                    isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} navigationGoBack={() => navigation.goBack()}
                    contentFit={contentFit} setContentFit={setContentFit} progress={progress} playerEndTime={playerEndTime}
                    handleSeek={handleSeek} playerStatus={playerStatus} isPlaying={isPlaying} togglePlay={togglePlay}
                    formatTime={formatTime} playbackRate={playbackRate} setPlaybackRate={setPlaybackRate}
                    showSpeedMenu={showSpeedMenu} setShowSpeedMenu={setShowSpeedMenu} quality={quality} setQuality={setQuality}
                    showQualityMenu={showQualityMenu} setShowQualityMenu={setShowQualityMenu}
                  />

                  {doubleTapAction && (
                    <Animated.View style={[styles.doubleTapIndicator, doubleTapAction === 'left' ? { left: '15%' } : { right: '15%' }, { opacity: rippleAnim }]} pointerEvents="none">
                      <View style={styles.doubleTapContent}>
                        <Ionicons name={doubleTapAction === 'left' ? "play-back" : "play-forward"} size={32} color="#fff" />
                        <Text style={styles.doubleTapText}>10s</Text>
                      </View>
                    </Animated.View>
                  )}
                  {swipeIndicator && (
                    <View style={[styles.swipeIndicator, swipeIndicator === 'brightness' ? { left: 40 } : { right: 40 }]}>
                      <Ionicons name={swipeIndicator === 'brightness' ? 'sunny' : 'volume-high'} size={24} color="#fff" style={styles.swipeIcon} />
                      <View style={styles.swipeBarContainer}>
                        <View style={[styles.swipeBarFill, { height: `${(swipeIndicator === 'brightness' ? brightness : volume) * 100}%` }]} />
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          <View style={styles.proxyLoaderContainer}>
            <Text style={{ color: '#fff' }}>Video not available</Text>
          </View>
        )}
      </View>

      {!isFullscreen && (
        <>
          <View style={[styles.headerSection, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <Text style={[styles.moduleTitle, { color: theme.primary }]}>{lesson.module.title}</Text>
            <Text style={[styles.lessonTitle, { color: theme.text }]}>{lesson.title}</Text>
          </View>

          <CourseTabs activeTab={activeTab} setActiveTab={setActiveTab} hasAssignment={!!lesson.assignment} />

          {activeTab === 'overview' ? (
            <View style={styles.tabContent}>
              <MemoizedMarkdown content={lesson.content} theme={theme} />
            </View>
          ) : activeTab === 'assignment' ? (
            <CourseAssignment assignment={lesson.assignment} submission={submission} />
          ) : activeTab === 'notes' ? (
            <View style={styles.tabContent}>
              <FlashList
                data={notes}
                extraData={progress}
                keyExtractor={(item: any) => item.id}
                estimatedItemSize={120}
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: note }: any) => (
                  <NoteItem note={note} isActive={progress >= note.timestamp && progress < note.timestamp + 10} theme={theme} formatTime={formatTime} handleSeek={handleSeek} handleDeleteNote={handleDeleteNote} />
                )}
                ListEmptyComponent={<Text style={styles.emptyNotesText}>No notes yet.</Text>}
                ListHeaderComponent={
                  <View style={[styles.addNoteContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <TextInput
                      style={[styles.addNoteInput, { color: theme.text }]}
                      placeholder={`Add a note at ${formatTime(progress)}...`}
                      placeholderTextColor={theme.muted}
                      value={noteText}
                      onChangeText={setNoteText}
                      multiline
                    />
                    <View style={styles.addNoteActions}>
                      <TouchableOpacity onPress={() => setIsDoubt(!isDoubt)} style={styles.checkboxRow}>
                        <Ionicons name={isDoubt ? "checkbox" : "square-outline"} size={20} color={isDoubt ? theme.primary : theme.muted} />
                        <Text style={[styles.checkboxText, { color: theme.text }]}>Mark as question</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.saveBtn, (!noteText.trim() || addNoteMutation.isPending) && styles.saveBtnDisabled]}
                        onPress={handleAddNote}
                        disabled={!noteText.trim() || addNoteMutation.isPending}
                      >
                        <Text style={styles.saveBtnText}>{addNoteMutation.isPending ? "Saving..." : "Save Note"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                }
              />
            </View>
          ) : null}

          <View style={[styles.footerNav, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            {prevLessonId ? (
              <TouchableOpacity style={[styles.navBtn, { borderColor: theme.border }]} onPress={() => navigation.replace('CoursePlayer', { id: prevLessonId })}>
                <Ionicons name="arrow-back" size={20} color={theme.text} />
              </TouchableOpacity>
            ) : <View style={styles.navBtnEmpty} />}

            {!lesson.assignment && !lesson.quiz && canComplete && !isCompleted ? (
              <TouchableOpacity 
                style={styles.completeBtn}
                onPress={handleComplete}
                disabled={completeLessonMutation.isPending}
              >
                {completeLessonMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.completeBtnText}>Mark Complete</Text>}
              </TouchableOpacity>
            ) : isCompleted ? (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={18} color={theme.success} style={{ marginRight: 6 }} />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            ) : (
              <View style={styles.flex1} />
            )}

            {nextLessonId ? (
              <TouchableOpacity style={[styles.navBtn, { borderColor: theme.border }]} onPress={() => navigation.replace('CoursePlayer', { id: nextLessonId })}>
                <Ionicons name="arrow-forward" size={20} color={theme.text} />
              </TouchableOpacity>
            ) : <View style={styles.navBtnEmpty} />}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f6f8',
  },
  videoPlaceholder: {
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
  loader: {
    marginTop: 40,
  },
  videoContainer: {
    backgroundColor: '#000',
  },
  proxyLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  proxyLoaderText: {
    color: '#9ca3af',
    marginTop: 12,
  },
  videoPlayerContainer: {
    width: '100%',
    height: '100%',
  },
  doubleTapIndicator: {
    position: 'absolute',
    top: '50%',
    marginTop: -40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleTapContent: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleTapText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    marginTop: -75,
    width: 40,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  swipeIcon: {
    marginBottom: 8,
  },
  swipeBarContainer: {
    flex: 1,
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  swipeBarFill: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  headerSection: {
    padding: 20,
    borderBottomWidth: 1,
  },
  moduleTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  tabContent: {
    flex: 1,
  },
  emptyNotesText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 32,
  },
  addNoteContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  addNoteInput: {
    fontSize: 15,
    minHeight: 80,
  },
  addNoteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  footerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnEmpty: {
    width: 48,
    height: 48,
  },
  completeBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  completedBadge: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 16,
  },
  completedText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10b981',
  },
  flex1: {
    flex: 1,
  }
});
