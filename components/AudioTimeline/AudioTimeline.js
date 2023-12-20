// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import supabase from '@/lib/supabase'
// import Image from 'next/image'
// import moment from 'moment'
// import styles from './AudioTimeline.module.css'

// const AudioTimeline = ({playlist}) => {
//     const [loading, setLoading] = useState(null)
//     const audioRef = useRef()

//     return (
//         <div className={styles.playlist}>
//             <div className={styles.playlistTracks}>
//                 {
//                 loading ?
//                     <p>
//                         Loading...
//                     </p>
//                     :
//                     <ul>
//                         {playlist.map((track, index) => (
//                             <li
//                                 key={index}
//                             >
//                                 <p>
//                                     {track.title}
//                                 </p>
//                                 <p>
//                                     {track.artist}
//                                 </p>
//                             </li>
//                         ))}
//                     </ul>
//                 }
//             </div>
//         </div>
//     )

// }

// export default AudioTimeline


import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import styles from './AudioTimeline.module.css'; // Import your CSS module here
import Ellipsis from '../Ellipsis/Ellipsis';

const AudioTimeline = ({ playlist, audioRef, currentTrack, isPlaying, togglePlayPause, handleTrackSelection, handlTrackEnd, nextTrack, playTrack, restartTrack }) => {
    const [loading, setLoading] = useState(null)
    const [currentTime, setCurrentTime] = useState(0);
    // const [isPlaying, setIsPlaying] = useState(false);
    // const audioRef = useRef()

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (audioRef.current && isPlaying) {
                setCurrentTime(audioRef.current.currentTime);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isPlaying, audioRef]);

    if (!playlist || playlist.length === 0 || !currentTrack) return null;
    const trackLength = currentTrack.duration; // Make sure you have a duration field in your track schema

    // Toggle play/pause
    // const togglePlay = () => {
    //     if (audioRef.current) {
    //         if (isPlaying) {
    //             audioRef.current.pause();
    //         } else {
    //             audioRef.current.play();
    //         }
    //         setIsPlaying(!isPlaying);
    //     }
    // };

    const generateMarkers = () => {
        const markers = [];
        const interval = 10; // Interval in seconds for markers
        for (let i = 0; i <= trackLength; i += interval) {
            markers.push(
                <div key={i} className={styles.marker} style={{ left: `${(i / trackLength) * 100}%` }}>
                    {i}
                </div>
            );
        }
        return markers;
    };

    return (
        <>
            {/* <div className={styles.playlist}> */}
            <div className={styles.timelineContainer}>

                <div className={styles.playlistTracks}>
                    {
                        loading ?
                            <ul>
                                <li>
                                    <p>
                                        loading <Ellipsis />
                                    </p>
                                </li>
                            </ul>
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
                                        <p>
                                            {/* {formatTime(track.duration)} */}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                    }
                </div>

                <div className={styles.timeline}>

                    <audio ref={audioRef} src={currentTrack.audio_Url} />
                    <button onClick={togglePlayPause}>
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    {generateMarkers()}

                    <div className={styles.trackSegment} style={{ width: `${(currentTrack.currentTime / trackLength) * 100}%` }} />
                    <div className={styles.currentTimeIndicator} style={{ left: `${(currentTime / trackLength) * 100}%` }} />

                </div>
            </div>

        </>

    );
};

export default AudioTimeline;




// import { format } from 'date-fns';

// const date = new Date(); // Example date, you can replace it with your date object

// // Format date as DD-MM-YYYY
// const formattedDate = format(date, 'dd-MM-yyyy');

// // Format time as HH:MM:SS
// const formattedTime = format(date, 'HH:mm:ss');

// console.log(`Formatted Date: ${formattedDate}`);
// console.log(`Formatted Time: ${formattedTime}`);


// 'use client'

// import { useState, useEffect, useRef } from 'react'
// import WaveSurfer from 'wavesurfer.js';
// import supabase from '@/lib/supabase'
// import Image from 'next/image'
// import moment from 'moment'
// import styles from './Audio.module.css'

// import Button from '../Button/Button'
// import PlaySVG from '@/assets/svg/PlaySVG'
// import PauseSVG from '@/assets/svg/PauseSVG'
// import MuteSVG from '@/assets/svg/MuteSVG'
// import UnmuteSVG from '@/assets/svg/UnmuteSVG'
// import PreviousTrackSVG from '@/assets/svg/PreviousTrackSVG'
// import NextTrackSVG from '@/assets/svg/NextTrackSVG'
// import LoopSVG from '@/assets/svg/LoopSVG'
// import Ellipsis from '../Ellipsis/Ellipsis'

// const Audio = () => {
//     const audioRef = useRef()
//     const progressBarRef = useRef()
//     const durationRef = useRef()
//     const waveformRef = useRef(null);

