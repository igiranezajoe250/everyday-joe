/* Route-scoped theme bootstrap for the Reading experience.
   Runs synchronously before the reader paints, so the saved (or system)
   theme is applied with no flash of the wrong colours. Scope is limited
   to this route — the rest of the site is untouched. */
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('tbl-theme');
    if (t !== 'light' && t !== 'dark') {
      t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      {children}
    </>
  );
}
