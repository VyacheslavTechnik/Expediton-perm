function openPdfModal() {
  const modal = document.getElementById('pdf-modal');
  const pdfUrl = 'assets/documents/menu.pdf';
  document.getElementById('pdf-obj').src = pdfUrl;
  document.getElementById('pdf-dl-link').href = pdfUrl;
  modal.style.display = 'flex';
}
