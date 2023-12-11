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

const Audio = () => {
    const audioRef = useRef()
    const progressBarRef = useRef()
    const durationRef = useRef()
    const [loading, setLoading] = useState(false)
    const [imageLoading, setImageLoading] = useState(true);
    const [playlist, setPlaylist] = useState([])
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLooping, setIsLooping] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isScrubbing, setIsScrubbing] = useState(false)
    const [currentTrack, setCurrentTrack] = useState(0);
    const [currentTrackArtwork, setCurrentTrackArtwork] = useState(null);

    useEffect(() => {
        // audioRef.current.src = playlist[0].audioURL
        // setCurrentTrackArtwork(playlist[0].artworkUrl);
        readPlaylist()
    }, [])

    useEffect(() => {
        // Set the initial track from the dynamic datad        
        if (playlist.length > 0) {
            audioRef.current.src = playlist[0].audio_Url;
            setCurrentTrackArtwork(playlist[0].artwork_Url);
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
                .select('*');

            if (error) {
                console.error('Error fetching data:', error.message)
                return
            }

            setPlaylist(data)
            setLoading(false)
        } catch (error) {
            console.error('Error:', error.message)
        }
    }

    const handleTrackSelection = (index) => {
        if (index === currentTrack) {
            return;
        }

        audioRef.current.src = playlist[index].audio_Url;
        setCurrentTrackArtwork(playlist[index].artwork_Url);
        setCurrentTrack(index)
        restartTrack()
        playTrack()
    };

    const playTrack = () => {
        audioRef.current.play()
        setIsPlaying(true)
    }

    const restartTrack = () => {
        audioRef.current.currentTime = 0;
    }

    const nextTrack = () => {
        const nextTrack = currentTrack + 1;

        if (nextTrack < playlist.length) {
            audioRef.current.src = playlist[nextTrack].audio_Url;
            setCurrentTrack(nextTrack);
            setCurrentTrackArtwork(playlist[nextTrack].artwork_Url);
        } else {
            audioRef.current.src = playlist[0].audio_Url;
            setCurrentTrack(0);
            setCurrentTrackArtwork(playlist[0].artwork_Url);
        }

        restartTrack();
        playTrack();
    };

    const previousTrack = () => {
        const previousTrack = currentTrack - 1;

        if (previousTrack >= 0) {
            audioRef.current.src = playlist[previousTrack].audio_Url;
            setCurrentTrack(previousTrack);
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

    const togglePlayPause = () => {
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

    const formatDate = (timestamp) => {
        return moment(timestamp).format('DD-MM-YYYY');
    }

    const formatTime = (timeInSeconds) => {
        const duration = moment.duration(timeInSeconds, 'seconds')
        const formattedTime = moment.utc(duration.asMilliseconds()).format('m:ss')
        return formattedTime
    }

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

    return (
        <>
            <div className={styles.playlistContainer}>
                <div className={styles.artworkContainer}>
                    <div className={styles.artworkInner}>

                        {imageLoading &&
                            <p className={styles.imageLoading}>
                                loading...
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
                                onLoad={() => setImageLoading(false)}
                            />
                        )}
                    </div>
                </div>

                <div className={styles.playlist}>
                    {/* <p className={styles.playlistTitle}>
                        PLAYLIST
                    </p> */}
                    <div className={styles.playlistTracks}>
                        {
                            loading ?
                                <p>
                                    Loading...
                                </p>
                                :
                                <ul>
                                    {playlist.map((track, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleTrackSelection(index)}
                                            className={index === currentTrack ? styles.activeTrack : ''}
                                        >
                                            <p>
                                                {track.title}
                                            </p>
                                            <p>
                                                {track.artist}
                                            </p>
                                            {/* <p>
                                                {formatDate(track.created_at)}
                                            </p> */}
                                        </li>
                                    ))}
                                </ul>
                        }
                    </div>

                    <div className={styles.container}>

                        <div className={styles.audioPanel}>

                            <div className={styles.audioPlayer}>
                                <audio
                                    ref={audioRef}
                                    onTimeUpdate={updateProgressBar}
                                >
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

                                <div
                                    className={styles.progressBackground}
                                >
                                    {/* <div>
                                        <span
                                            className={styles.previousTrack}
                                            onClick={previousTrack}
                                        >
                                            <PreviousTrackSVG />
                                        </span>
                                    </div> */}

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

                                    {/* <div>
                                        <span
                                            className={styles.nextTrack}
                                            onClick={nextTrack}
                                        >
                                            <NextTrackSVG />
                                        </span>
                                    </div> */}

                                    <div>
                                        <p
                                            className={styles.duration}
                                            ref={durationRef}
                                        >
                                            0:00
                                        </p>
                                    </div>

                                    <div>
                                        <button
                                            onClick={toggleLoop}
                                            className={isLooping ? `${styles.loop} ${styles.loopActive}` : styles.loop}
                                        >
                                            {isLooping ?
                                                <span >
                                                    <LoopSVG />
                                                </span>
                                                :
                                                <span >
                                                    <LoopSVG />
                                                </span>
                                            }
                                        </button>
                                    </div>
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
            </div>
        </>
    )
}

export default Audio


