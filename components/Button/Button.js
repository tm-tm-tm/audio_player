'use client'

import { useState } from 'react'
// import useSound from 'use-sound'
import styles from './Button.module.css'

const Button = ({ children, onClick }) => {
    const [selected, setSelected] = useState(false)

    // const [sound] = useSound('./audio/click.mp3', {
    //     playbackRate: 1,
    // })

    const handleSelection = () => {
        setSelected(!selected)
        // sound()

        // if (onClick) {
        //     onClick()
        // }
    }

    return (
        <>
            <div
                className={styles.background}
                onClick={handleSelection}
            >
                <button className={`${styles.middle} ${selected ? styles.selectedShadow : ''}`} onClick={onClick} />
                <div className={`${styles.inner} ${selected ? styles.selected : ''}`}>
                    {/* BUTTON */}
                    {children}
                </div>
            </div>
        </>

    )
}

export default Button
