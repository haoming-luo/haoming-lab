"""Guard prompt backgrounds and raster figures against text overlap."""
from pathlib import Path
import pdfplumber

root = Path(__file__).resolve().parents[1]
for path in sorted((root / 'public/learn').glob('AgentFEM-first-simulations*.pdf')):
    with pdfplumber.open(path) as pdf:
        assert len(pdf.pages) == 10, (path.name, 'page count')
        for page in pdf.pages:
            words = page.extract_words()
            for image in page.images:
                for word in words:
                    dx = min(image['x1'], word['x1']) - max(image['x0'], word['x0'])
                    dy = min(image['bottom'], word['bottom']) - max(image['top'], word['top'])
                    assert min(dx, dy) <= 1, (path.name, page.page_number, 'image overlaps', word['text'])
            for rect in page.rects:
                color = rect.get('non_stroking_color')
                if not isinstance(color, (tuple, list)) or len(color) != 3:
                    continue
                if not all(abs(c - 243/255) < .001 for c in color) or rect['width'] < 400:
                    continue
                for word in words:
                    dx = min(rect['x1'], word['x1']) - max(rect['x0'], word['x0'])
                    dy = min(rect['bottom'], word['bottom']) - max(rect['top'], word['top'])
                    if min(dx, dy) > 1:
                        assert (word['top'] >= rect['top'] - 1 and word['bottom'] <= rect['bottom'] + 1), (path.name, page.page_number, 'prompt edge', word['text'])
    print(path.name, '10 pages; no image/text or prompt-edge overlap')
