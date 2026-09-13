interface SplitPosition {
  startY: number;
  height: number;
}

interface SplitOptions {
  mode: SplitMode;
  height: number;
  overlap: number;
  totalHeight: number;
}

interface ElementMeasure {
  top: number;
  height: number;
}

function getMarkdownContentRoot(container: HTMLElement): HTMLElement | undefined {
  const markdownContainer = container.querySelector<HTMLElement>('.export-image-markdown');
  if (!markdownContainer) return undefined;

  return (
    markdownContainer.children.length === 1
    && markdownContainer.firstElementChild instanceof HTMLElement
    && markdownContainer.firstElementChild.tagName === 'DIV'
  )
    ? markdownContainer.firstElementChild
    : markdownContainer;
}

function getBlockMeasures(container: HTMLElement): ElementMeasure[] {
  const contentRoot = getMarkdownContentRoot(container);
  if (!contentRoot) return [];

  const blocks = Array.from(contentRoot.children);
  const containerRect = container.getBoundingClientRect();
  return blocks.map((block, index) => {
    const rect = block.getBoundingClientRect();
    const top = rect.top - containerRect.top;
    const next = blocks[index + 1];
    if (next) {
      const nextRect = next.getBoundingClientRect();
      return { top, height: Math.max(0, nextRect.top - rect.top) };
    }
    return { top, height: rect.height };
  });
}

function getTextLineMeasures(container: HTMLElement): ElementMeasure[] {
  const contentRoot = getMarkdownContentRoot(container);
  if (!contentRoot) return [];

  const containerRect = container.getBoundingClientRect();
  const walker = activeDocument.createTreeWalker(contentRoot, NodeFilter.SHOW_TEXT);
  const measures: ElementMeasure[] = [];
  let node = walker.nextNode();

  while (node) {
    if (node.textContent?.trim()) {
      const range = activeDocument.createRange();
      range.selectNodeContents(node);
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.height > 0) {
          measures.push({
            top: rect.top - containerRect.top,
            height: rect.height,
          });
        }
      }
      range.detach();
    }
    node = walker.nextNode();
  }

  return measures;
}

function isHorizontalRuleDelimiter(delimiter: string): boolean {
  const compact = delimiter.replaceAll(/\s+/g, '');
  return compact === '---' || compact === '***' || compact === '___';
}

export function getElementMeasures(
  container: HTMLElement,
  mode: SplitMode,
  delimiter = '---',
): ElementMeasure[] {
  const containerRect = container.getBoundingClientRect();

  if (mode === 'hr') {
    return Array.from(container.querySelectorAll('hr')).map(hr => {
      const rect = hr.getBoundingClientRect();
      return { top: rect.top - containerRect.top, height: rect.height };
    });
  }

  if (mode === 'delimiter') {
    const contentRoot = getMarkdownContentRoot(container);
    if (!contentRoot) return [];
    const normalizedDelimiter = delimiter.trim();
    return Array.from(contentRoot.children)
      .filter(element => (
        (element.tagName === 'HR' && isHorizontalRuleDelimiter(normalizedDelimiter))
        || element.textContent?.trim() === normalizedDelimiter
      ))
      .map(element => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top - containerRect.top, height: rect.height };
      });
  }

  if (mode === 'auto' || mode === 'paragraph') {
    return getBlockMeasures(container);
  }

  if (mode === 'fixed') {
    return getTextLineMeasures(container);
  }

  return [];
}

function normalizeBreaks(elements: ElementMeasure[] | undefined, totalHeight: number): number[] {
  if (!elements?.length) return [];

  const breaks = new Set<number>([0, totalHeight]);
  for (const element of elements) {
    breaks.add(Math.max(0, Math.min(totalHeight, element.top)));
    breaks.add(Math.max(0, Math.min(totalHeight, element.top + element.height)));
  }
  return Array.from(breaks).sort((a, b) => a - b);
}