//     const [loading, setLoading] = useState(false)
//     const [imageLoading, setImageLoading] = useState(true);
//     const [playlist, setPlaylist] = useState([])
//     const [isPlaying, setIsPlaying] = useState(false)
//     const [isLooping, setIsLooping] = useState(false)
//     const [isMuted, setIsMuted] = useState(false)
//     const [isScrubbing, setIsScrubbing] = useState(false)
//     const [currentTrack, setCurrentTrack] = useState(null);
//     const [currentTrackDescription, setCurrentTrackDescription] = useState('');
//     const [currentTrackArtwork, setCurrentTrackArtwork] = useState(null);

//     useEffect(() => {
//         readPlaylist()
//     }, [])

//     useEffect(() => {
//         if (playlist.length > 0) {
//             const track = playlist[0];

//             setCurrentTrack(track);
//             audioRef.current.src = track.audio_Url;
//             waveformRef.current.load(track.audio_Url);
//             setCurrentTrackArtwork(track.artwork_Url);
//             setCurrentTrackDescription(track.description);
//         }
//     }, [playlist]);

//     useEffect(() => {
//         // Ensure the DOM has been rendered
//         setTimeout(() => {
//             if (!waveformRef.current) {
//                 waveformRef.current = WaveSurfer.create({
//                     interact: true,
//                     container: '#waveform',
//                     waveColor: 'silver',
//                     progressColor: 'grey',
//                     cursorWidth: 4,
//                     barWidth: 2,
//                     barHeight: 1,
//                     barGap: 2,
//                     barRadius: 4
//                 });
//             }
//         }, 0);

//         // Cleanup function
//         return () => {
//             if (waveformRef.current) {
//                 waveformRef.current.destroy();
//             }
//         };
//     }, []);


//     useEffect(() => {
//         const audio = audioRef.current;
//         const waveform = waveformRef.current;

//         const onTrackEnd = () => handleTrackEnd();

//         if (audio && waveform) {
//             audio.addEventListener('ended', onTrackEnd);
//             waveform.on('finish', onTrackEnd);
//         }

//         return () => {
//             if (audio && waveform) {
//                 audio.removeEventListener('ended', onTrackEnd);
//                 waveform.un('finish', onTrackEnd);
//             }
//         };
//     }, [currentTrack]);


//     const readPlaylist = async () => {
//         setLoading(true)

//         try {
//             const { data, error } = await supabase
//                 .from('Playlist')
//                 .select('*');

//             if (error) {
//                 console.error('Error fetching data:', error.message)
//                 return
//             }

//             // Fetch durations for each track
//             const tracksWithDurations = await Promise.all(data.map(async (track) => {
//                 const audio = document.createElement('audio');
//                 audio.src = track.audio_Url;

//                 return new Promise((resolve) => {
//                     audio.onloadedmetadata = () => {
//                         resolve({ ...track, duration: audio.duration });
//                     };
//                 });
//             }));

//             setPlaylist(tracksWithDurations);
//             console.log(tracksWithDurations)

//             // setPlaylist(data)
//             setLoading(false)
//         } catch (error) {
//             console.error('Error:', error.message)
//         }
//     }

//     // const handleTrackSelection = (index) => {
//     //     if (index === currentTrack) {
//     //         return;
//     //     }

//     //     audioRef.current.src = playlist[index].audio_Url;
//     //     setCurrentTrackArtwork(playlist[index].artwork_Url);
//     //     setCurrentTrackDescription(playlist[index].description);
//     //     setCurrentTrack(index)
//     //     restartTrack()
//     //     playTrack()
//     // };

//     // const handleTrackSelection = (index) => {
//     //     if (index === currentTrack) {
//     //         return;
//     //     }

//     //     const track = playlist[index];
//     //     const audio = audioRef.current;
//     //     const waveform = waveformRef.current;

//     //     if (audio && waveform) {
//     //         audio.src = track.audio_Url;
//     //         waveform.load(track.audio_Url);

//     //         setCurrentTrackArtwork(track.artwork_Url);
//     //         setCurrentTrackDescription(track.description);
//     //         setCurrentTrack(index);
//     //         // restartTrack();
//     //         playTrack();
//     //     }
//     // };

//     const handleTrackSelection = (index) => {
//         if (index === currentTrack) {
//             return;
//         }

//         const track = playlist[index];
//         const audio = audioRef.current;
//         const waveform = waveformRef.current;

//         if (audio && waveform) {
//             // Update state with new track information
//             setCurrentTrackArtwork(track.artwork_Url);
//             setCurrentTrackDescription(track.description);
//             setCurrentTrack(index);

//             // Load new track in WaveSurfer
//             audio.src = track.audio_Url;
//             waveform.load(track.audio_Url);

