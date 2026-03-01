export const TOAST_DURATION = 1800;

export const GRID_STYLES = `
  @keyframes gradient {
    0%, 100% { background-position: 0% 50%; }
    50%       { background-position: 100% 50%; }
  }
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 5s ease infinite;
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to   { opacity: 1; transform: scale(1)   translateY(0);    }
  }
  .animate-scaleIn {
    animation: scaleIn 0.4s ease-out forwards;
  }
  @keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%);  }
  }
`;