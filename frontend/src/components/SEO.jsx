// Import Helmet component from react-helmet-async
// Helmet is used to update the <head> section of the HTML document
import { Helmet } from "react-helmet-async";

// SEO reusable component
// This component helps us set page title and meta description dynamically
const SEO = ({
  // Page title (shown in browser tab & Google search)
  // Default title is used if no title is passed
  title = "Mobile Mart",

  // Meta description (used by search engines & social previews)
  // Default description is used if none is provided
  description = "Buy the latest smartphones at best prices from Mobile Mart",
}) => {
  return (
    // Helmet injects these values into the <head> tag of index.html
    <Helmet>
      {/* Sets the browser tab title */}
      <title>{title}</title>

      {/* Sets the meta description for SEO */}
      <meta name="description" content={description} />
    </Helmet>
  );
};

// Export SEO component so it can be used in all pages
export default SEO;
