'use client';

import toast from 'react-hot-toast';

export default function NavBarTabs() {
  const showComingSoon = () => {
    toast('Coming soon', { icon: '🚧' });
  };

  return (
    <div className="w-full bg-[#fbfbfb] px-4 pt-1 flex items-center gap-1 text-[15px] font-medium text-gray-700 border-b border-gray-100 shadow-sm">
      {/* Forms Tab (Active) */}
      <div className="relative flex flex-col items-center">
        <button className="bg-transparent text-gray-900 px-4 py-3 flex items-center gap-2 font-semibold cursor-pointer transition-colors relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
            <g clipPath="url(#489-8119__a)">
              <path fill="currentColor" d="M14.499 3.75a.25.25 0 0 0-.25-.25h-2.25v9h2.25a.25.25 0 0 0 .25-.25zM6.249 8.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1 0-1.5zm2-2.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5zm-6.75 6.25c0 .138.113.25.25.25h8.75v-9h-8.75a.25.25 0 0 0-.25.25zm14.5 0a1.75 1.75 0 0 1-1.75 1.75h-12.5A1.75 1.75 0 0 1 0 12.25v-8.5c0-.966.783-1.75 1.75-1.75h12.5c.966 0 1.75.784 1.75 1.75z"></path>
            </g>
            <defs>
              <clipPath id="489-8119__a">
                <path fill="currentColor" d="M0 0h16v16H0z"></path>
              </clipPath>
            </defs>
          </svg>
          <span>Forms</span>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-900 rounded-t-sm" />
        </button>
      </div>

      {/* Contacts Tab */}
      <button
        onClick={showComingSoon}
        className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
          <path fill="currentColor" d="M5.242 2.5a1.546 1.546 0 1 0 0 3.092 1.546 1.546 0 0 0 0-3.092M2.196 4.046a3.046 3.046 0 1 1 6.092 0 3.046 3.046 0 0 1-6.092 0M11.5 3.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2M9 4.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0m5.49 7.866c-.478-1.988-1.955-2.802-3.258-2.771a.75.75 0 1 1-.035-1.5c1.988-.046 4.103 1.225 4.752 3.92.27 1.125-.674 1.985-1.642 1.985h-1.955a.75.75 0 0 1 0-1.5h1.955a.22.22 0 0 0 .164-.066.1.1 0 0 0 .02-.035.1.1 0 0 0 0-.033M5.242 9.643c-1.53 0-3.207 1.122-3.716 3.686-.007.036 0 .068.03.101.034.038.093.07.167.07H8.76a.22.22 0 0 0 .166-.07c.03-.033.037-.065.03-.101-.508-2.564-2.185-3.686-3.715-3.686m0-1.5c2.353 0 4.56 1.738 5.187 4.894C10.646 14.133 9.747 15 8.76 15H1.723c-.987 0-1.885-.867-1.668-1.963.626-3.156 2.833-4.894 5.187-4.894" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
        <span>Contacts</span>
      </button>

      {/* Automations Tab */}
      <button
        onClick={showComingSoon}
        className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
          <g fill="currentColor" fillRule="evenodd" clipPath="url(#4220-23740__a)" clipRule="evenodd">
            <path d="M11.335 10.51a2.5 2.5 0 1 1 1.151 3.534A6.9 6.9 0 0 1 6.814 15.6a.75.75 0 0 1 .256-1.478 5.41 5.41 0 0 0 4.28-1.087 2.5 2.5 0 0 1-.015-2.525m2.665.384a1 1 0 1 0-1 1.733 1 1 0 0 0 1-1.733M2.75 4.304a.75.75 0 0 1 1.146.956l-.046.061a5.41 5.41 0 0 0-1.236 3.942 2.5 2.5 0 1 1-1.468.396A6.92 6.92 0 0 1 2.698 4.36zm.25 6.59a1 1 0 1 0-1 1.733 1 1 0 0 0 1-1.733M8 0a2.5 2.5 0 0 1 2.489 2.71c1.74.71 3.06 2.12 3.685 3.821a.75.75 0 0 1-1.409.518 5.08 5.08 0 0 0-2.842-2.952A2.5 2.5 0 1 1 8 0m0 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2"></path>
          </g>
          <defs>
            <clipPath id="4220-23740__a">
              <path fill="currentColor" d="M0 0h16v16H0z"></path>
            </clipPath>
          </defs>
        </svg>
        <span>Automations</span>
      </button>

      {/* Pages Tab */}
      <button
        onClick={showComingSoon}
        className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
          <path fill="currentColor" d="M7.72 8.224a.75.75 0 0 1 .797-.171l6.156 2.345c.849.324.86 1.521.018 1.862l-2.094.845-.841 2.088c-.34.844-1.539.833-1.862-.017L7.549 9.02a.75.75 0 0 1 .17-.797m3.12 5.224.484-1.198.032-.07a.75.75 0 0 1 .383-.345l1.208-.49-3.401-1.295z" fillRule="evenodd" clipRule="evenodd"></path>
          <path fill="currentColor" d="M4.5 3a.75.75 0 0 1 0 1.5H4A.75.75 0 0 1 4 3zM7.25 3a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5z"></path>
          <path fill="currentColor" d="M13.25 1c.966 0 1.75.784 1.75 1.75V8a.75.75 0 0 1-1.5 0V2.75a.25.25 0 0 0-.25-.25h-1.182l-1.81 2.759A2.75 2.75 0 0 1 7.959 6.5H2.5v5.25c0 .414.336.75.75.75h3.5a.75.75 0 0 1 0 1.5h-3.5A2.25 2.25 0 0 1 1 11.75v-9C1 1.784 1.784 1 2.75 1zM2.75 2.5a.25.25 0 0 0-.25.25V5h5.459a1.25 1.25 0 0 0 1.045-.564l1.27-1.936z" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
        <span>Pages</span>
        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
          Beta
        </span>
      </button>

      <div className="w-[1px] h-4 bg-gray-200 mx-1" />

      {/* Research Flow Tab */}
      <button
        onClick={showComingSoon}
        className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
          <path fill="currentColor" d="M12 8a.75.75 0 0 0 .75-.75c0-1.037.23-1.613.559-1.941.328-.33.904-.559 1.941-.559a.75.75 0 0 0 0-1.5c-1.037 0-1.613-.23-1.941-.559-.33-.328-.559-.904-.559-1.941a.75.75 0 0 0-1.5 0c0 1.037-.23 1.613-.559 1.941-.328.33-.904.559-1.941.559a.75.75 0 0 0 0 1.5c1.037 0 1.613.23 1.941.559.33.328.559.904.559 1.941 0 .414.336.75.75.75m1.25 6A1.75 1.75 0 0 0 15 12.25v-3.5a.75.75 0 0 0-1.5 0v3.5a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25v-8.5a.25.25 0 0 1 .25-.25h4.5l.077-.004a.75.75 0 0 0 0-1.492L6.25 2h-4.5A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14zm-5.5-6.5a.75.75 0 0 0 0-1.5h-4a.75.75 0 0 0 0 1.5zM6.25 10a.75.75 0 0 0 0-1.5h-2.5a.75.75 0 0 0 0 1.5z"></path>
        </svg>
        <span>Research Flow</span>
        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
          Demo
        </span>
      </button>
    </div>
  );
}