//             // Event listener for when waveform is ready
//             waveform.once('ready', () => {
//                 // Play the track when the waveform is ready
//                 playTrack();
//             });
//         }
//     };

//     const playTrack = () => {
//         const audio = audioRef.current;
//         const waveform = waveformRef.current;

//         if (audio && waveform) {
//             audio.play();
//             waveform.play();
//             setIsPlaying(true);
//         }
//     };

//     const togglePlayPause = () => {
//         const audio = audioRef.current;
//         const waveform = waveformRef.current;

//         if (audio && waveform) {
//             if (isPlaying) {
//                 audio.pause();
//                 waveform.pause();
//             } else {
//                 audio.play();
//                 waveform.play();
//             }
//             setIsPlaying(!isPlaying);
//         }
//     };


//     const restartTrack = () => {
//         audioRef.current.currentTime = 0;
//     }

//     const nextTrack = () => {
//         const waveform = waveformRef.current;
//         const nextTrack = currentTrack + 1;

//         if (nextTrack < playlist.length) {
//             audioRef.current.src = playlist[nextTrack].audio_Url;
//             waveformRef.current.load(playlist[nextTrack].audio_Url);
//             setCurrentTrack(nextTrack);
//             setCurrentTrackArtwork(playlist[nextTrack].artwork_Url);
//             setCurrentTrackDescription(playlist[nextTrack].description);
//         } else {
//             audioRef.current.src = playlist[0].audio_Url;
//             waveformRef.current.load(playlist[0].audio_Url);
//             setCurrentTrack(0);
//             setCurrentTrackArtwork(playlist[0].artwork_Url);
//             setCurrentTrackDescription(playlist[0].description);
//         }

//         // restartTrack();
//         // playTrack();

//         waveform.once('ready', () => {
//             // Play the track when the waveform is ready
//                     // restartTrack();
//             playTrack();
//         });
//     };

//     const previousTrack = () => {
//         const previousTrack = currentTrack - 1;

//         if (previousTrack >= 0) {
//             audioRef.current.src = playlist[previousTrack].audio_Url;
//             setCurrentTrack(previousTrack);
//             setCurrentTrackArtwork(playlist[previousTrack].artwork_Url);
//             setCurrentTrackDescription(playlist[previousTrack].description);
//         } else {
//             restartTrack();
//         }

//         playTrack();
//     };

//     const handleTrackEnd = () => {
//         if (isLooping) {
//             restartTrack();
//         } else {
//             nextTrack();
//         }
//     }

//     // const togglePlayPause = () => {
//     //     const audio = audioRef.current

//     //     if (audio) {
//     //         if (isPlaying) {
//     //             audio.pause()
//     //         } else {
//     //             audio.play()
//     //         }
//     //         setIsPlaying(!isPlaying)
//     //     }
//     // }

//     const toggleLoop = () => {
//         setIsLooping(!isLooping)

//         const audio = audioRef.current

//         if (audio) {
//             audio.loop = !isLooping
//         }
//     }

//     const toggleMute = () => {
//         const audio = audioRef.current

//         if (audio) {
//             audio.muted = !audio.muted
//             setIsMuted(audio.muted)
//         }
//     }

//     const formatDate = (timestamp) => {
//         return moment(timestamp).format('DD-MM-YYYY');
//     }

//     const formatTime = (timeInSeconds) => {
//         const duration = moment.duration(timeInSeconds, 'seconds')
//         const formattedTime = moment.utc(duration.asMilliseconds()).format('m:ss')
//         return formattedTime
//     }

//     const updateProgressBar = () => {
//         const audio = audioRef.current
//         const progressBar = progressBarRef.current

//         if (audio && progressBar && !isScrubbing) {
//             const currentTime = audio.currentTime
//             const duration = audio.duration

//             if (!isNaN(duration) && duration > 0) {
//                 const progress = (currentTime / duration) * 100
//                 progressBar.style.width = `${progress}%`
//                 durationRef.current.textContent = formatTime(currentTime)
//             }
//         }
//     };

//     const handleScrubStart = (e) => {
//         setIsScrubbing(true)
//         updateProgressBar(e)
//     }

//     const handleScrubbing = (e) => {
//         if (isScrubbing) {
//             const progressBar = progressBarRef.current;
//             const waveform = waveformRef.current;
//             const audio = audioRef.current;

//             if (!progressBar || !waveform || !audio) return;

//             const rect = progressBar.getBoundingClientRect();
//             const offsetX = e.clientX - rect.left;
//             const newProgress = offsetX / rect.width;

//             progressBar.style.width = `${newProgress * 100}%`;
//             audio.currentTime = newProgress * audio.duration;
//             waveform.seekTo(newProgress);
//         }
//     };



