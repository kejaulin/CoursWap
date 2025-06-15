import { useState, useRef, useEffect } from 'react';
import CreateMeetingPage from '../pages/CreateMeetingPage';

function LiveButton() {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          setContentHeight(entry.contentRect.height);
        }
      });
      observer.observe(contentRef.current);

      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-500">
      {isOpen && (
        <div className="mb-2 flex justify-end pr-1">
          <button
            onClick={() => setIsOpen(false)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-1 rounded shadow cursor-pointer">
            Fermer
          </button>
        </div>
      )}

      <div
        className={`bg-purple-700 text-white rounded-xl shadow-xl transition-all duration-500 ease-in-out overflow-hidden`}
        style={{
          width: isOpen ? '28rem' : '10rem',
          height: isOpen ? `${contentHeight + 24}px` : '2.5rem',
          padding: isOpen ? '0.75rem' : '0',
        }}>
        <div ref={contentRef}>
          {isOpen ? (
            <CreateMeetingPage />
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="w-full h-full text-sm font-semibold text-white cursor-pointer p-[0.5rem]">
              Lancer un live
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveButton;
