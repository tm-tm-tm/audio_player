'use client'

import { useState, useEffect, useRef } from 'react'
import supabase from '@/lib/supabase'
import Image from 'next/image'
import moment from 'moment'
import styles from './Audio.module.css'

import Button from '../Button/Button'
import PlaySVG from '@/assets/svg/PlaySVG'
import PauseSVG from '@/assets/svg/PauseSVG'
import MuteSVG from '@/assets/svg/MuteSVG'
import UnmuteSVG from '@/assets/svg/UnmuteSVG'
import PreviousTrackSVG from '@/assets/svg/PreviousTrackSVG'
import NextTrackSVG from '@/assets/svg/NextTrackSVG'
import LoopSVG from '@/assets/svg/LoopSVG'
import Ellipsis from '../Ellipsis/Ellipsis'

const Audio = () => {
    const audioRef = useRef()
    const progressBarRef = useRef()
    const durationRef = useRef()

    const [loading, setLoading] = useState(false)
    const [playlist, setPlaylist] = useState([])
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentTrackDescription, setCurrentTrackDescription] = useState('');
    const [currentTrackArtwork, setCurrentTrackArtwork] = useState(null);
    const [artworkLoading, setArtworkLoading] = useState(true);
    const [playCounts, setPlayCounts] = useState({});

    const [isPlaying, setIsPlaying] = useState(false)
    const [isLooping, setIsLooping] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isScrubbing, setIsScrubbing] = useState(false)
    // const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        readPlaylist()
    }, [])

    useEffect(() => {
        // Set the initial track from the dynamic data        
        if (playlist.length > 0) {
            audioRef.current.src = playlist[0].audio_Url;
            setCurrentTrackArtwork(playlist[0].artwork_Url);
            setCurrentTrackDescription(playlist[0].description);
            setCurrentTrack(0);
        }
    }, [playlist]);

    useEffect(() => {
        const audio = audioRef.current

        // Add the event listener for the 'ended' event
        audio.addEventListener('ended', handleTrackEnd)

        // Cleanup the event listener when the component unmounts
        return () => {
            audio.removeEventListener('ended', handleTrackEnd)
        }
    }, [currentTrack])

    const readPlaylist = async () => {
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('Playlist')
                .select('*')
                .order('id', { ascending: true })

            if (error) {
                console.error('Error fetching data:', error.message)
                return
            }

            const tracksWithDurations = await Promise.all(data.map(async (track) => {
                const audio = document.createElement('audio');
                audio.src = track.audio_Url;

                return new Promise((resolve) => {
                    audio.onloadedmetadata = () => {
                        resolve({ ...track, duration: audio.duration });
                    };
                });
            }));

            const newPlayCounts = {};
            data.forEach(track => {
                newPlayCounts[track.id] = track.play_count;
            });

            setPlaylist(tracksWithDurations)
            setPlayCounts(newPlayCounts);
            setLoading(false)
        } catch (error) {
            console.error('Error:', error.message)
        }
    }

    const incrementPlayCount = async (trackId) => {
        try {
            // First, get the current play count
            let { data: trackData, error: getError } = await supabase
                .from('Playlist')
                .select('play_count')
                .eq('id', trackId)
                .single();

            if (getError) throw getError;

            // Then, increment the play count and update the database
            const newPlayCount = trackData.play_count + 1;
            const { error: updateError } = await supabase
                .from('Playlist')
                .update({ play_count: newPlayCount })
                .eq('id', trackId);

            if (updateError) throw updateError;

            // Optimistically update the local state
            setPlayCounts(prevCounts => ({
                ...prevCounts,
                [trackId]: (prevCounts[trackId] || 0) + 1
            }));

        } catch (error) {
            console.error('Error incrementing play count:', error.message);
        }
    }

    const handleTrackSelection = async (index) => {
        if (index === currentTrack) {
            return;
        }

        audioRef.current.src = playlist[index].audio_Url;
        setCurrentTrackArtwork(playlist[index].artwork_Url);
        setCurrentTrackDescription(playlist[index].description);
        setCurrentTrack(index)
        restartTrack()
        playTrack()
    };

    const playTrack = async () => {
        if (currentTrack !== null) {
            audioRef.current.play();
            setIsPlaying(true)

            await incrementPlayCount(playlist[currentTrack].id);
        }
    };

    const restartTrack = async () => {
        audioRef.current.currentTime = 0;
    }

    const nextTrack = async () => {
        const nextTrack = currentTrack + 1;

        if (nextTrack < playlist.length) {
            audioRef.current.src = playlist[nextTrack].audio_Url;
            setCurrentTrack(nextTrack);
            setCurrentTrackArtwork(playlist[nextTrack].artwork_Url);
            setCurrentTrackDescription(playlist[nextTrack].description);
        } else {
            audioRef.current.src = playlist[0].audio_Url;
            setCurrentTrack(0);
            setCurrentTrackArtwork(playlist[0].artwork_Url);
            setCurrentTrackDescription(playlist[0].description);
        }

        restartTrack();
        playTrack();
    };

    const previousTrack = async () => {
        const previousTrack = currentTrack - 1;

        if (previousTrack >= 0) {
            audioRef.current.src = playlist[previousTrack].audio_Url;
            setCurrentTrack(previousTrack);
            setCurrentTrackArtwork(playlist[previousTrack].artwork_Url);
            setCurrentTrackDescription(playlist[previousTrack].description);
        } else {
            restartTrack();
        }

        playTrack();
    };

    const handleTrackEnd = () => {
        if (isLooping) {
            restartTrack();
        } else {
            nextTrack();
        }
    }

    const togglePlayPause = async () => {
        const audio = audioRef.current

        if (audio) {
            if (isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleLoop = () => {
        setIsLooping(!isLooping)

        const audio = audioRef.current

        if (audio) {
            audio.loop = !isLooping
        }
    }

    const toggleMute = () => {
        const audio = audioRef.current

        if (audio) {
            audio.muted = !audio.muted
            setIsMuted(audio.muted)
        }
    }

    // const handlePlaybackRateChange = (event) => {
    //     const newRate = parseFloat(event.target.value);
    //     setPlaybackRate(newRate);
    //     audioRef.current.playbackRate = newRate;
    // };

    const updateProgressBar = () => {
        const audio = audioRef.current
        const progressBar = progressBarRef.current

        if (audio && progressBar && !isScrubbing) {
            const currentTime = audio.currentTime
            const duration = audio.duration

            if (!isNaN(duration) && duration > 0) {
                const progress = (currentTime / duration) * 100
                progressBar.style.width = `${progress}%`
                durationRef.current.textContent = formatTime(currentTime)
            }
        }
    };

    const handleScrubStart = (e) => {
        setIsScrubbing(true)
        updateProgressBar(e)
    }

    const handleScrubbing = (e) => {
        if (isScrubbing) {
            const progressBar = progressBarRef.current
            if (!progressBar) return

            const rect = progressBar.getBoundingClientRect()
            const offsetX = e.clientX - rect.left
            const newProgress = (offsetX / rect.width) * 100
            progressBar.style.width = `${newProgress}%`

            const audio = audioRef.current
            if (!audio) return

            const duration = audio.duration
            const newTime = (newProgress / 100) * duration

            if (!isNaN(duration) && isFinite(duration) && newTime >= 0 && newTime <= duration) {
                audio.currentTime = newTime
            }
        }
    }

    const handleScrubEnd = () => {
        setIsScrubbing(false)
    }

    const formatDate = (timestamp) => {
        return moment(timestamp).format('DD.MM.YYYY');
    }

    const formatTime = (timeInSeconds) => {
        const duration = moment.duration(timeInSeconds, 'seconds')
        const formattedTime = moment.utc(duration.asMilliseconds()).format('m:ss')
        return formattedTime
    }

    return (
        <>
            <div className={styles.playlistContainer}>
                <div className={styles.artworkContainer}>
                    <div className={styles.artworkInner}>
                        {artworkLoading &&
                            <p className={styles.artworkLoading}>
                                Loading...
                            </p>
                        }

                        {currentTrackArtwork && (
                            <Image
                                src={currentTrackArtwork}
                                // width={360}
                                // height={360}
                                priority
                                fill
                                alt="Artwork"
                                className={styles.image}
                                onLoad={() => setArtworkLoading(false)}
                            />
                        )}
                    </div>
                </div>

                {/* <div className={styles.descriptionContainer}>
                    <div className={styles.descriptionInner}>
                        {currentTrackDescription && (
                            <p>
                                {currentTrackDescription}
                            </p>
                        )}
                    </div>
                </div> */}

                <div className={styles.playlist}>
                    <div className={styles.playlistTracks}>
                        <table className={styles.playlistTable}>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Artist</th>
                                    <th>Plays</th>
                                    <th>Date Added</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    loading ?
                                        <tr>
                                            <td>
                                                loading <Ellipsis />
                                            </td>
                                        </tr>
                                        :
                                        <>
                                            {playlist.map((track, id) => (
                                                <tr
                                                    key={id}
                                                    onClick={() => handleTrackSelection(id)}
                                                    className={id === currentTrack ? styles.activeTrack : ''}
                                                >
                                                    <td>{track.title}</td>
                                                    <td>{track.artist}</td>
                                                    <td>{playCounts[track.id] || 0}</td>
                                                    <td>{formatDate(track.created_at)}</td>
                                                    <td>{formatTime(track.duration)}</td>
                                                </tr>
                                            ))}
                                        </>
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.container}>

                        <div className={styles.audioPanel}>
                            <div className={styles.audioPlayer}>
                                <audio ref={audioRef} onTimeUpdate={updateProgressBar}>
                                    <source
                                        // src=""
                                        type="audio/mpeg"
                                    />
                                </audio>

                                {/* <div className={styles.currentSongInfo}>
                                    <p>{playlist[currentTrack].title}</p>
                                    <p>{playlist[currentTrack].artist}</p>
                                </div> */}

                                <div onClick={togglePlayPause}>
                                    <Button>
                                        {isPlaying ? <PauseSVG /> : <PlaySVG />}
                                    </Button>
                                </div>

                                {/* <div className={styles.playbackRateSlider}>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3"
                                        step="0.1"
                                        value={playbackRate}
                                        onChange={handlePlaybackRateChange}
                                    />
                                    <label>{playbackRate}</label>
                                </div> */}

                                <div className={styles.progressBackground}>
                                    {/* <span
                                        className={styles.previousTrack}
                                        onClick={previousTrack}
                                    >
                                        <PreviousTrackSVG />
                                    </span> */}

                                    <div className={styles.progressBarContainer} >
                                        <div className={styles.progressBarBackground} />
                                        <div
                                            ref={progressBarRef}
                                            className={styles.progressBar}
                                            onMouseDown={handleScrubStart}
                                            onMouseMove={handleScrubbing}
                                            onMouseUp={handleScrubEnd}
                                            onMouseLeave={handleScrubEnd}
                                        />
                                    </div>

                                    {/* <span
                                        className={styles.nextTrack}
                                        onClick={nextTrack}
                                    >
                                        <NextTrackSVG />
                                    </span> */}

                                    <p className={styles.duration} ref={durationRef}>
                                        0:00
                                    </p>

                                    <button
                                        onClick={toggleLoop}
                                        className={isLooping ? `${styles.loop} ${styles.loopActive}` : styles.loop}
                                    >
                                        <LoopSVG />
                                    </button>
                                </div>

                                {/* <div onClick={toggleMute}>
                                    <Button>
                                        {isMuted ? <UnmuteSVG /> : <MuteSVG />}
                                    </Button>
                                </div> */}

                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* <AudioTimeline
                audioRef={audioRef}
                playlist={playlist}
                currentTrack={playlist[currentTrack]}
                playTrack={playTrack}
                restartTrack={restartTrack}
                isPlaying={isPlaying}
                togglePlayPause={togglePlayPause}
                handleTrackSelection={handleTrackSelection}
                handleTrackEnd={handleTrackEnd}
                nextTrack={nextTrack}
            /> */}

        </>
    )
}

export default Audio