//     const handleScrubEnd = () => {
//         setIsScrubbing(false)
//     }

//     return (
//         <>
//             <div className={styles.playlistContainer}>
//                 <div className={styles.artworkContainer}>
//                     <div className={styles.artworkInner}>

//                         {imageLoading &&
//                             <p className={styles.imageLoading}>
//                                 Loading...
//                             </p>
//                         }

//                         {currentTrackArtwork && (
//                             <Image
//                                 src={currentTrackArtwork}
//                                 // width={360}
//                                 // height={360}
//                                 priority
//                                 fill
//                                 alt="Artwork"
//                                 className={styles.image}
//                                 onLoad={() => setImageLoading(false)}
//                             />
//                         )}
//                     </div>
//                 </div>

//                 {/* <div className={styles.descriptionContainer}>
//                     <div className={styles.descriptionInner}>
//                         {currentTrackDescription && (
//                             <p>
//                                 {currentTrackDescription}
//                             </p>
//                         )}
//                     </div>
//                 </div> */}

//                 <div className={styles.playlist}>
//                     <div className={styles.playlistTracks}>
//                         {
//                             loading ?
//                                 <ul>
//                                     <li>
//                                         <p>
//                                             loading <Ellipsis />
//                                         </p>
//                                     </li>
//                                 </ul>
//                                 :
//                                 <ul>
//                                     {playlist.map((track, index) => (
//                                         <li
//                                             key={index}
//                                             onClick={() => handleTrackSelection(index)}
//                                             className={index === currentTrack ? styles.activeTrack : ''}
//                                         >
//                                             <p>
//                                                 {track.title}
//                                             </p>
//                                             <p>
//                                                 {track.artist}
//                                             </p>
//                                             {/* <p>
//                                                 {formatDate(track.created_at)}
//                                             </p> */}
//                                             <p>
//                                                 {formatTime(track.duration)}
//                                             </p>
//                                         </li>
//                                     ))}
//                                 </ul>
//                         }
//                     </div>

//                     <div className={styles.container}>

//                         <div className={styles.audioPanel}>

//                             <div className={styles.audioPlayer}>
//                                 <audio
//                                     ref={audioRef}
//                                     onTimeUpdate={updateProgressBar}
//                                 >
//                                     <source
//                                         // src=""
//                                         type="audio/mpeg"
//                                     />
//                                 </audio>

//                                 {/* <div className={styles.currentSongInfo}>
//                                     <p>{playlist[currentTrack].title}</p>
//                                     <p>{playlist[currentTrack].artist}</p>
//                                 </div> */}

//                                 <div onClick={togglePlayPause}>
//                                     <Button>
//                                         {isPlaying ? <PauseSVG /> : <PlaySVG />}
//                                     </Button>
//                                 </div>

//                                 <div
//                                     className={styles.progressBackground}
//                                 >
//                                     {/* <div>
//                                         <span
//                                             className={styles.previousTrack}
//                                             onClick={previousTrack}
//                                         >
//                                             <PreviousTrackSVG />
//                                         </span>
//                                     </div> */}

//                                     <div className={styles.progressBarContainer} >
//                                         <div className={styles.progressBarBackground} />
//                                         <div
//                                             ref={progressBarRef}
//                                             className={styles.progressBar}
//                                             onMouseDown={handleScrubStart}
//                                             onMouseMove={handleScrubbing}
//                                             onMouseUp={handleScrubEnd}
//                                             onMouseLeave={handleScrubEnd}
//                                         />

//                                     </div>

//                                     {/* <div>
//                                         <span
//                                             className={styles.nextTrack}
//                                             onClick={nextTrack}
//                                         >
//                                             <NextTrackSVG />
//                                         </span>
//                                     </div> */}

//                                     <div>
//                                         <p
//                                             className={styles.duration}
//                                             ref={durationRef}
//                                         >
//                                             0:00
//                                         </p>
//                                     </div>

//                                     <div>
//                                         <button
//                                             onClick={toggleLoop}
//                                             className={isLooping ? `${styles.loop} ${styles.loopActive}` : styles.loop}
//                                         >
//                                             {isLooping ?
//                                                 <span >
//                                                     <LoopSVG />
//                                                 </span>
//                                                 :
//                                                 <span >
//                                                     <LoopSVG />
//                                                 </span>
//                                             }
//                                         </button>
//                                     </div>
//                                 </div>

//                                 {/* <div onClick={toggleMute}>
//                                     <Button>
//                                         {isMuted ? <UnmuteSVG /> : <MuteSVG />}
//                                     </Button>
//                                 </div> */}

//                             </div>
//                         </div>
//                     </div>
//                 </div>

//             </div>

//             <div className={styles.waveformContainer} id="waveform"></div>

//         </>
//     )
// }

// export default Audio


