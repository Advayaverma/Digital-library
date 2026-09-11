import React, { useEffect, useRef } from 'react';

export default function Home({ onNavigate }) {
  const cursorRef = useRef(null);
  const playBtnRef = useRef(null);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
      if (playBtnRef.current && videoContainerRef.current) {
        const rect = videoContainerRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          playBtnRef.current.style.left = `${e.clientX - 70}px`;
          playBtnRef.current.style.top = `${e.clientY - 80}px`;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleMouseEnterVideo = () => {
    if (playBtnRef.current) {
      playBtnRef.current.style.transform = 'scale(1)';
      playBtnRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeaveVideo = () => {
    if (playBtnRef.current) {
      playBtnRef.current.style.transform = 'scale(0)';
      playBtnRef.current.style.opacity = '0';
    }
  };

  return (
    <div>
      {/* Interactive Cursor */}
      <div id="cursor" ref={cursorRef}></div>

      {/* Main Sections */}
      <div id="main">
        {/* Page 1 - Hero Section */}
        <div id="page1">
          <h1>Welcome to the</h1>
          <h1>Digital Library</h1>
          <div
            id="video-container"
            ref={videoContainerRef}
            onMouseEnter={handleMouseEnterVideo}
            onMouseLeave={handleMouseLeaveVideo}
          >
            <div id="play" ref={playBtnRef}>EXPLORE</div>
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="https://images.unsplash.com/photo-1507842229451-7f01be802d68?auto=format&fit=crop&w=1600&q=80"
              src="https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-stack-of-old-books-40280-large.mp4"
            />
          </div>
        </div>

        {/* Page 2 - Showcase Books */}
        <div id="page2">
          <div id="elem1" className="elem">
            <img
              src="https://bukovero.com/wp-content/uploads/2016/07/Harry_Potter_and_the_Cursed_Child_Special_Rehearsal_Edition_Book_Cover.jpg"
              alt="Book 1"
            />
            <div className="dets"></div>
          </div>
          <div id="elem2" className="elem">
            <img
              src="https://images-platform.99static.com//SHOjRzTSbSa4mROeP_ok415_-Ok=/348x82:1219x953/fit-in/500x500/99designs-contests-attachments/124/124375/attachment_124375905"
              alt="Book 2"
            />
            <div className="dets"></div>
          </div>
          <div id="elem3" className="elem">
            <img
              src="https://m.media-amazon.com/images/I/71QUPsi6NaL.jpg"
              alt="Book 3"
            />
            <div className="dets"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
