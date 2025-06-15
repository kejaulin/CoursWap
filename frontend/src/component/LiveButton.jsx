import { useState } from 'react';
import CreateMeetingPage from '../pages/CreateMeetingPage';
function LiveButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(false)}
        className={`fixed bottom-83 right-6 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow
          transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
        style={{ willChange: 'opacity, transform' }}
      >
        Fermer
      </button>

      <div
        className={`fixed bottom-6 right-6 z-40 bg-purple-700 text-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden rounded-xl
          ${isOpen ? 'w-64 h-76 p-4' : 'w-40 h-12 px-4 py-2 rounded-full hover:bg-purple-600'}
        `}
        style={{ transitionProperty: 'width, height, padding, border-radius' }}
      >
        {isOpen ? (
          <CreateMeetingPage />
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full h-full text-sm font-medium text-white hover:cursor-pointer"
          >
            Lancer un live
          </button>
        )}
      </div>
    </>
  );
}

export default LiveButton;
