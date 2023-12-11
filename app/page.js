import Audio from '@/components/Audio/Audio'
import styles from './page.module.css'

export const metadata = {
  title: "Audio Player",
  description:
    "An Audio Player",
  openGraph: {
    siteName: "Audio Player",
    title: "Audio Player",
    description:
      "Audio Player",
  }
}

export default function Home() {
  
  return (
    <main className={styles.main}>

      <div className={styles.container}>
        <Audio />
      </div>

    </main>
  )
}
