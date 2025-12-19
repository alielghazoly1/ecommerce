import { useEffect, useRef, useState } from "react";

const LazyImage = ({ src, alt, className }) => {
  const imgRef = useRef();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShow(true);
        observer.disconnect();
      }
    });

    observer.observe(imgRef.current);
  }, []);

  return (
    <div ref={imgRef}>
      {show && <img src={src} alt={alt} className={className}/>}
    </div>
  );
};

export default LazyImage;
