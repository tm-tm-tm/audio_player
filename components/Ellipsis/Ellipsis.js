'use client'

import { useState, useEffect } from 'react'

const Ellipsis = () => {
    const [dots, setDots] = useState('')

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prevDots) => (prevDots === '...' ? '' : prevDots + '.'))
        }, 100)

        return () => clearInterval(interval)
    }, [])

    return (
        <span>
            {dots}
        </span>
    )
}

export default Ellipsis
