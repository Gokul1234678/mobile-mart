import "../assets/styles/videoLoader.css";
import { loaderVideos } from "../config/loaderVideos";

const VideoLoader = ({
  loaderName = "loading",
  fullscreen = false,
  visible = true,
}) => {
  const videoSrc = loaderVideos[loaderName] || loaderVideos.loading;

  return (
    <div
      className={`video-loader 
        ${fullscreen ? "fullscreen" : "inline"} 
        ${visible ? "show" : "hide"}
      `}
    >
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};

export default VideoLoader;
