'use client';

import toast from 'react-hot-toast';

export default function TopBar() {
  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  return (
    <header className="w-full bg-white px-4 py-2 flex items-center justify-between z-30 sticky top-0 border-b border-gray-100 h-14">
      {/* Far Left: Typeform Logo + Workspace Switcher */}
      <div className="flex items-center gap-1">
        {/* Typeform Official Logo SVG */}
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="11" height="32">
            <path fill="#191919" d="M6 0C2 0 0 3 0 8v16c0 5 2 8 6 8 3 0 5-3 5-8V8c0-5-2-8-5-8Z"></path>
          </svg>
        </div>

        {/* Workspace Account Switcher */}
        <button
          onClick={showComingSoon}
          className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#d9534f] text-white font-bold text-sm flex items-center justify-center">
            K
          </div>
          <span className="text-[15px] font-medium text-gray-900 tracking-tight ml-1">
            kunalsharma1165
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" className="text-gray-500 ml-0.5">
            <path fill="currentColor" d="M7.116 10.847a1.25 1.25 0 0 0 1.768 0L12.78 6.95a.75.75 0 0 0-1.06-1.06L8 9.61 4.28 5.89a.75.75 0 0 0-1.06 1.06z" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
        </button>
      </div>

      {/* Far Right: Integrations, Brand Kit, View Plans, Help, User Avatar */}
      <div className="flex items-center gap-3 pr-2">
        <button
          onClick={showComingSoon}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[15px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
            <g clipPath="url(#489-8142__a)">
              <path fill="currentColor" d="M12 .75a.75.75 0 0 1 .75.75v1.75h1.75a.75.75 0 0 1 0 1.5h-1.75V6.5a.75.75 0 0 1-1.5 0V4.75H9.5a.75.75 0 0 1 0-1.5h1.75V1.5A.75.75 0 0 1 12 .75M1 2.25C1 1.56 1.56 1 2.25 1h3.5C6.44 1 7 1.56 7 2.25v3.5C7 6.44 6.44 7 5.75 7h-3.5C1.56 7 1 6.44 1 5.75zm1.5.25v3h3v-3zM.75 12a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0M4 10.25a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5m5 0C9 9.56 9.56 9 10.25 9h3.5c.69 0 1.25.56 1.25 1.25v3.5c0 .69-.56 1.25-1.25 1.25h-3.5C9.56 15 9 14.44 9 13.75zm1.5.25v3h3v-3z" fillRule="evenodd" clipRule="evenodd"></path>
            </g>
            <defs>
              <clipPath id="489-8142__a">
                <path fill="currentColor" d="M0 0h16v16H0z"></path>
              </clipPath>
            </defs>
          </svg>
          <span>Integrations</span>
        </button>

        <button
          onClick={showComingSoon}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[15px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path fill="currentColor" d="M4.378 1.5a.09.09 0 0 0-.069.033L3.17 2.959a.25.25 0 0 0-.055.156V6.5h2.528V3.115a.25.25 0 0 0-.055-.157l-1.14-1.425a.09.09 0 0 0-.069-.033m0-1.5c.483 0 .939.22 1.24.596l1.14 1.425c.249.31.384.696.384 1.094V6.5h.914V1.75c0-.966.783-1.75 1.75-1.75h2.833c.966 0 1.75.784 1.75 1.75V6.5h.861a.75.75 0 0 1 .75.75v6A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 1 1 0 13.25v-6a.75.75 0 0 1 .75-.75h.864V3.115c0-.398.135-.783.384-1.094L3.138.596A1.59 1.59 0 0 1 4.378 0M1.5 8v5.25c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V8zm8.056-1.5h3.333V1.75a.25.25 0 0 0-.25-.25H9.806a.25.25 0 0 0-.25.25V3h.944a.75.75 0 0 1 0 1.5h-.944z" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
          <span>Brand kit</span>
        </button>

        <button
          onClick={showComingSoon}
          className="bg-[#137752] hover:bg-[#0f6042] border-none text-white text-[14px] font-medium px-4 py-1.5 rounded-md transition-colors cursor-pointer mr-1"
        >
          View plans
        </button>

        <button
          onClick={showComingSoon}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
          title="Help"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" aria-hidden="true">
            <g clipPath="url(#489-8066__a)">
              <path fill="currentColor" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.081-2.717c-.267.228-.394.496-.394.736a.75.75 0 0 1-1.5 0c0-.78.405-1.436.919-1.876.512-.438 1.197-.721 1.894-.721s1.382.283 1.894.72c.514.44.918 1.096.918 1.877 0 .63-.176 1.12-.477 1.512-.255.334-.585.568-.817.733l-.05.036c-.265.189-.422.313-.533.471-.094.135-.186.34-.186.729a.75.75 0 1 1-1.5 0c0-.66.166-1.175.459-1.591.275-.391.632-.647.884-.827l.003-.002c.282-.202.438-.316.55-.462.086-.111.168-.274.168-.6 0-.24-.127-.507-.394-.735A1.47 1.47 0 0 0 8 4.922c-.304 0-.65.13-.919.36m.918 5.842a.75.75 0 0 1 .75.75v.032a.75.75 0 0 1-1.5 0v-.032a.75.75 0 0 1 .75-.75" fillRule="evenodd" clipRule="evenodd"></path>
            </g>
            <defs>
              <clipPath id="489-8066__a">
                <path fill="currentColor" d="M0 0h16v16H0z"></path>
              </clipPath>
            </defs>
          </svg>
        </button>

        <button
          onClick={showComingSoon}
          className="w-8 h-8 rounded-full bg-[#f8c8c8] text-[#4a2626] font-bold text-xs flex items-center justify-center flex-shrink-0 cursor-pointer ml-1 hover:opacity-90 transition-opacity"
        >
          KS
        </button>
      </div>
    </header>
  );
}
