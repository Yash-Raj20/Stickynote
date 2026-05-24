/**
 * Exports a DOM element as a PNG file download.
 */
export const exportAsPng = async (element: HTMLElement, filename = 'stickynotes-board.png') => {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // 2x for retina quality
    useCORS: true,
    allowTaint: true,
    logging: false,
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

/**
 * Exports a DOM element as a multi-page PDF file download.
 */
export const exportAsPdf = async (element: HTMLElement, filename = 'stickynotes-board.pdf') => {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width / 2, canvas.height / 2],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save(filename);
};
