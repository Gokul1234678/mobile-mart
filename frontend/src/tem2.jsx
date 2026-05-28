  import VideoLoader from "../components/VideoLoader";
  if (loading) return <VideoLoader loaderName="loading1" fullscreen />;


  <div className="dash-page">

  {loading ? (

    <div className="dash-loader-wrapper">
      <VideoLoader loaderName="loading" />
    </div>

  ) : (

    <>

      {/* PAGE HEADER */}

      {/* DASHBOARD CONTENT */}

    </>

  )}

</div>