function calculateFixedPositions(
  height: number,
  overlap: number,
  totalHeight: number,
  elements?: ElementMeasure[],
): SplitPosition[] {
  if (totalHeight <= 0) return [];

  const safeOverlap = Math.max(0, overlap);
  const effectiveHeight = Math.max(height, safeOverlap + 50, 1);
  const safeBreaks = normalizeBreaks(elements, totalHeight);

  if (!safeBreaks.length) {
    const step = Math.max(1, effectiveHeight - safeOverlap);
    const positions: SplitPosition[] = [];
    for (let startY = 0; startY < totalHeight; startY += step) {
      const pageHeight = Math.min(effectiveHeight, totalHeight - startY);
      positions.push({ startY, height: pageHeight });
      if (startY + pageHeight >= totalHeight) break;
    }
    return positions;
  }

  const positions: SplitPosition[] = [];
  let startY = 0;
  while (startY < totalHeight) {
    const desiredEnd = Math.min(totalHeight, startY + effectiveHeight);
    const candidates = safeBreaks.filter(point => point > startY + 1 && point <= desiredEnd);
    let endY = candidates.at(-1);
    if (endY === undefined) {
      endY = safeBreaks.find(point => point > desiredEnd) ?? totalHeight;
    }
    if (endY <= startY) {
      endY = Math.min(totalHeight, startY + effectiveHeight);
    }

    positions.push({ startY, height: endY - startY });
    if (endY >= totalHeight) break;

    const desiredNextStart = Math.max(startY + 1, endY - safeOverlap);
    const overlapCandidates = safeBreaks.filter(point => point > startY && point <= desiredNextStart);
    const nextStart = overlapCandidates.at(-1) ?? endY;
    startY = nextStart > startY ? nextStart : endY;
  }

  return positions;
}

function calculateDelimiterPositions(
  elements: ElementMeasure[],
  totalHeight: number,
): SplitPosition[] {
  const positions: SplitPosition[] = [];
  let lastY = 0;

  for (const marker of [...elements].sort((a, b) => a.top - b.top)) {
    const markerTop = Math.max(lastY, Math.min(totalHeight, marker.top));
    if (markerTop > lastY) {
      positions.push({ startY: lastY, height: markerTop - lastY });
    }
    lastY = Math.max(markerTop, Math.min(totalHeight, marker.top + marker.height));
  }

  if (lastY < totalHeight) {
    positions.push({ startY: lastY, height: totalHeight - lastY });
  }
  return positions.length ? positions : [{ startY: 0, height: totalHeight }];
}

function calculateParagraphPositions(
  elements: ElementMeasure[],
  totalHeight: number,
): SplitPosition[] {
  if (!elements.length) return [{ startY: 0, height: totalHeight }];

  const starts = [0, ...elements.slice(1).map(element => element.top)]
    .map(value => Math.max(0, Math.min(totalHeight, value)))
    .filter((value, index, values) => index === 0 || value > values[index - 1]);

  return starts.map((startY, index) => {
    const endY = starts[index + 1] ?? totalHeight;
    return { startY, height: Math.max(0, endY - startY) };
  }).filter(position => position.height > 0);
}

export function calculateSplitPositions(
  options: SplitOptions,
  elements?: ElementMeasure[],
): SplitPosition[] {
  const { mode, height, overlap, totalHeight } = options;

  if (mode === 'none') {
    return [{ startY: 0, height: totalHeight }];
  }

  if (mode === 'hr') {
    const splitPoints = (elements ?? [])
      .map(element => element.top)
      .filter(y => y > 0 && y < totalHeight)
      .sort((a, b) => a - b);
    let lastY = 0;
    const positions: SplitPosition[] = [];
    for (const currentY of splitPoints) {
      if (currentY > lastY) {
        positions.push({ startY: lastY, height: currentY - lastY });
      }
      lastY = currentY;
    }
    if (lastY < totalHeight) {
      positions.push({ startY: lastY, height: totalHeight - lastY });
    }
    return positions;
  }

  if (mode === 'delimiter') {
    return calculateDelimiterPositions(elements ?? [], totalHeight);
  }

  if (mode === 'paragraph') {
    return calculateParagraphPositions(elements ?? [], totalHeight);
  }

  if (mode === 'auto' && elements?.length) {
    const positions: SplitPosition[] = [];
    let currentStartY = 0;
    let currentHeight = 0;
    const effectiveHeight = Math.max(height, 1);

    for (let i = 0; i < elements.length; i++) {
      const item = elements[i];
      currentHeight += item.height + (i === 0 ? item.top : 0);
      if (currentHeight >= effectiveHeight) {
        positions.push({ startY: currentStartY, height: currentHeight });
        currentStartY += currentHeight;
        currentHeight = 0;
        continue;
      }
      const nextItem = elements[i + 1];
      if (!nextItem) continue;
      const delta = effectiveHeight - currentHeight;
      if (delta < nextItem.height / 2) {
        positions.push({ startY: currentStartY, height: currentHeight });
        currentStartY += currentHeight;
        currentHeight = 0;
      }
    }
    if (currentStartY < totalHeight) {
      positions.push({ startY: currentStartY, height: totalHeight - currentStartY });
    }
    return positions;
  }

  return calculateFixedPositions(height, overlap, totalHeight, elements);
}

export function calculateSplitLines(
  options: SplitOptions,
  elements?: ElementMeasure[],
): number[] {
  const positions = calculateSplitPositions(options, elements);
  return positions.slice(0, -1).map(position => position.startY + position.height);
}
