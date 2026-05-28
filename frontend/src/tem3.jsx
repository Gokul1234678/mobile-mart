// VideoLoader.jsx — add content prop
const VideoLoader = ({ loaderName = "loading", fullscreen = false, content = false, visible = true }) => {
  const videoSrc = loaderVideos[loaderName] || loaderVideos.loading;
  const modeClass = fullscreen ? "fullscreen" : content ? "content" : "inline";

  return (
    <div className={`video-loader ${modeClass} ${visible ? "show" : "hide"}`}>
      <video src={videoSrc} autoPlay loop muted playsInline />
    </div>
  );
};