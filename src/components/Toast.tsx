import { useEffect, useState } from 'react';

export default function Toast({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white transition-opacity duration-200"
      style={{
        borderTop: '1px solid #E0E0E0',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div className="px-5 md:px-8 lg:px-12 py-4">
        <p
          className="font-jost font-light text-vd-meta text-center"
          style={{ fontSize: '12px' }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
