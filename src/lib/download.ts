import { toPng } from 'html-to-image';

export async function downloadCard(node: HTMLElement, filename: string) {
  // Force a clean cream background, high pixel ratio, and ignore any
  // backdrop/blur/inline data: URL backgrounds that html-to-image can mishandle.
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#faf7f2',
    style: {
      backgroundColor: '#faf7f2',
      // wipe any inherited noise/texture from ancestors
      backgroundImage: 'none',
    },
    filter: (n) => {
      // Skip nodes that explicitly opt out
      if (n instanceof HTMLElement && n.dataset.htmlToImageIgnore === 'true') return false;
      return true;
    },
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
