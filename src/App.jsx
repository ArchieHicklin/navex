import { useState, useRef, useEffect } from 'react'
import './App.css'

import Lottie from '@lottielab/lottie-player/react'

function App() {
  const [activeTab, setActiveTab] = useState(-1)
  const lottieRefs = useRef({})

  const icons = [
    { url: '/home.json', id: 'icon1', title: 'Home' },
    { url: '/positions.json', id: 'icon2', title: 'Positions' },
    { url: '/points.json', id: 'icon3', title: 'Points' },
    { url: '/account.json', id: 'icon4', title: 'Account' }
  ]

  // Silent auto-correction system - monitors and fixes frame positions
  useEffect(() => {
    const interval = setInterval(() => {
      icons.forEach((icon, index) => {
        const ref = lottieRefs.current[icon.id]
        if (ref) {
          const currentFrame = ref.currentFrame || 0
          const currentTime = ref.currentTime || 0
          const isActive = index === activeTab
          const shouldBeAtZero = !isActive

          // Auto-fix if wrong (silently)
          if (shouldBeAtZero && (currentFrame > 0.1 || currentTime > 0.01)) {
            ref.currentTime = 0
            ref.pause()
          }
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTab, icons])


  const handleTabClick = (index) => {
    // Capture the current refs BEFORE updating state
    const previousActiveTab = activeTab
    const currentRef = previousActiveTab >= 0 ? lottieRefs.current[icons[previousActiveTab].id] : null
    const newRef = lottieRefs.current[icons[index].id]

    // Instantly snap previous tab back to frame 0
    if (currentRef && previousActiveTab !== index) {
      currentRef.currentTime = 0
      currentRef.pause()
    }

    // Play new tab animation forward smoothly
    if (newRef) {
      newRef.direction = 1
      newRef.speed = 1
      newRef.currentTime = 0
      newRef.play()
    }

    setActiveTab(index)
  }

  const handleLottieRef = (ref, iconId) => {
    if (ref) {
      lottieRefs.current[iconId] = ref

      // Force initialization to frame 0 with multiple attempts
      const initializeToFrameZero = () => {
        try {
          ref.currentTime = 0
          ref.pause()
          // Double-check it's actually at frame 0
          setTimeout(() => {
            if (ref.currentTime > 0) {
              ref.currentTime = 0
              ref.pause()
            }
          }, 50)
        } catch (error) {
          // Silent error handling
        }
      }

      // Try immediate initialization
      initializeToFrameZero()

      // Also try after a small delay to ensure Lottie is fully loaded
      setTimeout(initializeToFrameZero, 100)
    }
  }

  return (
    <div className="app">
      <div className="navbar">
        {icons.map((icon, index) => (
          <div
            key={icon.id}
            className={`icon-container ${index === activeTab ? 'active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            <Lottie
              ref={(ref) => handleLottieRef(ref, icon.id)}
              src={icon.url}
              className="lottie-icon"
              loop={false}
              autoplay={false}
              style={{ width: '28px', height: '28px' }}
              onLoad={() => {
                const ref = lottieRefs.current[icon.id]
                if (ref) {
                  // Force to frame 0 multiple times to ensure it sticks
                  const forceFrameZero = () => {
                    ref.currentTime = 0
                    ref.pause()
                  }

                  forceFrameZero()
                  setTimeout(forceFrameZero, 10)
                  setTimeout(forceFrameZero, 50)
                  setTimeout(forceFrameZero, 100)
                }
              }}
              onError={() => {
                // Silent error handling
              }}
            />
            {icon.title === 'Positions' && (
              <div className="notification-badge">
                <span>8</span>
              </div>
            )}
            <div className={`tab-title ${index === activeTab ? 'active' : ''}`}>
              {icon.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
