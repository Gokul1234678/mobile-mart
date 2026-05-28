import "../assets/styles/videoLoader.css";
import { loaderVideos } from "../config/loaderVideos";

// old code
// const VideoLoader = ({
//   // props with defaults
//   loaderName = "loading",
//   fullscreen = false,// if true, loader covers entire screen; if false, it can be used inline
//   visible = true,
// }) => {
//   // Select video source based on loaderName prop, fallback to default if not found
//   const videoSrc = loaderVideos[loaderName] || loaderVideos.loading;// what is this condition for? if loaderName is not found in loaderVideos, it will use loading as default video

//   return (
//     <div
//       className={`video-loader 
//         ${fullscreen ? "fullscreen" : "inline"} 
//         ${visible ? "show" : "hide"}
//       `}
//     >
//       <video
//         src={videoSrc}
//         autoPlay
//         loop
//         muted
//         playsInline
//       />
//     </div>
//   );
// };

const VideoLoader = ({ 
  loaderName = "loading", // default loader video if not specified
   fullscreen = false, // if true, loader covers entire screen; if false, it can be used inline
   content = false, // in simple terms, content mode is a middle ground between fullscreen and inline. It fills the main content area but doesn't cover the sidebar or navbar. Perfect for page-level loading states.
   visible = true // if false, the loader is hidden but still mounted in the DOM. This allows for smoother transitions when toggling visibility without unmounting the component
   }) => {

    // Select video source based on loaderName prop, fallback to default if not found
  const videoSrc = loaderVideos[loaderName] || loaderVideos.loading;

  // Determine CSS class based on mode props. Fullscreen takes precedence over content, which takes precedence over inline. This allows for flexible styling based on the intended use case of the loader.
  const modeClass = fullscreen ? "fullscreen" : content ? "content" : "inline";

  return (
    <div className={`video-loader ${modeClass} ${visible ? "show" : "hide"}`}>
      <video src={videoSrc} autoPlay loop muted playsInline />
    </div>
  );
};

export default VideoLoader;
