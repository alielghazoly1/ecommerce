import { useEffect, useRef, useState } from "react";

const LazyImage = ({ src, alt, className }) => {
  const imgRef = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const element = imgRef.current;
    // ✅ تأكد إن الـ element موجود قبل الـ observe
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShow(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    // ✅ cleanup عند الـ unmount
    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <div ref={imgRef} className="w-full h-full">
      {show && (
        <img
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;