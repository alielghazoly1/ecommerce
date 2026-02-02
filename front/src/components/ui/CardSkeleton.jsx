// components/ui/CardSkeleton.jsx
import ContentLoader from "react-content-loader";

const CardSkeleton = ({
  width = 300,
  height = 380,
  imageHeight = 200,
  radius = 16,
}) => (
  <ContentLoader
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    backgroundColor="#f3f3f3"
    foregroundColor="#e5e7eb"
  >
    {/* image */}
    <rect x="0" y="0" rx={radius} ry={radius} width={width} height={imageHeight} />

    {/* title */}
    <rect x="20" y={imageHeight + 20} rx="6" ry="6" width={width * 0.6} height="18" />

    {/* price */}
    <rect x="20" y={imageHeight + 50} rx="6" ry="6" width={width * 0.3} height="16" />

    {/* button */}
    <rect
      x="20"
      y={imageHeight + 90}
      rx="10"
      ry="10"
      width={width - 40}
      height="40"
    />
  </ContentLoader>
);

export default CardSkeleton;
